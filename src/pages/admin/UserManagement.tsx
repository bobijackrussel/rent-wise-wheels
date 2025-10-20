import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";

export default function UserManagement() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const roleMap = new Map<string, string[]>();
      roles?.forEach(r => {
        if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
        roleMap.get(r.user_id)?.push(r.role);
      });

      return profiles?.map(p => ({
        ...p,
        roles: roleMap.get(p.id) || []
      }));
    },
  });

  const toggleAdminRole = useMutation({
    mutationFn: async ({ userId, hasAdmin }: { userId: string; hasAdmin: boolean }) => {
      if (hasAdmin) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated");
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading users...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.phone || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.roles?.map((role: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(user.created_at), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant={user.roles?.includes("admin") ? "destructive" : "default"}
                    onClick={() =>
                      toggleAdminRole.mutate({
                        userId: user.id,
                        hasAdmin: user.roles?.includes("admin"),
                      })
                    }
                  >
                    {user.roles?.includes("admin") ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remove Admin
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Make Admin
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
