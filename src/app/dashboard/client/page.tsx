"use client";

import { useEffect, useState } from "react";
import { 
  Car, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  CreditCard, 
  Plus, 
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RentalReservation, RentalCar, Vehicle, Repair } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ClientDashboard() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        setUser(session.user);

        // Fetch Rental Reservations
        const { data: rentalData } = await supabase
          .from('rental_reservations')
          .select('*, rental_cars(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        // Fetch Workshop Vehicles
        const { data: vehicleData } = await supabase
          .from('vehiculos')
          .select('*')
          .eq('client_id', session.user.id);

        setRentals(rentalData || []);
        setVehicles(vehicleData || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
        <p className="text-steel-400">Cargando tu panel personal...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Hola, <span className="text-accent-400">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-steel-400">Gestiona tus vehículos y reservaciones de renta en un solo lugar.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/ready2drivesv">
            <Button variant="emerald" size="md" className="gap-2">
              <Plus className="w-4 h-4" /> Alquilar Auto
            </Button>
          </Link>
          <Button variant="outline" size="md" className="gap-2">
            <Calendar className="w-4 h-4" /> Agendar Cita Taller
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left/Middle: Reservations & Vehicles */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Active Rentals */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Mis Alquileres (Ready2DriveSV)
            </h2>
            {rentals.length === 0 ? (
              <Card className="bg-zinc-900/40 border-dashed border-zinc-800 p-12 text-center">
                <p className="text-zinc-500 mb-6">Aún no has rentado ningún vehículo.</p>
                <Link href="/ready2drivesv">
                  <Button variant="outline">Explorar Catálogo de Rentas</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rentals.map((rental) => (
                  <Card key={rental.id} className="group hover:border-emerald-500/30 transition-all">
                    <CardContent className="p-0">
                      <div className="flex p-4 gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                          <img 
                            src={rental.rental_cars?.image_url || "/api/placeholder/100/100"} 
                            alt={rental.rental_cars?.brand} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                             <h3 className="font-bold text-white truncate">{rental.rental_cars?.brand} {rental.rental_cars?.model}</h3>
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                               rental.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                             }`}>
                               {rental.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                             </span>
                          </div>
                          <p className="text-xs text-steel-500 mb-2">{rental.pickup_location}</p>
                          <div className="flex items-center gap-2 text-xs text-steel-400">
                             <Clock className="w-3 h-3" />
                             <span>{new Date(rental.pickup_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-between items-center">
                        <span className="text-emerald-400 font-bold text-sm">${rental.total_price}</span>
                        <Link href={`/ready2drivesv/checkout/${rental.id}`} className="text-xs text-steel-300 hover:text-white flex items-center gap-1">
                          Detalles <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Workshop Vehicles */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-accent-500" /> Mis Vehículos en Taller
            </h2>
            {vehicles.length === 0 ? (
              <Card className="bg-navy-900/40 border-dashed border-steel-800 p-8 text-center text-steel-500">
                No tienes vehículos registrados para mantenimiento.
              </Card>
            ) : (
              <div className="space-y-4">
                {vehicles.map((v) => (
                  <Card key={v.id} variant="outline" className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-accent-500/10 rounded-xl">
                        <Car className="w-6 h-6 text-accent-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{v.make} {v.model}</h4>
                        <p className="text-xs text-steel-500">{v.license_plate} • {v.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs px-3 py-1 bg-navy-800 text-steel-300 rounded-full border border-steel-700">En Diagnóstico</span>
                      <ChevronRight className="w-5 h-5 text-steel-600" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Status & Notifications */}
        <div className="space-y-8">
          
          {/* Quick Status */}
          <Card className="bg-gradient-to-br from-navy-900 to-navy-950">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider text-xs text-steel-500">Estado de Cuenta</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-steel-400 text-sm">Reserva Próxima</span>
                  <span className="text-accent-400 font-bold text-sm">Mañana 10:00 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-steel-400 text-sm">Pagos Pendientes</span>
                  <span className="text-white font-bold text-sm">$0.00</span>
                </div>
              </div>
              <Button variant="outline" className="w-full text-xs">Pagar Facturas Pendientes</Button>
            </CardContent>
          </Card>

          {/* Tips / Promo */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 space-y-4 relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <h4 className="text-emerald-400 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Viaje Seguro
            </h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              ¿Sabías que como cliente de AutoMaster tienes un **10% de descuento** en tu próxima renta de Ready2DriveSV?
            </p>
            <p className="text-xs font-bold text-white">CÓDIGO: MASTER2024</p>
          </div>

          <Card variant="outline" className="border-amber-500/20 bg-amber-500/5">
             <CardContent className="p-4 flex gap-4 items-start">
               <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
               <p className="text-xs text-amber-200/80 leading-relaxed">
                 Tu vehículo **Toyota Hilux** necesita cambio de aceite en 250 km. ¡Agenda tu cita hoy!
               </p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
