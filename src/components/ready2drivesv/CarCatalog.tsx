"use client";

import { useState, useEffect } from "react";
import { Users, DoorOpen, Briefcase, Zap, Fuel, ChevronRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RentalCar } from "@/lib/types/database";
import { useRouter, useSearchParams } from "next/navigation";

export function CarCatalog() {
  const [filter, setFilter] = useState("All");
  const [cars, setCars] = useState<RentalCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        
        // Check Auth
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Fetch Cars
        const { data, error: fetchError } = await supabase
          .from('rental_cars')
          .select('*')
          .eq('status', 'AVAILABLE');

        if (fetchError) throw fetchError;
        setCars(data || []);
      } catch (err: any) {
        console.error("Error initializing car catalog:", err);
        setError("No se pudieron cargar los vehículos. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [supabase]);

  const handleSelectCar = (carId: string) => {
    if (!user) {
      // Redirect to login if not authenticated with return URL
      const returnUrl = `/ready2drivesv?${searchParams.toString()}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Capture booking context from URL
    const pickup = searchParams.get("pickup");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!pickup || !start || !end) {
      // If missing dates, ask user to fill the form first
      const form = document.getElementById('hero-section'); // or search form
      if (form) form.scrollIntoView({ behavior: 'smooth' });
      setError("Por favor, selecciona las fechas y lugar de retiro antes de continuar.");
      return;
    }

    // Proceed to booking confirmation page with context
    router.push(`/ready2drivesv/book/${carId}?${searchParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-zinc-400 font-medium">Buscando los mejores vehículos para ti...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24 px-4 bg-red-500/10 border border-red-500/20 rounded-3xl">
        <p className="text-red-400 font-bold mb-2">Ops! Algo salió mal</p>
        <p className="text-zinc-400">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-6 px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-400 transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const filteredCars = cars.filter(car => 
    filter === "All" || 
    car.vehicle_class === filter || 
    (filter === "Electric" && car.fuel_type === "ELECTRIC")
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-16 px-4">
      
      {/* Filters (Simplified) */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
        {["All", "Economy", "Platinum Class", "SUV", "Electric"].map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
              filter === tag 
                ? "bg-emerald-500 text-zinc-900" 
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid of Cars */}
      {filteredCars.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500">No hay vehículos disponibles en esta categoría actualmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map((car) => (
            <div key={car.id} className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 shadow-2xl">
              {/* Image */}
              <div className="h-48 overflow-hidden relative">
                <div className="absolute top-4 left-4 bg-zinc-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 z-10 border border-emerald-500/20">
                  {car.vehicle_class}
                </div>
                <img 
                  src={car.image_url || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800"} 
                  alt={`${car.brand} ${car.model}`} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{car.brand}</h3>
                    <p className="text-zinc-400 font-medium">{car.model} {car.year}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-400">${car.price_per_day}</span>
                    <p className="text-zinc-500 text-sm">/ día</p>
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Users className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm">{car.seats} Asientos</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <DoorOpen className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm">{car.doors} Puertas</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Briefcase className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm">{car.luggage_capacity} Maletas</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Zap className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm">{car.transmission === 'AUTOMATIC' ? 'Automático' : 'Manual'}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800">
                  <button 
                    onClick={() => handleSelectCar(car.id)}
                    className="w-full bg-white text-zinc-900 hover:bg-emerald-400 hover:text-zinc-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    Seleccionar Auto <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
