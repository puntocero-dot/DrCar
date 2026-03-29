"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Calendar, MapPin, Info, Loader2 } from "lucide-react";

export function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pickupLocation, setPickupLocation] = useState(searchParams.get("pickup") || "");
  const [returnLocation, setReturnLocation] = useState(searchParams.get("return_loc") || "");
  const [pickupDate, setPickupDate] = useState(searchParams.get("start") || "");
  const [returnDate, setReturnDate] = useState(searchParams.get("end") || "");
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Create query string
    const params = new URLSearchParams();
    if (pickupLocation) params.set("pickup", pickupLocation);
    if (returnLocation) params.set("return_loc", returnLocation);
    if (pickupDate) params.set("start", pickupDate);
    if (returnDate) params.set("end", returnDate);

    // Update URL without full refresh
    router.push(`/ready2drivesv?${params.toString()}`, { scroll: false });

    // Simulate search logic
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSearching(false);

    // Scroll to catalog section
    const catalog = document.getElementById('catalog-section');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto -mt-16 sm:-mt-24 relative z-10 px-4">
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          
          {/* Ubicación de Entrega */}
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Lugares de Retiro
            </label>
            <select 
              value={pickupLocation}
              onChange={(e) => {
                setPickupLocation(e.target.value);
                if (!returnLocation) setReturnLocation(e.target.value);
              }}
              className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none appearance-none"
              required
              disabled={isSearching}
            >
              <option value="" disabled>Seleccionar ciudad...</option>
              <option value="San Salvador">San Salvador</option>
              <option value="Santa Ana">Santa Ana</option>
              <option value="San Miguel">San Miguel</option>
              <option value="Aeropuerto Comalapa">Aeropuerto Int. El Salvador</option>
            </select>
          </div>

          {/* Fecha y Hora Retiro */}
          <div className="w-full md:w-auto space-y-2">
            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Fecha y Hora Retiro
            </label>
            <input 
              type="datetime-local" 
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
              required
              disabled={isSearching}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Fecha y Hora Devolución */}
          <div className="w-full md:w-auto space-y-2">
            <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Fecha y Hora Devolución
            </label>
            <input 
              type="datetime-local" 
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all outline-none"
              required
              disabled={isSearching}
              min={pickupDate || new Date().toISOString().slice(0, 16)}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isSearching}
            className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 px-8 rounded-xl flex justify-center items-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/25 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:scale-100"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>{isSearching ? 'Buscando...' : 'Buscar Auto'}</span>
          </button>
        </form>
        
        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
          <Info className="w-3 h-3" />
          <span>Es posible que se apliquen cargos extra por devoluciones en ciudades diferentes.</span>
        </div>
      </div>
    </div>
  );
}
