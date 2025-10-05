import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

type Discount = {
  id: string;
  code: string;
  percentage: number;
  description?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

const DiscountManagement = () => {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    percentage: 0,
    description: "",
    start_date: "",
    end_date: "",
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

    fetchDiscounts();
  };

  const fetchDiscounts = async () => {
    const { data, error } = await supabase
      .from("discounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load discounts");
    } else {
      setDiscounts(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDiscount) {
      const { error } = await supabase
        .from("discounts")
        .update(formData)
        .eq("id", editingDiscount.id);

      if (error) {
        toast.error("Failed to update discount");
      } else {
        toast.success("Discount updated successfully");
        setDialogOpen(false);
        resetForm();
        fetchDiscounts();
      }
    } else {
      const { error } = await supabase
        .from("discounts")
        .insert(formData);

      if (error) {
        toast.error("Failed to add discount");
      } else {
        toast.success("Discount added successfully");
        setDialogOpen(false);
        resetForm();
        fetchDiscounts();
      }
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      percentage: Number(discount.percentage),
      description: discount.description || "",
      start_date: discount.start_date.split("T")[0],
      end_date: discount.end_date.split("T")[0],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("discounts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete discount");
    } else {
      toast.success("Discount deleted successfully");
      fetchDiscounts();
    }
  };

  const toggleActive = async (discount: Discount) => {
    const { error } = await supabase
      .from("discounts")
      .update({ is_active: !discount.is_active })
      .eq("id", discount.id);

    if (error) {
      toast.error("Failed to update discount");
    } else {
      toast.success("Discount updated");
      fetchDiscounts();
    }
  };

  const resetForm = () => {
    setEditingDiscount(null);
    setFormData({
      code: "",
      percentage: 0,
      description: "",
      start_date: "",
      end_date: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Discount Management</h1>
            <p className="text-muted-foreground">Create and manage discount codes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Discount
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDiscount ? "Edit Discount" : "Add New Discount"}</DialogTitle>
                <DialogDescription>
                  {editingDiscount ? "Update discount information" : "Create a new discount code"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SUMMER2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="percentage">Discount Percentage</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingDiscount ? "Update Discount" : "Add Discount"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {discounts.map((discount) => (
              <Card key={discount.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{discount.code}</CardTitle>
                      <CardDescription>{discount.description}</CardDescription>
                    </div>
                    <Badge variant={discount.is_active ? "default" : "secondary"}>
                      {discount.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2">
                    <p className="text-2xl font-bold text-primary">{discount.percentage}% OFF</p>
                    <p className="text-sm text-muted-foreground">
                      Valid: {format(new Date(discount.start_date), "MMM dd, yyyy")} -{" "}
                      {format(new Date(discount.end_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleActive(discount)}>
                      {discount.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(discount)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(discount.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default DiscountManagement;
