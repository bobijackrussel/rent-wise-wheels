import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Car, AlertCircle, MessageSquare } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    setIsAdmin(roles?.some((r) => r.role === "admin") || false);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-muted" />
            <div className="h-64 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <h1 className="mb-8 text-4xl font-bold">Dashboard</h1>

        {isAdmin ? (
          <Tabs defaultValue="reservations" className="space-y-6">
            <TabsList>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="discounts">Discounts</TabsTrigger>
            </TabsList>

            <TabsContent value="reservations">
              <Card>
                <CardHeader>
                  <CardTitle>All Reservations</CardTitle>
                  <CardDescription>Manage customer reservations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/admin/reservations")}>
                    View All Reservations
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicles">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Management</CardTitle>
                  <CardDescription>Add, edit, or remove vehicles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/admin/vehicles")}>
                    Manage Vehicles
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="locations">
              <Card>
                <CardHeader>
                  <CardTitle>Location Management</CardTitle>
                  <CardDescription>Manage pickup and drop-off locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/admin/locations")}>
                    Manage Locations
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discounts">
              <Card>
                <CardHeader>
                  <CardTitle>Discount Management</CardTitle>
                  <CardDescription>Create and manage discount codes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/admin/discounts")}>
                    Manage Discounts
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => navigate("/my-reservations")}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>My Reservations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View and manage your bookings</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => navigate("/vehicles")}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <CardTitle>Browse Vehicles</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Find your perfect car</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => navigate("/violations")}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <CardTitle>Report Violation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Report any issues</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition-shadow hover:shadow-lg" onClick={() => navigate("/feedback")}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle>Leave Feedback</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Share your experience</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
