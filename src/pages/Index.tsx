import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Car, Shield, Clock, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-car.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury car rental"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>
        
        <div className="container relative flex h-full items-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              Find Your Perfect Ride Today
            </h1>
            <p className="text-xl text-muted-foreground">
              Premium car rentals at competitive prices. Choose from hundreds of vehicles for any occasion.
            </p>
            <div className="flex gap-4">
              <Link to="/vehicles">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Browse Vehicles
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Why Choose RentCar?</h2>
          <p className="text-lg text-muted-foreground">
            Experience hassle-free car rentals with our premium service
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6 text-center transition-shadow hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Wide Selection</h3>
            <p className="text-muted-foreground">
              Choose from luxury cars, SUVs, sports cars, and more
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-center transition-shadow hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <MapPin className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Multiple Locations</h3>
            <p className="text-muted-foreground">
              Pick up and drop off at convenient locations
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-center transition-shadow hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">24/7 Support</h3>
            <p className="text-muted-foreground">
              Round-the-clock customer service for your peace of mind
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-center transition-shadow hover:shadow-lg">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Fully Insured</h3>
            <p className="text-muted-foreground">
              Comprehensive insurance coverage on all vehicles
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-20">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Hit the Road?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of satisfied customers and book your perfect car today
          </p>
          <Link to="/vehicles">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              View Available Cars
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
