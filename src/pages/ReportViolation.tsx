import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

type Reservation = {
  id: string;
  vehicles: {
    make: string;
    model: string;
  };
};

const ReportViolation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get("reservation");
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    reservation_id: reservationId || "",
    description: "",
  });

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("reservations")
      .select(`
        id,
        vehicles(make, model)
      `)
      .eq("user_id", session.user.id)
      .eq("status", "active");

    if (error) {
      toast.error("Failed to load reservations");
    } else {
      setReservations(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("violations")
      .insert({
        user_id: session.user.id,
        reservation_id: formData.reservation_id || null,
        description: formData.description,
      });

    if (error) {
      toast.error("Failed to submit violation report");
    } else {
      toast.success("Violation report submitted successfully");
      navigate("/dashboard");
    }
    setSubmitting(false);
  };

  return (
    <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">Report Violation</h1>
            <p className="text-muted-foreground">Report any issues or violations with your rental</p>
          </div>

          {loading ? (
            <div className="h-96 animate-pulse rounded-lg bg-muted" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Violation Report
                </CardTitle>
                <CardDescription>
                  Please provide details about the issue you experienced
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="reservation">Related Reservation (Optional)</Label>
                    <Select
                      value={formData.reservation_id}
                      onValueChange={(value) => setFormData({ ...formData, reservation_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reservation (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {reservations.map((reservation) => (
                          <SelectItem key={reservation.id} value={reservation.id}>
                            {reservation.vehicles.make} {reservation.vehicles.model} - #{reservation.id.slice(0, 8)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Please describe the violation or issue in detail..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Report"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  );
};

export default ReportViolation;
