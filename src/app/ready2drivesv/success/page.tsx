"use client";

import Link from "next/link";
import { CheckCircle2, Calendar, MapPin, Phone, Mail, Share2, ArrowRight, Home, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BookingReceipt } from "@/components/ready2drivesv/BookingReceipt";
import { useEffect, useState } from "react";
import { RentalCar, RentalReservation } from "@/lib/types/database";

export default function SuccessPage() {
  const [reservation, setReservation] = useState<any>(null);
  const [car, setCar] = useState<RentalCar | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLatest() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('rental_reservations')
          .select('*, rental_cars(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setReservation(data);
          setCar((data as any).rental_cars);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatest();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-12 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-12">
        
        {/* Success Icon & Header */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter">
            RESERVACIÓN <span className="text-emerald-500">EXITOSA</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">
            ¡Tu aventura comienza pronto! Hemos confirmado tu pago y tu vehículo está siendo preparado.
          </p>
        </div>

        {/* Confirmation Details Card */}
        <div className="space-y-12">
           <BookingReceipt reservation={reservation} car={car} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/dashboard/client">
            <Button variant="outline" size="lg" className="h-14 px-10 w-full sm:w-auto">
              Ver mis Reservaciones
            </Button>
          </Link>
          <Link href="/ready2drivesv">
            <Button variant="emerald" size="lg" className="h-14 px-10 w-full sm:w-auto group">
              Explorar más autos <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Home link */}
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors">
          <Home className="w-4 h-4" /> Volver a la página principal
        </Link>

      </div>
    </div>
  );
}
