import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Reservation = {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  vehicles: {
    make: string;
    model: string;
    id: string;
  };
  locations: {
    name: string;
    city: string;
  };
  user_id: string;
  vehicle_id: string;
};

const ReservationManagement = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    if (!roles?.some((r) => r.role === "admin")) {
      navigate("/dashboard");
      return;
    }

    fetchReservations();
  };

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        vehicles(make, model, id),
        locations(name, city)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load reservations");
    } else {
      setReservations(data || []);
    }
    setLoading(false);
  };

  const updateReservationStatus = async (id: string, status: string, vehicleId?: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update reservation");
      return;
    }

    // If marking as completed, make vehicle available again
    if (status === "completed" && vehicleId) {
      await supabase
        .from("vehicles")
        .update({ is_available: true })
        .eq("id", vehicleId);
    }

    toast.success("Reservation updated successfully");
    fetchReservations();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Reservation Management</h1>
          <p className="text-muted-foreground">View and manage all customer reservations</p>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-mono text-sm">
                      #{reservation.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {reservation.vehicles.make} {reservation.vehicles.model}
                    </TableCell>
                    <TableCell>
                      {format(new Date(reservation.start_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(reservation.end_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {reservation.locations.name}, {reservation.locations.city}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${reservation.total_price}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reservation.status)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={reservation.status}
                        onValueChange={(value) => updateReservationStatus(reservation.id, value, reservation.vehicle_id)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
    </div>
  );
};

export default ReservationManagement;
