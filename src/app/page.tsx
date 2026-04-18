"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
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
  Activity,
  Gauge,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Dynamic import with SSR disabled for Three.js components
const ParticleField = dynamic(() => import("@/components/three/ParticleField"), { ssr: false });
const CarShowcase = dynamic(() => import("@/components/three/CarShowcase"), { ssr: false });

const cubicEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: cubicEase },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: cubicEase },
  },
};

export default function UnifiedLanding() {
  const [hoveredSide, setHoveredSide] = useState<"taller" | "rentas" | null>(null);

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-accent-500/30 overflow-x-hidden font-sans">

      {/* Three.js Particle Background */}
      <Suspense fallback={null}>
        <ParticleField
          className="fixed inset-0 z-0 opacity-40"
          particleColor={hoveredSide === "taller" ? "#f97316" : "#10b981"}
          particleCount={350}
        />
      </Suspense>

      {/* Dynamic Background Gradients */}
      <AnimatePresence>
        {hoveredSide === "taller" && (
          <motion.div
            key="taller-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-600/20 rounded-full blur-[160px]" />
          </motion.div>
        )}
        {hoveredSide === "rentas" && (
          <motion.div
            key="rentas-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-0 pointer-events-none"
          >
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/20 rounded-full blur-[160px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Glass Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: cubicEase }}
        className="fixed top-0 w-full z-50 px-6 py-6 flex justify-center"
      >
        <div className="max-w-7xl w-full flex items-center justify-between bg-zinc-900/40 backdrop-blur-2xl border border-white/5 px-8 py-3 rounded-full">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-accent-500/20">
              <Wrench className="w-4 text-white" />
            </div>
            <span className="text-xl font-black italic tracking-tighter uppercase">
              AutoMaster <span className="text-accent-500">AI</span>
            </span>
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
      </motion.nav>

      {/* Main Hero Split */}
      <main className="relative flex flex-col md:flex-row min-h-screen pt-24 z-10">

        {/* Left Track: AutoMaster Taller */}
        <section
          onMouseEnter={() => setHoveredSide("taller")}
          onMouseLeave={() => setHoveredSide(null)}
          className={`flex-1 relative group cursor-pointer transition-all duration-700 ${
            hoveredSide === "rentas" ? "md:flex-[0.7] grayscale opacity-50" : "md:flex-[1.3]"
          }`}
        >
          <div className="h-full flex flex-col justify-center p-8 md:p-20 relative z-10">
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-400 text-[10px] font-black uppercase tracking-widest mb-6 w-fit"
            >
              <Zap className="w-3 h-3" /> Mantenimiento Inteligente
            </motion.div>

            <motion.h2 custom={1} initial="hidden" animate="visible" variants={fadeUp}
              className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8"
            >
              Taller <br /> <span className="text-accent-500">AutoMaster</span>
            </motion.h2>

            <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="max-w-md text-zinc-400 font-medium text-lg leading-relaxed mb-12"
            >
              Analítica predictiva y diagnóstico por IA para que tu vehículo nunca se detenga. El futuro de la mecánica está aquí.
            </motion.p>

            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/login">
                <Button className="h-16 px-10 bg-accent-500 hover:bg-accent-600 text-white font-black uppercase tracking-widest text-xs group/btn">
                  Agendar Cita <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Activity className="w-4 h-4 text-accent-500" /> Diagnóstico AI Vivo
              </div>
            </motion.div>

            {/* Float Card (Left) */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute bottom-10 right-10 hidden xl:block"
            >
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-2xl hover:scale-105 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Motor Escaneado</p>
                    <p className="text-xs font-black">Estado: Óptimo</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486006396193-471034b3e3ef?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
        </section>

        {/* Center Divider with 3D Showcase */}
        <div className="hidden md:flex flex-col items-center justify-center relative w-24 z-20">
          <div className="h-1/3 w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent" />

          {/* 3D Sphere replacing static "VS" */}
          <Suspense fallback={
            <div className="w-16 h-16 bg-[#020202] border border-zinc-800 rounded-full flex items-center justify-center text-zinc-600 text-[10px] font-bold">
              VS
            </div>
          }>
            <div className="w-20 h-20 relative">
              <CarShowcase className="w-full h-full" />
            </div>
          </Suspense>

          <div className="h-1/3 w-px bg-gradient-to-t from-transparent via-zinc-800 to-transparent" />
        </div>

        {/* Mobile Divider */}
        <div className="md:hidden flex items-center justify-center py-8">
          <div className="w-16 h-px bg-zinc-800" />
          <div className="mx-4 w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-600 text-[10px] font-bold">
            VS
          </div>
          <div className="w-16 h-px bg-zinc-800" />
        </div>

        {/* Right Track: Ready2DriveSV Rentas */}
        <section
          onMouseEnter={() => setHoveredSide("rentas")}
          onMouseLeave={() => setHoveredSide(null)}
          className={`flex-1 relative group cursor-pointer transition-all duration-700 ${
            hoveredSide === "taller" ? "md:flex-[0.7] grayscale opacity-50" : "md:flex-[1.3]"
          }`}
        >
          <div className="h-full flex flex-col justify-center items-end p-8 md:p-20 text-right relative z-10">
            <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <Star className="w-3 h-3" /> Alquiler Premium El Salvador
            </motion.div>

            <motion.h2 custom={1} initial="hidden" animate="visible" variants={fadeUp}
              className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-8"
            >
              Ready <br /> <span className="text-emerald-500">2 Drive SV</span>
            </motion.h2>

            <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="max-w-md text-zinc-400 font-medium text-lg leading-relaxed mb-12"
            >
              Experimenta la libertad con nuestra flota de lujo. Autos inspeccionados por AutoMaster para tu total seguridad.
            </motion.p>

            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
              className="flex flex-col sm:flex-row-reverse gap-4"
            >
              <Link href="/ready2drivesv">
                <Button className="h-16 px-10 bg-emerald-500 hover:bg-emerald-600 text-zinc-900 font-black uppercase tracking-widest text-xs group/btn">
                  Explorar Flota <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] md:flex-row-reverse">
                <Globe className="w-4 h-4 text-emerald-500 ml-2" /> Reserva Express
              </div>
            </motion.div>

            {/* Float Card (Right) */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="absolute top-10 left-10 hidden xl:block"
            >
              <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-2xl text-left hover:scale-105 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Car className="w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">SUV Lujo Disponible</p>
                    <p className="text-xs font-black">Desde $45/día</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-10 group-hover:opacity-20 transition-opacity duration-700" />
        </section>
      </main>

      {/* Stats Counter Bar */}
      <section className="relative z-10 border-y border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "500+", label: "Vehículos Diagnosticados", icon: Gauge },
            { value: "98%", label: "Satisfacción del Cliente", icon: Star },
            { value: "24/7", label: "Soporte Técnico", icon: Clock },
            { value: "15d", label: "Ciclo de Inspección Flota", icon: Shield },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <stat.icon className="w-6 h-6 text-emerald-500 mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">{stat.value}</p>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Shared Ecosystem Section */}
      <section id="ecosystem" className="py-32 px-6 relative bg-gradient-to-b from-[#020202] to-[#050505] z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <span className="text-accent-500 text-xs font-black uppercase tracking-[0.4em]">Ecosistema AutoMaster</span>
              <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                Mantenemos lo que <br /> <span className="text-emerald-500 underline decoration-4 underline-offset-8">conducimos</span>
              </h3>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-sm text-zinc-500 text-sm font-medium"
            >
              Ready2Drive no es una rentadora común. Cada vehículo de nuestra flota pasa por el escaneo predictivo de AutoMaster cada 15 días.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Settings, color: "text-accent-500", title: "Precisión Mecánica", desc: "Todo vehículo en renta tiene certificado de salud digital vigente emitido por nuestro taller." },
              { icon: Clock, color: "text-emerald-500", title: "Tiempo es Oro", desc: "Reserva tu renta mientras dejas tu auto personal en mantenimiento. Movilidad sin interrupciones." },
              { icon: Sparkles, color: "text-accent-400", title: "Detallado Premium", desc: "Limpieza profunda y desinfección de grado clínico en cada renta y cada servicio mecánico." },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="p-8 bg-zinc-900/20 border border-white/5 rounded-[2rem] hover:bg-zinc-900/40 hover:border-white/10 transition-colors group"
              >
                <card.icon className={`w-12 h-12 ${card.color} mb-6 group-hover:scale-110 transition-transform`} />
                <h4 className="text-xl font-bold uppercase mb-4 tracking-tighter">{card.title}</h4>
                <p className="text-zinc-500 text-sm">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-24 px-6 relative z-10 bg-[#030303]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <span className="text-emerald-500 text-xs font-black uppercase tracking-[0.4em]">Cómo Funciona</span>
            <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">
              3 pasos, <span className="text-emerald-500">0 complicaciones</span>
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Elige tu auto", desc: "Explora nuestra flota certificada y selecciona el vehículo perfecto para tu viaje." },
              { step: "02", title: "Reserva online", desc: "Confirma tu reserva en segundos con pago seguro vía Serfinsa o BAC." },
              { step: "03", title: "Conduce libre", desc: "Retira tu auto y disfruta. Seguro, kilometraje ilimitado y soporte 24/7 incluidos." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="text-center space-y-4"
              >
                <div className="text-6xl font-black italic text-zinc-900 tracking-tighter">{item.step}</div>
                <h4 className="text-xl font-bold uppercase tracking-tighter">{item.title}</h4>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Footer Section */}
      <section id="trust" className="py-24 border-t border-white/5 bg-[#050505] relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-12">
            Empoderando conductores en El Salvador
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center opacity-40">
            {["Toyota", "Honda", "BMW", "Mercedes"].map((brand) => (
              <span key={brand} className="text-white text-2xl font-black italic tracking-tighter hover:opacity-100 transition-opacity uppercase cursor-default">
                {brand}
              </span>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24"
          >
            <Link href="/login">
              <Button className="h-16 px-12 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:border-white transition-all text-[10px] font-black uppercase tracking-[0.4em]">
                Únete al Ecosistema Digital <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center relative z-10">
        <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} AutoMaster AI x Ready2Drive SV. Digital Excellence.
        </p>
      </footer>
    </div>
  );
}
