"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Camera,
  Play,
  Pause,
  Package,
  Car,
  Paintbrush,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EvidenceUpload } from "@/components/dashboard/EvidenceUpload";

const STATUS_COLORS: Record<string, string> = {
  en_espera: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  en_proceso: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  esperando_repuestos: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  listo_entrega: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completado: "bg-green-500/10 text-green-400 border-green-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  en_espera: "En Espera",
  en_proceso: "En Proceso",
  esperando_repuestos: "Esperando Repuestos",
  listo_entrega: "Listo para Entrega",
  completado: "Completado",
};

const PRIORITY_COLORS: Record<string, string> = {
  baja: "text-green-400",
  media: "text-blue-400",
  alta: "text-amber-400",
  urgente: "text-red-400",
};

export default function TechnicianDashboard() {
  const [repairs, setRepairs] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepair, setSelectedRepair] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch assigned repairs
        const { data: repairsData } = await (supabase
          .from("reparaciones") as any)
          .select("*, vehiculos(license_plate, make, model, year), profiles!reparaciones_client_id_fkey(full_name, phone)")
          .eq("technician_id", session.user.id)
          .not("status", "in", '("completado","cancelado")')
          .order("priority", { ascending: false })
          .order("created_at", { ascending: true });

        setRepairs((repairsData as any[]) || []);

        // Fetch tasks for first repair
        if (repairsData && repairsData.length > 0) {
          setSelectedRepair(repairsData[0].id);
          const { data: tasksData } = await (supabase
            .from("reparacion_tareas") as any)
            .select("*")
            .eq("reparacion_id", (repairsData as any[])[0].id)
            .order("created_at", { ascending: true });

          setTasks((tasksData as any[]) || []);
        }
      } catch (err) {
        console.error("Technician dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  const loadTasks = async (repairId: string) => {
    setSelectedRepair(repairId);
    const { data } = await (supabase
      .from("reparacion_tareas") as any)
      .select("*")
      .eq("reparacion_id", repairId)
      .order("created_at", { ascending: true });
    setTasks((data as any[]) || []);
  };

  const updateRepairStatus = async (repairId: string, newStatus: string) => {
    const { error } = await (supabase
      .from("reparaciones") as any)
      .update({ status: newStatus })
      .eq("id", repairId);

    if (!error) {
      setRepairs((prev) =>
        prev.map((r) => (r.id === repairId ? { ...r, status: newStatus } : r))
      );
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completada" ? "pendiente" : "completada";
    const { error } = await (supabase
      .from("reparacion_tareas") as any)
      .update({ status: newStatus })
      .eq("id", taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
        <p className="text-steel-400">Cargando tus reparaciones asignadas...</p>
      </div>
    );
  }

  const currentRepair = repairs.find((r) => r.id === selectedRepair);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Panel de <span className="text-accent-400">Técnico</span>
        </h1>
        <p className="text-steel-400">Tus reparaciones asignadas y tareas pendientes.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Asignadas", value: repairs.length, icon: Wrench, color: "text-accent-400" },
          { label: "En Proceso", value: repairs.filter((r) => r.status === "en_proceso").length, icon: Play, color: "text-blue-400" },
          { label: "Esperando Piezas", value: repairs.filter((r) => r.status === "esperando_repuestos").length, icon: Package, color: "text-orange-400" },
          { label: "Listas", value: repairs.filter((r) => r.status === "listo_entrega").length, icon: CheckCircle2, color: "text-emerald-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-navy-900/50">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-steel-500 uppercase tracking-wider">{stat.label}</p>
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
                Crea sesiones de visualización de color para tus clientes
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <a
                  href="/paint-visualizer"
                  className="flex items-center gap-1.5 text-sm font-medium bg-yellow-400 hover:bg-yellow-300 text-gray-950 rounded-lg px-4 py-2 transition-colors"
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  Nueva sesión de pintura
                </a>
                <button
                  disabled
                  title="Próximamente"
                  className="flex items-center gap-1.5 text-sm font-medium border border-navy-700 text-steel-500 rounded-lg px-4 py-2 cursor-not-allowed opacity-50"
                >
                  Ver sesiones activas
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Repair List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Mis Reparaciones</h2>
          {repairs.length === 0 ? (
            <Card className="bg-navy-900/30 border-dashed border-navy-800 p-8 text-center">
              <p className="text-steel-500">No tienes reparaciones asignadas.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {repairs.map((repair) => (
                <Card
                  key={repair.id}
                  className={`cursor-pointer transition-all ${
                    selectedRepair === repair.id
                      ? "border-accent-500/50 bg-accent-500/5"
                      : "hover:border-steel-700"
                  }`}
                  onClick={() => loadTasks(repair.id)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm truncate flex-1">{repair.title}</h4>
                      {repair.priority === "urgente" && (
                        <AlertTriangle className="w-4 h-4 text-red-400 ml-2" />
                      )}
                    </div>
                    <p className="text-xs text-steel-400">
                      <Car className="w-3 h-3 inline mr-1" />
                      {repair.vehiculos
                        ? `${repair.vehiculos.make} ${repair.vehiculos.model} (${repair.vehiculos.license_plate})`
                        : "Sin vehículo"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[repair.status] || ""}`}>
                        {STATUS_LABELS[repair.status] || repair.status}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${PRIORITY_COLORS[repair.priority] || ""}`}>
                        {repair.priority}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Repair Detail + Tasks */}
        <div className="xl:col-span-2 space-y-6">
          {currentRepair ? (
            <>
              {/* Repair Detail */}
              <Card className="bg-navy-900/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{currentRepair.title}</h3>
                      <p className="text-steel-400 text-sm mt-1">{currentRepair.description || "Sin descripción"}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[currentRepair.status] || ""}`}>
                      {STATUS_LABELS[currentRepair.status] || currentRepair.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-steel-500 text-xs">Vehículo</p>
                      <p className="text-white font-medium">
                        {currentRepair.vehiculos?.make} {currentRepair.vehiculos?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-steel-500 text-xs">Placa</p>
                      <p className="text-white font-medium">{currentRepair.vehiculos?.license_plate}</p>
                    </div>
                    <div>
                      <p className="text-steel-500 text-xs">Cliente</p>
                      <p className="text-white font-medium">{currentRepair.profiles?.full_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-steel-500 text-xs">Prioridad</p>
                      <p className={`font-bold uppercase ${PRIORITY_COLORS[currentRepair.priority] || ""}`}>
                        {currentRepair.priority}
                      </p>
                    </div>
                  </div>

                  {/* Status Transition Buttons */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-navy-800">
                    {currentRepair.status === "en_espera" && (
                      <Button size="sm" className="gap-1" onClick={() => updateRepairStatus(currentRepair.id, "en_proceso")}>
                        <Play className="w-3 h-3" /> Iniciar
                      </Button>
                    )}
                    {currentRepair.status === "en_proceso" && (
                      <>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => updateRepairStatus(currentRepair.id, "esperando_repuestos")}>
                          <Package className="w-3 h-3" /> Solicitar Repuestos
                        </Button>
                        <Button size="sm" className="gap-1 bg-emerald-500 hover:bg-emerald-600" onClick={() => updateRepairStatus(currentRepair.id, "listo_entrega")}>
                          <CheckCircle2 className="w-3 h-3" /> Marcar Listo
                        </Button>
                      </>
                    )}
                    {currentRepair.status === "esperando_repuestos" && (
                      <Button size="sm" className="gap-1" onClick={() => updateRepairStatus(currentRepair.id, "en_proceso")}>
                        <Play className="w-3 h-3" /> Reanudar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Task Checklist */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Tareas ({tasks.filter((t) => t.status === "completada").length}/{tasks.length})
                </h3>
                {tasks.length === 0 ? (
                  <Card className="bg-navy-900/30 border-dashed border-navy-800 p-6 text-center">
                    <p className="text-steel-500 text-sm">No hay tareas asignadas para esta reparación.</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <Card
                        key={task.id}
                        className={`transition-all ${task.status === "completada" ? "opacity-60" : ""}`}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <button
                            onClick={() => toggleTaskStatus(task.id, task.status)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.status === "completada"
                                ? "bg-emerald-500 border-emerald-500"
                                : "border-steel-600 hover:border-accent-500"
                            }`}
                          >
                            {task.status === "completada" && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </button>
                          <div className="flex-1">
                            <p className={`font-medium text-sm ${task.status === "completada" ? "line-through text-steel-500" : "text-white"}`}>
                              {task.title}
                            </p>
                            {task.description && <p className="text-xs text-steel-500 mt-0.5">{task.description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            {task.requires_evidence && (
                              <span title="Requiere evidencia"><Camera className="w-4 h-4 text-accent-400" /></span>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              task.urgency_level === "rojo" ? "bg-red-500/10 text-red-400" :
                              task.urgency_level === "amarillo" ? "bg-amber-500/10 text-amber-400" :
                              "bg-green-500/10 text-green-400"
                            }`}>
                              {task.task_type}
                            </span>
                          </div>
                        </CardContent>
                        {task.requires_evidence && selectedRepair && (
                          <div className="px-4 pb-4">
                            <EvidenceUpload
                              taskId={task.id}
                              repairId={selectedRepair}
                              requiresEvidence={task.requires_evidence}
                              onUploaded={(url) => console.log("Evidence uploaded:", url)}
                            />
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <Card className="bg-navy-900/30 border-dashed border-navy-800 p-12 text-center">
              <Wrench className="w-12 h-12 text-steel-700 mx-auto mb-4" />
              <p className="text-steel-500">Selecciona una reparación para ver los detalles y tareas.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
