import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MessageSquare, Star } from "lucide-react";

type Reservation = {
  id: string;
  vehicles: {
    make: string;
    model: string;
  };
};

const LeaveFeedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get("reservation");
  
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  
  const [formData, setFormData] = useState({
    reservation_id: reservationId || "",
    comment: "",
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
      .eq("user_id", session.user.id);

    if (error) {
      toast.error("Failed to load reservations");
    } else {
      setReservations(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("feedback")
      .insert({
        user_id: session.user.id,
        reservation_id: formData.reservation_id || null,
        rating: rating,
        comment: formData.comment,
      });

    if (error) {
      toast.error("Failed to submit feedback");
    } else {
      toast.success("Thank you for your feedback!");
      navigate("/dashboard");
    }
    setSubmitting(false);
  };

  return (
    <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">Leave Feedback</h1>
            <p className="text-muted-foreground">Share your experience with us</p>
          </div>

          {loading ? (
            <div className="h-96 animate-pulse rounded-lg bg-muted" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Your Feedback
                </CardTitle>
                <CardDescription>
                  Help us improve our service by sharing your thoughts
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
                    <Label>Rating *</Label>
                    <div className="mt-2 flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= rating
                                ? "fill-primary text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="comment">Your Comments</Label>
                    <Textarea
                      id="comment"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      placeholder="Tell us about your experience..."
                      rows={6}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Feedback"}
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

export default LeaveFeedback;
