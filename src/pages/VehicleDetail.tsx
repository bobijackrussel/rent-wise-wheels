import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Car, Users, Fuel, Settings, MapPin, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  price_per_day: number;
  seats: number;
  transmission: string;
  fuel_type: string;
  image_url?: string;
  description?: string;
  features?: string[];
  is_available: boolean;
  location_id?: string;
};

type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
};

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [locationId, setLocationId] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchVehicle();
    fetchLocations();
  }, [id]);

  const fetchVehicle = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching vehicle:", error);
      toast.error("Vehicle not found");
      navigate("/vehicles");
    } else {
      setVehicle({
        ...data,
        features: Array.isArray(data.features) ? data.features.map(f => String(f)) : []
      });
    }
    setLoading(false);
  };

  const fetchLocations = async () => {
    const { data } = await supabase
      .from("locations")
      .select("*")
      .eq("is_active", true);

    setLocations(data || []);
  };

  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !vehicle) return 0;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return days * vehicle.price_per_day;
  };

  const handleBooking = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to book a vehicle");
      navigate("/auth");
      return;
    }

    if (!startDate || !endDate || !locationId) {
      toast.error("Please select dates and location");
      return;
    }

    if (!vehicle) return;

    setBookingLoading(true);

    const { error } = await supabase
      .from("reservations")
      .insert({
        user_id: session.user.id,
        vehicle_id: vehicle.id,
        location_id: locationId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_price: calculateTotalPrice(),
        status: "active",
      });

    if (error) {
      toast.error("Failed to create reservation");
      console.error(error);
    } else {
      toast.success("Reservation created successfully!");
      navigate("/dashboard");
    }

    setBookingLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 rounded-lg bg-muted" />
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative h-[400px] overflow-hidden rounded-lg bg-muted">
              {vehicle.image_url ? (
                <img
                  src={vehicle.image_url}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Car className="h-32 w-32 text-muted-foreground" />
                </div>
              )}
              {!vehicle.is_available && (
                <Badge className="absolute right-4 top-4" variant="destructive">
                  Not Available
                </Badge>
              )}
            </div>
            
            {vehicle.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-2 text-lg font-semibold">Description</h3>
                  <p className="text-muted-foreground">{vehicle.description}</p>
                </CardContent>
              </Card>
            )}

            {vehicle.features && vehicle.features.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">Features</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {vehicle.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="mb-2 text-4xl font-bold">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-xl text-muted-foreground">
                {vehicle.year} • {vehicle.type}
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="mb-6 flex items-end justify-between border-b pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Starting at</p>
                    <p className="text-4xl font-bold text-primary">
                      ${vehicle.price_per_day}
                    </p>
                    <p className="text-sm text-muted-foreground">per day</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Seats</p>
                        <p className="font-semibold">{vehicle.seats}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Transmission</p>
                        <p className="font-semibold capitalize">{vehicle.transmission}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fuel Type</p>
                        <p className="font-semibold capitalize">{vehicle.fuel_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-semibold capitalize">{vehicle.type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg" disabled={!vehicle.is_available}>
                  {vehicle.is_available ? "Book Now" : "Not Available"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Book Your Rental</DialogTitle>
                  <DialogDescription>
                    Select your rental dates and pickup location
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => !startDate || date <= startDate}
                      className="rounded-md border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pickup Location</Label>
                    <Select value={locationId} onValueChange={setLocationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} - {location.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {startDate && endDate && (
                    <div className="rounded-lg bg-primary/5 p-4">
                      <p className="text-sm text-muted-foreground">Total Price</p>
                      <p className="text-2xl font-bold text-primary">
                        ${calculateTotalPrice()}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleBooking}
                    disabled={!startDate || !endDate || !locationId || bookingLoading}
                  >
                    {bookingLoading ? "Processing..." : "Confirm Booking"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
