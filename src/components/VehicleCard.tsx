import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Users, Fuel, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VehicleCardProps {
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
  is_available: boolean;
}

export const VehicleCard = ({
  id,
  make,
  model,
  year,
  type,
  price_per_day,
  seats,
  transmission,
  fuel_type,
  image_url,
  is_available,
}: VehicleCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-muted">
        {image_url ? (
          <img
            src={image_url}
            alt={`${make} ${model}`}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Car className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        {!is_available && (
          <Badge className="absolute right-2 top-2" variant="destructive">
            Not Available
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {make} {model}
            </h3>
            <p className="text-sm text-muted-foreground">
              {year} • {type}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">${price_per_day}</p>
            <p className="text-xs text-muted-foreground">per day</p>
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{seats}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span className="capitalize">{transmission}</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="h-4 w-4" />
            <span className="capitalize">{fuel_type}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={() => navigate(`/vehicles/${id}`)}
          disabled={!is_available}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
