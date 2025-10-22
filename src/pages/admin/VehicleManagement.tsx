import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  price_per_day: number;
  is_available: boolean;
  image_url?: string;
  location_id?: string;
  seats?: number;
  transmission?: string;
  fuel_type?: string;
  description?: string;
};

type Location = {
  id: string;
  name: string;
  city: string;
};

const VehicleManagement = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    type: "sedan",
    transmission: "automatic",
    fuel_type: "gasoline",
    seats: 5,
    price_per_day: 0,
    description: "",
    image_url: "",
    location_id: "",
    features: [] as string[],
  });

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

    await Promise.all([fetchVehicles(), fetchLocations()]);
  };

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select(`
        *,
        locations(name, city)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load vehicles");
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
  };

  const fetchLocations = async () => {
    const { data } = await supabase
      .from("locations")
      .select("id, name, city")
      .eq("is_active", true);

    setLocations(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVehicle) {
      const { error } = await supabase
        .from("vehicles")
        .update(formData)
        .eq("id", editingVehicle.id);

      if (error) {
        toast.error("Failed to update vehicle");
      } else {
        toast.success("Vehicle updated successfully");
        setDialogOpen(false);
        resetForm();
        fetchVehicles();
      }
    } else {
      const { error } = await supabase
        .from("vehicles")
        .insert(formData);

      if (error) {
        toast.error("Failed to add vehicle");
      } else {
        toast.success("Vehicle added successfully");
        setDialogOpen(false);
        resetForm();
        fetchVehicles();
      }
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: vehicle.type,
      transmission: vehicle.transmission || "automatic",
      fuel_type: vehicle.fuel_type || "gasoline",
      seats: vehicle.seats || 5,
      price_per_day: Number(vehicle.price_per_day),
      description: vehicle.description || "",
      image_url: vehicle.image_url || "",
      location_id: vehicle.location_id || "",
      features: [],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete vehicle");
    } else {
      toast.success("Vehicle deleted successfully");
      fetchVehicles();
    }
  };

  const toggleAvailability = async (vehicle: Vehicle) => {
    const { error } = await supabase
      .from("vehicles")
      .update({ is_available: !vehicle.is_available })
      .eq("id", vehicle.id);

    if (error) {
      toast.error("Failed to update availability");
    } else {
      toast.success("Availability updated");
      fetchVehicles();
    }
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      make: "",
      model: "",
      year: new Date().getFullYear(),
      type: "sedan",
      transmission: "automatic",
      fuel_type: "gasoline",
      seats: 5,
      price_per_day: 0,
      description: "",
      image_url: "",
      location_id: "",
      features: [],
    });
  };

  return (
    <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Vehicle Management</h1>
            <p className="text-muted-foreground">Manage your vehicle inventory</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                <DialogDescription>
                  {editingVehicle ? "Update vehicle information" : "Add a new vehicle to your fleet"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="price">Price per Day ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Select value={formData.location_id} onValueChange={(value) => setFormData({ ...formData, location_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}, {location.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Transmission</TableHead>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price/Day</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle: any) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">
                      {vehicle.make} {vehicle.model}
                    </TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell className="capitalize">{vehicle.type}</TableCell>
                    <TableCell>{vehicle.seats || "N/A"}</TableCell>
                    <TableCell className="capitalize">{vehicle.transmission || "N/A"}</TableCell>
                    <TableCell className="capitalize">{vehicle.fuel_type || "N/A"}</TableCell>
                    <TableCell>
                      {vehicle.locations ? `${vehicle.locations.name}, ${vehicle.locations.city}` : "N/A"}
                    </TableCell>
                    <TableCell className="font-semibold">${vehicle.price_per_day}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.is_available ? "default" : "secondary"}>
                        {vehicle.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleAvailability(vehicle)}
                          title={vehicle.is_available ? "Mark Unavailable" : "Mark Available"}
                        >
                          {vehicle.is_available ? "Hide" : "Show"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(vehicle.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default VehicleManagement;
