import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Vehicles from "./pages/Vehicles";
import VehicleDetail from "./pages/VehicleDetail";
import Dashboard from "./pages/Dashboard";
import MyReservations from "./pages/MyReservations";
import Settings from "./pages/Settings";
import ReportViolation from "./pages/ReportViolation";
import LeaveFeedback from "./pages/LeaveFeedback";
import VehicleManagement from "./pages/admin/VehicleManagement";
import ReservationManagement from "./pages/admin/ReservationManagement";
import LocationManagement from "./pages/admin/LocationManagement";
import DiscountManagement from "./pages/admin/DiscountManagement";
import UserManagement from "./pages/admin/UserManagement";
import FeedbackManagement from "./pages/admin/FeedbackManagement";
import ViolationManagement from "./pages/admin/ViolationManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/vehicles" element={<Vehicles />} />
                    <Route path="/vehicles/:id" element={<VehicleDetail />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/my-reservations" element={<MyReservations />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/violations" element={<ReportViolation />} />
                    <Route path="/feedback" element={<LeaveFeedback />} />
                    <Route path="/admin/vehicles" element={<VehicleManagement />} />
                    <Route path="/admin/reservations" element={<ReservationManagement />} />
                    <Route path="/admin/locations" element={<LocationManagement />} />
                    <Route path="/admin/discounts" element={<DiscountManagement />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/feedback" element={<FeedbackManagement />} />
                    <Route path="/admin/violations" element={<ViolationManagement />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
