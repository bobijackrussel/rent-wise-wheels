import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Car, Users, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const { data: stats } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [
        { count: totalReservations },
        { count: totalUsers },
        { count: totalVehicles },
        { data: reservations },
      ] = await Promise.all([
        supabase.from("reservations").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("vehicles").select("*", { count: "exact", head: true }),
        supabase
          .from("reservations")
          .select("created_at, total_price, start_date, end_date")
          .order("created_at", { ascending: true }),
      ]);

      // Calculate total revenue
      const totalRevenue = reservations?.reduce(
        (sum, r) => sum + Number(r.total_price),
        0
      ) || 0;

      // Group reservations by month
      const monthlyData = reservations?.reduce((acc: any, r) => {
        const month = new Date(r.created_at).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        if (!acc[month]) {
          acc[month] = { month, reservations: 0, revenue: 0 };
        }
        acc[month].reservations++;
        acc[month].revenue += Number(r.total_price);
        return acc;
      }, {});

      // Extract all reservation dates
      const reservationDates = new Set<string>();
      reservations?.forEach((r) => {
        const start = new Date(r.start_date);
        const end = new Date(r.end_date);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          reservationDates.add(new Date(d).toDateString());
        }
      });

      return {
        totalReservations: totalReservations || 0,
        totalUsers: totalUsers || 0,
        totalVehicles: totalVehicles || 0,
        totalRevenue,
        monthlyData: Object.values(monthlyData || {}).slice(-6),
        reservationDates: Array.from(reservationDates),
      };
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReservations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVehicles}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reservations" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservation Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CalendarComponent
              mode="single"
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              className={cn("pointer-events-auto")}
              modifiers={{
                reserved: (date) =>
                  stats?.reservationDates?.includes(date.toDateString()) || false,
              }}
              modifiersClassNames={{
                reserved: "bg-primary text-primary-foreground font-bold",
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
