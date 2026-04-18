"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Calendar, MapPin, CreditCard, ShieldCheck, Star, Loader2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RentalCar } from "@/lib/types/database";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function BookingPage() {
  const { carId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [car, setCar] = useState<RentalCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Booking details from URL
  const pickup = searchParams.get("pickup");
  const returnLoc = searchParams.get("return_loc") || pickup;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  useEffect(() => {
    async function fetchCar() {
      if (!carId) return;
      try {
        const { data, error: fetchError } = await supabase
          .from('rental_cars')
          .select('*')
          .eq('id', carId)
          .single();

        if (fetchError) throw fetchError;
        setCar(data);
      } catch (err: any) {
        console.error("Error fetching car:", err);
        setError("No pudimos encontrar los detalles del vehículo.");
      } finally {
        setLoading(false);
      }
    }
    fetchCar();
  }, [carId, supabase]);

  const calculateDays = () => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Minimum 1 day
  };

  const days = calculateDays();
  const totalPrice = car ? (car.price_per_day * days) : 0;
  const insurancePrice = 15 * days; // Mock insurance
  
  // Bank Commission (5%)
  const subtotal = totalPrice + insurancePrice;
  const commission = subtotal * 0.05;
  const finalTotal = subtotal + commission;

  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error: insertError } = await (supabase
        .from('rental_reservations') as any)
        .insert({
          user_id: session.user.id,
          rental_car_id: carId as string,
          pickup_location: pickup as string,
          return_location: returnLoc as string,
          pickup_date: start as string,
          return_date: end as string,
          total_price: finalTotal,
          status: 'PENDING_PAYMENT',
          renters_age_check: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Redirect to checkout simulation
      router.push(`/ready2drivesv/checkout/${(data as any).id}`);
    } catch (err: any) {
      console.error("Booking failed:", err);
      setError("Error al procesar la reserva. Por favor intenta de nuevo.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-zinc-400">Preparando tu reservación...</p>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <p className="text-red-400 font-bold mb-4">{error || "Vehículo no encontrado"}</p>
        <Button onClick={() => router.back()}>Regresar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
          Volver al catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Car Details */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-4xl font-black italic tracking-tighter">
              CONFIRMA TU <span className="text-emerald-500">ELECCIÓN</span>
            </h1>

            <Card variant="glass" className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
                  <img 
                    src={car.image_url || "/api/placeholder/400/300"} 
                    alt={car.brand} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">{car.vehicle_class}</span>
                    <h2 className="text-3xl font-bold">{car.brand} {car.model}</h2>
                  </div>
                  
                  <div className="flex items-center gap-4 text-zinc-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                      <span className="text-white font-bold">4.9</span> (48 reseñas)
                    </div>
                    <span>•</span>
                    <span>{car.year}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 text-zinc-400 text-sm pb-4">
                    <p>Transmisión: <span className="text-white">{car.transmission === 'AUTOMATIC' ? 'Automático' : 'Manual'}</span></p>
                    <p>Combustible: <span className="text-white">{car.fuel_type}</span></p>
                    <p>Asientos: <span className="text-white">{car.seats}</span></p>
                    <p>Puertas: <span className="text-white">{car.doors}</span></p>
                  </div>
                </div>
              </div>

              {/* Booking Info Banner */}
              <div className="bg-emerald-500/10 border-t border-emerald-500/20 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <MapPin className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Lugar de Retiro y Devolución</p>
                    <p className="text-white font-medium">{pickup}</p>
                    <p className="text-xs text-zinc-400">Mismo lugar para devolución</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Fechas del Viaje</p>
                    <p className="text-white font-medium">
                      {start ? new Date(start).toLocaleDateString() : '-'} 
                      <ArrowRight className="inline-block w-4 h-4 mx-2 text-emerald-500" /> 
                      {end ? new Date(end).toLocaleDateString() : '-'}
                    </p>
                    <p className="text-xs text-emerald-400 font-bold">{days} días de renta</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-500" /> Protección Incluida
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Tu seguridad es nuestra prioridad. Esta reserva incluye Seguro de Daños a Terceros (TPL) y Protección de Colisión básica. 
                Puedes mejorar tu cobertura en el mostrador al momento del retiro.
              </p>
            </div>
          </div>

          {/* Right Column: Checkout Summary */}
          <div className="space-y-6">
            <Card variant="glass" className="border-emerald-500/30">
              <CardContent className="p-8 space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-emerald-500" /> Resumen de Pago
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-zinc-400">
                    <span>Renta ({days} días x ${car.price_per_day})</span>
                    <span className="text-white font-medium">${totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Seguros y Tasas</span>
                    <span className="text-white font-medium">${insurancePrice}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5 italic">
                      Comisión Bancaria (5%) <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    </span>
                    <span className="text-white font-medium">${commission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 border-t border-zinc-800 pt-3">
                    <span>Impuestos (IVA)</span>
                    <span className="text-white font-medium">Incluido</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 mt-6 flex justify-between items-end">
                  <div className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Total a Pagar</div>
                  <div className="text-4xl font-black italic text-emerald-400">${finalTotal}</div>
                </div>

                <Button 
                  onClick={handleConfirmBooking}
                  isLoading={bookingLoading}
                  variant="emerald" 
                  size="lg" 
                  className="w-full h-14 text-lg"
                >
                  Confirmar Reservación
                </Button>

                <p className="text-center text-xs text-zinc-500">
                  Al confirmar, aceptas nuestros términos de servicio y políticas de cancelación local.
                </p>
              </CardContent>
            </Card>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
              <p className="text-emerald-400 font-bold text-sm mb-2">¡Garantía Premium!</p>
              <p className="text-zinc-500 text-xs">
                Cancelación gratuita hasta 48 horas antes del retiro. Kilometraje ilimitado en todo El Salvador.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
