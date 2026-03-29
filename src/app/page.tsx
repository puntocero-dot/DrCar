"use client";

import React, { useState } from "react";
import { 
  Car, 
  Wrench, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Zap,
  Globe,
  Settings,
  ChevronRight,
  Star,
  Activity
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function UnifiedLanding() {
  const [hoveredSide, setHoveredSide] = useState<"taller" | "rentas" | null>(null);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-accent-500/30 overflow-x-hidden font-sans">
      
      {/* Dynamic Background Gradients */}
      <div className={`fixed inset-0 transition-opacity duration-1000 ${hoveredSide === "taller" ? "opacity-40" : "opacity-0"}`}>
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-600/20 rounded-full blur-[160px]" />
      </div>
      <div className={`fixed inset-0 transition-opacity duration-1000 ${hoveredSide === "rentas" ? "opacity-40" : "opacity-0"}`}>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/20 rounded-full blur-[160px]" />
      </div>

      {/* Modern Glass Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-center translate-y-0 animate-in slide-in-from-top-8 duration-700">
        <div className="max-w-7xl w-full flex items-center justify-between bg-zinc-900/40 backdrop-blur-2xl border border-white/5 px-8 py-3 rounded-full">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-accent-500/20">
               <Wrench className="w-4 text-white" />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase">AutoMaster <span className="text-accent-500">AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            <Link href="#ecosystem" className="hover:text-white transition-colors">Ecosistema</Link>
            <Link href="#features" className="hover:text-white transition-colors">Servicios</Link>
            <Link href="#trust" className="hover:text-white transition-colors">Confianza</Link>
          </div>

          <Link href="/login">
            <Button variant="outline" className="h-10 text-[10px] font-black uppercase tracking-[0.2em] border-white/10 hover:bg-white hover:text-black transition-all">
              Mi Cuenta
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Hero Split */}
      <main className="relative flex flex-col md:flex-row min-h-screen pt-24">
        
        {/* Left Track: AutoMaster Taller */}
        <section 
          onMouseEnter={() => setHoveredSide("taller")}
          onMouseLeave={() => setHoveredSide(null)}
          className={`flex-1 relative group cursor-pointer transition-all duration-700 ${hoveredSide === "rentas" ? "md:flex-[0.7] grayscale opacity-50" : "md:flex-[1.3]"}`}
        >
          <div className="h-full flex flex-col justify-center p-8 md:p-20 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3" /> Mantenimiento Inteligente
            </div>
            <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
              Taller <br /> <span className="text-accent-500">AutoMaster</span>
            </h2>
            <p className="max-w-md text-zinc-400 font-medium text-lg leading-relaxed mb-12">
              Analítica predictiva y diagnóstico por IA para que tu vehículo nunca se detenga. El futuro de la mecánica está aquí.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button className="h-16 px-10 bg-accent-500 hover:bg-accent-600 text-white font-black uppercase tracking-widest text-xs group/btn">
                  Agendar Cita <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Activity className="w-4 h-4 text-accent-500" /> Diagnóstico AI Vivo
              </div>
            </div>

            {/* Float Cards (Left) */}
            <div className="absolute bottom-10 right-10 hidden xl:block animate-pulse duration-[3s]">
               <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-2xl">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center"><ShieldCheck className="w-4 text-green-400" /></div>
                   <div>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Motor Escaneado</p>
                     <p className="text-xs font-black">Estado: Óptimo</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
          {/* Subtle BG Image/Overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486006396193-471034b3e3ef?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-10 group-hover:opacity-20 transition-opacity" />
        </section>

        {/* Vertical Divider */}
        <div className="hidden md:flex flex-col items-center justify-center relative w-px h-full">
           <div className="h-1/2 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />
           <div className="absolute center z-20 w-12 h-12 bg-[#020202] border border-zinc-800 rounded-full flex items-center justify-center text-zinc-600 text-[10px] font-bold">VS</div>
           <div className="h-1/2 w-px bg-gradient-to-t from-transparent via-zinc-800 to-transparent" />
        </div>

        {/* Right Track: Ready2DriveSV Rentas */}
        <section 
          onMouseEnter={() => setHoveredSide("rentas")}
          onMouseLeave={() => setHoveredSide(null)}
          className={`flex-1 relative group cursor-pointer transition-all duration-700 ${hoveredSide === "taller" ? "md:flex-[0.7] grayscale opacity-50" : "md:flex-[1.3]"}`}
        >
          <div className="h-full flex flex-col justify-center items-end p-8 md:p-20 text-right relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
              <Star className="w-3 h-3" /> Alquiler Premium El Salvador
            </div>
            <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8">
              Ready <br /> <span className="text-emerald-500">2 Drive SV</span>
            </h2>
            <p className="max-w-md text-zinc-400 font-medium text-lg leading-relaxed mb-12">
              Experimenta la libertad con nuestra flota de lujo. Autos inspeccionados por AutoMaster para tu total seguridad.
            </p>
            
            <div className="flex flex-col sm:flex-row-reverse gap-4">
              <Link href="/ready2drivesv">
                <Button className="h-16 px-10 bg-emerald-500 hover:bg-emerald-600 text-zinc-900 font-black uppercase tracking-widest text-xs group/btn">
                   Explorar Flota <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] md:flex-row-reverse">
                <Globe className="w-4 h-4 text-emerald-500 ml-2" /> Reserva Express
              </div>
            </div>

            {/* Float Cards (Right) */}
            <div className="absolute top-10 left-10 hidden xl:block animate-bounce duration-[4s]">
               <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-2xl text-left">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center"><Car className="w-4 text-emerald-400" /></div>
                   <div>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">SUV Lujo Disponible</p>
                     <p className="text-xs font-black">Desde $45/día</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
          {/* Subtle BG Image/Overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-10 group-hover:opacity-20 transition-opacity" />
        </section>
      </main>

      {/* Shared Ecosystem Section */}
      <section id="ecosystem" className="py-32 px-6 relative bg-gradient-to-b from-[#020202] to-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
               <span className="text-accent-500 text-xs font-black uppercase tracking-[0.4em]">Ecosistema AutoMaster</span>
               <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                 Matenemos lo que <br /> <span className="text-emerald-500 underline decoration-4 underline-offset-8">conducimos</span>
               </h3>
            </div>
            <p className="max-w-sm text-zinc-500 text-sm font-medium">
              Ready2Drive no es una rentadora común. Cada vehículo de nuestra flota pasa por el escaneo predictivo de AutoMaster cada 15 días.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-zinc-900/20 border border-white/5 rounded-[2rem] hover:bg-zinc-900/40 transition-colors">
              <Settings className="w-12 h-12 text-accent-500 mb-6" />
              <h4 className="text-xl font-bold uppercase mb-4 tracking-tighter">Precisión Mecánica</h4>
              <p className="text-zinc-500 text-sm">Todo vehículo en renta tiene certificado de salud digital vigente emitido por nuestro taller.</p>
            </div>
            <div className="p-8 bg-zinc-900/20 border border-white/5 rounded-[2rem] hover:bg-zinc-900/40 transition-colors">
              <Clock className="w-12 h-12 text-emerald-500 mb-6" />
              <h4 className="text-xl font-bold uppercase mb-4 tracking-tighter">Tiempo es Oro</h4>
              <p className="text-zinc-500 text-sm">Reserva tu renta mientras dejas tu auto personal en mantenimiento. Movilidad sin interrupciones.</p>
            </div>
            <div className="p-8 bg-zinc-900/20 border border-white/5 rounded-[2rem] hover:bg-zinc-900/40 transition-colors">
              <Sparkles className="w-12 h-12 text-accent-400 mb-6" />
              <h4 className="text-xl font-bold uppercase mb-4 tracking-tighter">Detallado Premium</h4>
              <p className="text-zinc-500 text-sm">Limpieza profunda y desinfección de grado clínico en cada renta y cada servicio mecánico.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Footer Section */}
      <section id="trust" className="py-24 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-12">Empoderando conductores en El Salvador</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center opacity-40">
             <span className="text-white text-2xl font-black italic tracking-tighter transition-opacity hover:opacity-100 uppercase">Toyota</span>
             <span className="text-white text-2xl font-black italic tracking-tighter transition-opacity hover:opacity-100 uppercase">Honda</span>
             <span className="text-white text-2xl font-black italic tracking-tighter transition-opacity hover:opacity-100 uppercase">BMW</span>
             <span className="text-white text-2xl font-black italic tracking-tighter transition-opacity hover:opacity-100 uppercase">Mercedes</span>
          </div>
          <div className="mt-24">
            <Link href="/login">
              <Button className="h-16 px-12 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:border-white transition-all text-[10px] font-black uppercase tracking-[0.4em]">
                Únete al Ecosistema Digital <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
           &copy; 2024 AutoMaster AI x Ready2Drive SV. Digital Excellence.
        </p>
      </footer>

    </div>
  );
}
