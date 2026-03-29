"use client";

import React from "react";
import { CheckCircle2, Car, Calendar, MapPin, User, Hash, ExternalLink, Printer } from "lucide-react";
import { RentalReservation, RentalCar } from "@/lib/types/database";

interface BookingReceiptProps {
  reservation: any; // Using any due to complex join types in Supabase
  car: RentalCar | null;
}

export function BookingReceipt({ reservation, car }: BookingReceiptProps) {
  if (!reservation || !car) return null;

  const handlePrint = () => {
    window.print();
  };

  const subtotal = reservation.total_price / 1.05;
  const commission = reservation.total_price - subtotal;

  return (
    <div className="bg-white text-zinc-900 p-12 rounded-3xl max-w-2xl mx-auto shadow-2xl print:shadow-none print:p-0 print:m-0" id="receipt-content">
      {/* Header */}
      <div className="flex justify-between items-start mb-12 border-b border-zinc-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter">READY2DRIVE<span className="text-emerald-600">SV</span></h1>
          </div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Comprobante de Reservación</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-400 text-xs font-bold uppercase mb-1">ID Reserva</p>
          <p className="font-mono font-bold text-zinc-900">#{reservation.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <User className="w-3 h-3" /> Información del Cliente
            </h3>
            <p className="font-bold text-zinc-800">Cliente Registrado</p>
            <p className="text-sm text-zinc-500">Sesión Activa Supabase</p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Fechas y Horarios
            </h3>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Retiro: <span className="text-zinc-500 font-normal">{new Date(reservation.pickup_date).toLocaleString()}</span></p>
              <p className="text-sm font-semibold">Devolución: <span className="text-zinc-500 font-normal">{new Date(reservation.return_date).toLocaleString()}</span></p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Car className="w-3 h-3" /> Vehículo Seleccionado
            </h3>
            <p className="font-bold text-zinc-800">{car.brand} {car.model}</p>
            <p className="text-sm text-zinc-500">{car.year} • {car.transmission} • {car.fuel_type}</p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Ubicación
            </h3>
            <p className="text-sm text-zinc-800 font-semibold">{reservation.pickup_location}</p>
            <p className="text-[10px] text-zinc-500 italic">Mismo punto para entrega</p>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-zinc-50 rounded-2xl p-6 mb-12 space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500">Subtotal Renta y Seguros</span>
          <span className="font-bold text-zinc-800">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-sm italic">
          <span className="text-zinc-500">Comisión Bancaria (BAC/Serfinsa 5%)</span>
          <span className="font-bold text-zinc-800">${commission.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
          <span className="font-black italic text-zinc-400 uppercase tracking-tighter">Total Pagado</span>
          <span className="text-3xl font-black italic text-emerald-600">${reservation.total_price.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer / Instructions */}
      <div className="text-center space-y-4">
        <div className="flex justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Pago Confirmado vía Red Serfinsa</p>
        </div>
        <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-bold tracking-tight">
          Presenta este comprobante (digital o impreso) junto a tu licencia de conducir vigente al momento del retiro. 
          Kilometraje ilimitado en territorio nacional (El Salvador).
        </p>
      </div>

      {/* Print Button (Hidden on Print) */}
      <div className="mt-12 flex justify-center print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-xl"
        >
          <Printer className="w-5 h-5" /> Imprimir / Guardar como PDF
        </button>
      </div>
    </div>
  );
}
