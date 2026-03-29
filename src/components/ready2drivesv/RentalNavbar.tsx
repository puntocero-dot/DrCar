"use client";

import Link from "next/link";
import { User, LogOut, Menu, X, Car, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function RentalNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/ready2drivesv" className="group">
          <h1 className="text-2xl font-black italic tracking-tighter text-white group-hover:text-emerald-400 transition-colors">
            READY2DRIVE<span className="text-emerald-500 underline decoration-2 underline-offset-4">SV</span>
          </h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/ready2drivesv" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Catálogo</Link>
          <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Volver a AutoMaster</Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-white leading-none">{user.user_metadata?.full_name || user.email}</span>
                <span className="text-[10px] text-emerald-400 font-medium">Cliente Premium</span>
              </div>
              <Link href="/dashboard" className="p-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-emerald-500/50 transition-all text-zinc-400 hover:text-emerald-400">
                <User className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-900 font-bold px-6 py-2 rounded-full text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              Iniciar Sesión
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-900 md:hidden p-6 space-y-4 animate-in slide-in-from-top-4">
          <Link href="/ready2drivesv" className="block text-zinc-400 hover:text-white font-medium" onClick={() => setIsOpen(false)}>Catálogo</Link>
          <Link href="/dashboard" className="block text-zinc-400 hover:text-white font-medium" onClick={() => setIsOpen(false)}>Volver a AutoMaster</Link>
          {!user && (
            <Link href="/login" className="block text-emerald-400 font-bold" onClick={() => setIsOpen(false)}>Iniciar Sesión</Link>
          )}
        </div>
      )}
    </nav>
  );
}
