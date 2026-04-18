import { Suspense } from "react";
import { BookingForm } from "@/components/ready2drivesv/BookingForm";
import { CarCatalog } from "@/components/ready2drivesv/CarCatalog";

export const metadata = {
  title: "Ready2Drive SV | Premium Car Rental",
  description: "Renta los mejores autos en El Salvador con Ready2Drive SV.",
};

export default function Ready2DrivePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 pb-24">
      
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image / Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
          <img 
            src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2000" 
            alt="Ready2Drive SV Hero" 
            className="w-full h-full object-cover object-center transform scale-105"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400 text-sm font-semibold tracking-wider">MÓDULO INDEPENDIENTE SV</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            Descubre Tu Próximo Destino
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto font-medium">
            Alquiler de vehículos premium, confiables y con las mejores tarifas. 
            Reserva hoy y viaja con total libertad.
          </p>
        </div>
      </section>

      {/* Booking Form Overlapping Hero */}
      <section className="relative z-20">
        <Suspense fallback={null}>
          <BookingForm />
        </Suspense>
      </section>

      {/* Catalog Section */}
      <section id="catalog-section" className="relative z-10 bg-black pt-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Nuestra Flota Premium</h2>
          <p className="text-zinc-400">Selecciona el vehículo perfecto para tu viaje</p>
        </div>
        <Suspense fallback={null}>
          <CarCatalog />
        </Suspense>
      </section>

    </div>
  );
}
