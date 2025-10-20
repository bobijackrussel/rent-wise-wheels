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
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackManagement() {
  const queryClient = useQueryClient();

  const { data: feedback, isLoading } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user names
      const userIds = [...new Set(data?.map(f => f.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]));

      return data?.map(f => ({
        ...f,
        user_name: profileMap.get(f.user_id) || "Unknown"
      }));
    },
  });

  const deleteFeedback = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast.success("Feedback deleted");
    },
    onError: () => {
      toast.error("Failed to delete feedback");
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading feedback...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Feedback Management</h1>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Reservation ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.user_name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {item.rating}
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {item.comment || "No comment"}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {item.reservation_id?.slice(0, 8) || "N/A"}
                </TableCell>
                <TableCell>
                  {format(new Date(item.created_at), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteFeedback.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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
