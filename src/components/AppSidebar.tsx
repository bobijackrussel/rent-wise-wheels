import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar,
  Car,
  AlertCircle,
  MessageSquare,
  LayoutDashboard,
  MapPin,
  Percent,
  Users,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    setIsAdmin(roles?.some((r) => r.role === "admin") || false);
  };

  const userItems = [
    { title: "My Reservations", url: "/my-reservations", icon: Calendar },
    { title: "Browse Vehicles", url: "/vehicles", icon: Car },
    { title: "Report Violation", url: "/violations", icon: AlertCircle },
    { title: "Leave Feedback", url: "/feedback", icon: MessageSquare },
  ];

  const adminItems = [
    { title: "Reservations", url: "/admin/reservations", icon: LayoutDashboard },
    { title: "Vehicles", url: "/admin/vehicles", icon: Car },
    { title: "Locations", url: "/admin/locations", icon: MapPin },
    { title: "Discounts", url: "/admin/discounts", icon: Percent },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Feedback", url: "/admin/feedback", icon: MessageCircle },
    { title: "Violations", url: "/admin/violations", icon: ShieldAlert },
  ];

  const items = isAdmin ? adminItems : userItems;
  const currentPath = location.pathname;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? "Admin" : "Menu"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.url)}
                    isActive={currentPath === item.url}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
