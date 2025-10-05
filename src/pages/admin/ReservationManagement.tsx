import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, Car, User } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Reservation Management</h1>
          <p className="text-muted-foreground">View and manage all customer reservations</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {reservation.vehicles.make} {reservation.vehicles.model}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Reservation #{reservation.id.slice(0, 8)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Rental Period</p>
                        <p className="font-semibold">
                          {format(new Date(reservation.start_date), "MMM dd")} -{" "}
                          {format(new Date(reservation.end_date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pickup Location</p>
                        <p className="font-semibold">
                          {reservation.locations.name}, {reservation.locations.city}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Total Price</p>
                      <p className="text-2xl font-bold text-primary">
                        ${reservation.total_price}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-sm text-muted-foreground">Update Status:</label>
                    <Select
                      value={reservation.status}
                      onValueChange={(value) => updateReservationStatus(reservation.id, value, reservation.vehicle_id)}
                    >
                      <SelectTrigger className="mt-1 w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationManagement;
