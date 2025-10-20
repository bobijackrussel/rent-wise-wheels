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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ViolationManagement() {
  const queryClient = useQueryClient();

  const { data: violations, isLoading } = useQuery({
    queryKey: ["admin-violations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("violations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user names
      const userIds = [...new Set(data?.map(v => v.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]));

      return data?.map(v => ({
        ...v,
        user_name: profileMap.get(v.user_id) || "Unknown"
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("violations")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-violations"] });
      toast.success("Violation status updated");
    },
    onError: () => {
      toast.error("Failed to update violation status");
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading violations...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Violation Management</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Reservation ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations?.map((violation) => (
              <TableRow key={violation.id}>
                <TableCell>{violation.user_name}</TableCell>
                <TableCell className="max-w-md">{violation.description}</TableCell>
                <TableCell className="font-mono text-xs">
                  {violation.reservation_id?.slice(0, 8) || "N/A"}
                </TableCell>
                <TableCell>
                  <Select
                    value={violation.status}
                    onValueChange={(value) =>
                      updateStatus.mutate({ id: violation.id, status: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <Badge variant="outline">Pending</Badge>
                      </SelectItem>
                      <SelectItem value="resolved">
                        <Badge variant="default">Resolved</Badge>
                      </SelectItem>
                      <SelectItem value="dismissed">
                        <Badge variant="secondary">Dismissed</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {format(new Date(violation.created_at), "MMM dd, yyyy")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
