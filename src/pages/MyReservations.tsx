import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, Car, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Reservation = {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  vehicles: {
    make: string;
    model: string;
    image_url?: string;
  };
  locations: {
    name: string;
    city: string;
  };
};

const MyReservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    fetchReservations(session.user.id);
  };

  const fetchReservations = async (userId: string) => {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        vehicles(make, model, image_url),
        locations(name, city)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Failed to load reservations");
    } else {
      setReservations(data || []);
    }
    setLoading(false);
  };

  const handleCancelReservation = async (id: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      toast.error("Failed to cancel reservation");
    } else {
      toast.success("Reservation cancelled successfully");
      setReservations(reservations.map(r => 
        r.id === id ? { ...r, status: "cancelled" } : r
      ));
    }
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
          <h1 className="mb-2 text-4xl font-bold">My Reservations</h1>
          <p className="text-muted-foreground">View and manage your vehicle bookings</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-semibold">No reservations yet</h2>
              <p className="mb-6 text-muted-foreground">
                Start your journey by browsing our available vehicles
              </p>
              <Button onClick={() => navigate("/vehicles")}>Browse Vehicles</Button>
            </CardContent>
          </Card>
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

                  {reservation.status === "active" && (
                    <div className="mt-4 flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Cancel Reservation
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this reservation? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancelReservation(reservation.id)}>
                              Cancel Reservation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/violations?reservation=${reservation.id}`)}
                      >
                        Report Violation
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/feedback?reservation=${reservation.id}`)}
                      >
                        Leave Feedback
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
};

export default MyReservations;
