"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Car,
  Wrench,
  Users,
  Clock,
  ChevronRight,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ClipboardList,
  Paintbrush,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STATUS_COLORS: Record<string, string> = {
  en_espera: "bg-amber-500/10 text-amber-400",
  en_proceso: "bg-blue-500/10 text-blue-400",
  esperando_repuestos: "bg-orange-500/10 text-orange-400",
  listo_entrega: "bg-emerald-500/10 text-emerald-400",
  completado: "bg-green-500/10 text-green-400",
  cancelado: "bg-red-500/10 text-red-400",
  programada: "bg-blue-500/10 text-blue-400",
  confirmada: "bg-emerald-500/10 text-emerald-400",
  completada: "bg-green-500/10 text-green-400",
};

const STATUS_LABELS: Record<string, string> = {
  en_espera: "En Espera",
  en_proceso: "En Proceso",
  esperando_repuestos: "Esperando Repuestos",
  listo_entrega: "Listo para Entrega",
  completado: "Completado",
  cancelado: "Cancelado",
  programada: "Programada",
  confirmada: "Confirmada",
  completada: "Completada",
};

export default function AdminDashboard() {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const [repairsRes, appointmentsRes, vehiclesRes] = await Promise.all([
          (supabase
            .from("reparaciones") as any)
            .select("*, vehiculos(license_plate, make, model), profiles!reparaciones_technician_id_fkey(full_name)")
            .order("created_at", { ascending: false })
            .limit(20),
          (supabase
            .from("citas") as any)
            .select("*, vehiculos(license_plate, make, model), profiles!citas_client_id_fkey(full_name)")
            .gte("scheduled_date", new Date().toISOString())
            .order("scheduled_date", { ascending: true })
            .limit(10),
          (supabase
            .from("vehiculos") as any)
            .select("*, profiles!vehiculos_client_id_fkey(full_name)")
            .order("created_at", { ascending: false })
            .limit(20),
        ]);

        setRepairs((repairsRes.data as any[]) || []);
        setAppointments((appointmentsRes.data as any[]) || []);
        setVehicles((vehiclesRes.data as any[]) || []);
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  const todayAppointments = appointments.filter((a) => {
    const date = new Date(a.scheduled_date);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  });

  const activeRepairs = repairs.filter((r) => !["completado", "cancelado"].includes(r.status));

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
        <p className="text-steel-400">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Panel de <span className="text-accent-400">Administración</span>
          </h1>
          <p className="text-steel-400">Gestiona citas, reparaciones y operaciones del taller.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel-500" />
            <input
              type="text"
              placeholder="Buscar placa, cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Citas Hoy", value: todayAppointments.length, icon: Calendar, color: "text-blue-400" },
          { label: "Reparaciones Activas", value: activeRepairs.length, icon: Wrench, color: "text-accent-400" },
          { label: "Vehículos Registrados", value: vehicles.length, icon: Car, color: "text-emerald-400" },
          { label: "Completadas (Mes)", value: repairs.filter((r) => r.status === "completado").length, icon: CheckCircle2, color: "text-green-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-navy-900/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-navy-800 rounded-xl">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-steel-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paint Workshop Card */}
      <Card className="bg-navy-900/50 border border-navy-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-400/10 rounded-xl flex-shrink-0">
              <Paintbrush className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-white">Taller de Pintura</h2>
              <p className="text-steel-400 text-sm mt-1">
                Crea y gestiona sesiones de visualización de color para los clientes
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <a
                  href="/paint-visualizer"
                  className="flex items-center gap-1.5 text-sm font-medium bg-yellow-400 hover:bg-yellow-300 text-gray-950 rounded-lg px-4 py-2 transition-colors"
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  Nueva sesión
                </a>
                <button
                  disabled
                  title="Próximamente"
                  className="flex items-center gap-1.5 text-sm font-medium border border-navy-700 text-steel-500 rounded-lg px-4 py-2 cursor-not-allowed opacity-50"
                >
                  Ver todas las sesiones
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Appointments Today */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" /> Citas de Hoy
          </h2>
          {todayAppointments.length === 0 ? (
            <Card className="bg-navy-900/30 border-dashed border-navy-800 p-8 text-center">
              <p className="text-steel-500">No hay citas programadas para hoy.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <Card key={apt.id} className="hover:border-blue-500/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white text-sm">{apt.profiles?.full_name || "Cliente"}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[apt.status] || ""}`}>
                        {STATUS_LABELS[apt.status] || apt.status}
                      </span>
                    </div>
                    <p className="text-xs text-steel-400">{apt.service_type}</p>
                    <p className="text-xs text-steel-500 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(apt.scheduled_date).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                      {apt.vehiculos && ` - ${apt.vehiculos.make} ${apt.vehiculos.model}`}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Active Repairs Board */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-accent-400" /> Reparaciones Activas
          </h2>
          {activeRepairs.length === 0 ? (
            <Card className="bg-navy-900/30 border-dashed border-navy-800 p-8 text-center">
              <p className="text-steel-500">No hay reparaciones activas.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRepairs.slice(0, 6).map((repair) => (
                <Card key={repair.id} className="hover:border-accent-500/30 transition-all">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm truncate flex-1">{repair.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 whitespace-nowrap ${STATUS_COLORS[repair.status] || ""}`}>
                        {STATUS_LABELS[repair.status] || repair.status}
                      </span>
                    </div>
                    <div className="text-xs text-steel-400 space-y-1">
                      <p>
                        <Car className="w-3 h-3 inline mr-1" />
                        {repair.vehiculos ? `${repair.vehiculos.make} ${repair.vehiculos.model} (${repair.vehiculos.license_plate})` : "Sin vehículo"}
                      </p>
                      <p>
                        <Users className="w-3 h-3 inline mr-1" />
                        Técnico: {repair.profiles?.full_name || "Sin asignar"}
                      </p>
                    </div>
                    {repair.priority === "urgente" && (
                      <div className="flex items-center gap-1 text-red-400 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" /> URGENTE
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
