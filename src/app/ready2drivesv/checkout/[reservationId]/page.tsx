"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, QrCode, ShieldCheck, ArrowRight, Loader2, CheckCircle2, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RentalReservation, RentalCar } from "@/lib/types/database";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { initiatePayment } from "@/app/actions/payments";

export default function CheckoutPage() {
  const { reservationId } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [reservation, setReservation] = useState<RentalReservation | null>(null);
  const [car, setCar] = useState<RentalCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!reservationId) return;
      try {
        // Verify user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch reservation with IDOR protection: only own reservations
        const { data: resData, error: resError } = await (supabase
          .from('rental_reservations') as any)
          .select('*, rental_cars(*)')
          .eq('id', reservationId)
          .eq('user_id', session.user.id)
          .single();

        if (resError) throw resError;
        if (!resData) {
          router.push('/ready2drivesv');
          return;
        }
        setReservation(resData);
        setCar((resData as any).rental_cars);
      } catch (err: any) {
        console.error("Error fetching reservation:", err);
        router.push('/ready2drivesv');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [reservationId, supabase, router]);

  const handlePayment = async () => {
    setProcessing(true);
    setPaymentError(null);

    try {
      const result = await initiatePayment(reservationId as string, paymentMethod);

      if (result.error) {
        setPaymentError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/ready2drivesv/success');
      }, 2000);
    } catch (err) {
      console.error("Payment failed:", err);
      setPaymentError("Hubo un error al confirmar el pago. Intenta de nuevo.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-zinc-400">Preparando pasarela de pago...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-6 text-center px-4">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold">¡PAGO PROCESADO!</h1>
        <p className="text-zinc-400 max-w-sm">Tu transacción con el banco ha sido exitosa. Redirigiendo a tu reserva...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            PAGOS LOCALES <span className="text-emerald-500">READY2DRIVE</span>
          </h1>
          <p className="text-zinc-500 text-sm">Transacción segura procesada por Red Serfinsa / BAC El Salvador</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Method Selection */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" /> Método de Pago
            </h2>

            <div className="space-y-4">
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-6 flex items-center gap-6 rounded-2xl border-2 transition-all text-left ${
                  paymentMethod === 'card' 
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/10' 
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/30'
                }`}
              >
                <div className={`p-3 rounded-xl ${paymentMethod === 'card' ? 'bg-emerald-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-lg">Tarjeta de Crédito/Débito</p>
                  <p className="text-sm text-zinc-500">Visa, Mastercard, American Express</p>
                </div>
              </button>

              <button 
                onClick={() => setPaymentMethod('qr')}
                className={`w-full p-6 flex items-center gap-6 rounded-2xl border-2 transition-all text-left ${
                  paymentMethod === 'qr' 
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/20' 
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/30'
                }`}
              >
                <div className={`p-3 rounded-xl ${paymentMethod === 'qr' ? 'bg-emerald-500 text-zinc-900 shadow-lg' : 'bg-zinc-800 text-zinc-400'}`}>
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">QuickPay QR</p>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">RECOMENDADO</span>
                  </div>
                  <p className="text-sm text-zinc-500">Escanea desde tu app de BAC, Agrícola o Cusco</p>
                </div>
              </button>
            </div>

            {/* QR Visual (Only if QR is selected) */}
            {paymentMethod === 'qr' && (
              <div className="bg-white p-6 rounded-3xl flex flex-col items-center space-y-4 animate-in zoom-in duration-500">
                <div className="w-48 h-48 bg-zinc-100 rounded-2xl flex items-center justify-center border-4 border-zinc-50">
                  <div className="w-full h-full flex items-center justify-center bg-white p-4">
                    <QrCode className="w-24 h-24 text-zinc-900" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-zinc-900 font-bold text-sm">Escanea para pagar ${reservation?.total_price}</p>
                  <p className="text-zinc-500 text-xs">Válido por 10:00 minutos</p>
                </div>
              </div>
            )}

            <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl text-xs text-zinc-500">
              <p>Tu información está protegida por encriptación de 256 bits y certificaciones PCI. Ready2Drive no almacena datos de tu tarjeta.</p>
            </div>
          </div>

          {/* Payment Summary & Action */}
          <div className="space-y-6">
            <Card variant="glass" className="border-emerald-500/30">
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Resumen de la Orden</p>
                  <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-bold">{car?.brand} {car?.model}</h3>
                    <span className="text-zinc-500 text-sm">#{reservationId?.toString().slice(0,8)}</span>
                  </div>
                </div>

                <div className="space-y-4 py-6 border-y border-zinc-800">
                  <div className="flex justify-between text-zinc-400">
                    <span className="flex items-center gap-2"><Ticket className="w-4 h-4" /> Subtotal Renta + Seguro</span>
                    <span className="text-white font-bold">${((reservation?.total_price ?? 0) / 1.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span className="italic">Comisión Bancaria (5%)</span>
                    <span className="text-white font-bold">${((reservation?.total_price ?? 0) - ((reservation?.total_price ?? 0) / 1.05)).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl">
                  <span className="text-emerald-500 font-bold uppercase text-xs tracking-widest">A Pagar Hoy</span>
                  <span className="text-3xl font-black italic text-emerald-400">${reservation?.total_price}</span>
                </div>

                {paymentError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                    {paymentError}
                  </div>
                )}

                <Button
                  onClick={() => { setPaymentError(null); handlePayment(); }}
                  isLoading={processing}
                  variant="emerald"
                  size="lg"
                  className="w-full h-16 text-xl shadow-emerald-500/25"
                >
                  {processing ? 'Procesando con el Banco...' : `Pagar con ${paymentMethod === 'card' ? 'Tarjeta' : 'QuickPay'}`}
                </Button>

                <div className="flex justify-center flex-wrap gap-4 opacity-30 grayscale hover:opacity-100 transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                </div>
              </CardContent>
            </Card>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-emerald-500/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">Reserva Protegida</p>
                  <p className="text-xs text-zinc-500">Seguros locales incluidos</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:text-emerald-400 transition-colors" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
