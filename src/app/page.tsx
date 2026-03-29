"use client";

import React from "react";
import { 
  Car, 
  Wrench, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Zap,
  Globe
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ModuleSelector() {
  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden selection:bg-accent-500/30">
      
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-12 min-h-screen max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">
             <Globe className="w-3 h-3 text-accent-400" /> Ecosistema Digital Automotriz
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase sm:leading-tight">
            BIENVENIDO A <span className="text-accent-500 underline decoration-4 underline-offset-8">AUTOMASTER</span> <span className="text-emerald-500">AI</span>
          </h1>
          <p className="max-w-xl mx-auto text-zinc-400 text-lg font-medium leading-relaxed">
            Gestión inteligente de taller y renta de vehículos premium en un solo lugar. Elige tu destino hoy.
          </p>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl animate-in fade-in zoom-in duration-1000 delay-200">
          
          {/* Card 1: AutoMaster Workshop */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-500/20 to-accent-600/20 rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-1000" />
            <div className="relative h-full bg-[#0a0a0a] border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 flex flex-col items-start overflow-hidden">
              <div className="absolute top-0 right-0 p-12 pointer-events-none">
                 <Wrench className="w-48 h-48 text-accent-500/5 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-700" />
              </div>
              
              <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center mb-8 border border-accent-500/20 shadow-2xl shadow-accent-500/10">
                 <Zap className="w-8 h-8 text-accent-400" />
              </div>
              
              <div className="space-y-4 mb-12 flex-1">
                <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Módulo Taller / AI</h2>
                <p className="text-zinc-400 font-medium leading-relaxed max-w-xs">
                  Plataforma avanzada de mantenimiento automotriz con diagnósticos predictivos y gestión de reparaciones.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="text-[10px] font-bold px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 uppercase">Gestión ERP</span>
                  <span className="text-[10px] font-bold px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 uppercase">Predictive AI</span>
                </div>
              </div>

              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full group/btn h-14 text-sm font-bold uppercase tracking-widest gap-2 bg-white text-black border-white hover:bg-accent-500 hover:text-white hover:border-accent-500 transition-all">
                  Acceder al Taller <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Ready2DriveSV Rentals */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-[2.5rem] blur opacity-50 group-hover:opacity-100 transition duration-1000" />
            <div className="relative h-full bg-[#0a0a0a] border border-zinc-800 rounded-[2.5rem] p-8 md:p-12 flex flex-col items-start overflow-hidden">
               <div className="absolute top-0 right-0 p-12 pointer-events-none">
                 <Car className="w-48 h-48 text-emerald-500/5 rotate-[15deg] group-hover:rotate-0 transition-transform duration-700" />
              </div>

              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                 <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              
              <div className="space-y-4 mb-12 flex-1">
                <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Ready2Drive SV</h2>
                <p className="text-zinc-400 font-medium leading-relaxed max-w-xs">
                  Tu próxima aventura comienza aquí. Alquila vehículos premium con reserva digital inmediata en El Salvador.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="text-[10px] font-bold px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 uppercase">Luxury Fleet</span>
                  <span className="text-[10px] font-bold px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 uppercase">Express Booking</span>
                </div>
              </div>

              <Link href="/ready2drivesv" className="w-full">
                <Button variant="emerald" className="w-full group/btn h-14 text-sm font-bold uppercase tracking-widest gap-2 transition-all">
                  Rentar un Vehículo <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

        </div>

        {/* Trusted By / Feature Footer */}
        <div className="mt-20 pt-12 border-t border-zinc-900/50 w-full grid grid-cols-2 md:grid-cols-4 gap-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="space-y-1">
            <p className="text-white font-bold text-2xl tracking-tighter italic uppercase">100%</p>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Digital El Salvador</p>
          </div>
          <div className="space-y-1">
            <p className="text-white font-bold text-2xl tracking-tighter italic uppercase">30+</p>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Vehículos Premium</p>
          </div>
          <div className="space-y-1">
             <div className="flex justify-center gap-1.5 mb-1.5">
               <ShieldCheck className="w-5 h-5 text-emerald-500" />
             </div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Reservas Seguras</p>
          </div>
          <div className="space-y-1">
             <div className="flex justify-center gap-1.5 mb-1.5">
               <Clock className="w-5 h-5 text-accent-500" />
             </div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Atención 24/7</p>
          </div>
        </div>

      </main>

      {/* Footer Copyright */}
      <footer className="relative z-10 py-8 text-center border-t border-zinc-900/30">
        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          &copy; 2024 Automaster AI & Ready2Drive SV. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
