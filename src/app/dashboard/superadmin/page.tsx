'use client'

import { useState, useEffect } from 'react'
import {
  Car,
  Wrench,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  CalendarDays,
  Activity,
  Gauge,
  Bell,
  Loader2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevenuePoint {
  month: string
  ingresos: number
  gastos: number
  isoMonth: string // YYYY-MM, used for period filtering
}

interface RepairStatusItem {
  name: string
  value: number
  color: string
}

interface WorkloadItem {
  day: string
  tareas: number
}

interface RecentRepair {
  id: string
  vehicle: string
  plate: string
  status: string
  technician: string
  priority: string
  created_at: string
}

interface TodayAppointment {
  time: string
  client: string
  vehicle: string
  service: string
}

interface AlertData {
  overdueVehicles: number
  waitingPartsLong: number
  todayCitasCount: number
}

interface DashboardData {
  revenueData: RevenuePoint[]
  repairStatusData: RepairStatusItem[]
  workloadData: WorkloadItem[]
  recentRepairs: RecentRepair[]
  todayAppointments: TodayAppointment[]
  kpi: {
    ingresosMes: number
    vehiculosActivos: number
    reparacionesAbiertas: number
    tecnicosActivos: number
  }
  alerts: AlertData
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function isoMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// ─── Data Fetcher ─────────────────────────────────────────────────────────────

async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = createClient()
  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const todayEnd = endOfDay(now).toISOString()
  const weekStart = startOfWeek(now).toISOString()

  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const threeDaysAgo = new Date(now)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  // Run all queries in parallel
  const [
    repairsCountRes,
    vehiclesCountRes,
    activeRepairsRes,
    techniciansCountRes,
    recentRepairsRes,
    todayCitasRes,
    presupuestosRes,
    workloadRes,
    overdueVehiclesRes,
    waitingPartsRes,
  ] = await Promise.all([
    // 1. Total reparaciones abiertas (count)
    (supabase.from('reparaciones') as any)
      .select('id', { count: 'exact', head: true })
      .not('status', 'in', '("completado","cancelado")'),

    // 2. Vehículos en servicio (count)
    (supabase.from('vehiculos') as any)
      .select('id', { count: 'exact', head: true })
      .eq('status', 'in_service'),

    // 3. Reparaciones activas con status (para pie chart)
    (supabase.from('reparaciones') as any)
      .select('status')
      .not('status', 'in', '("completado","cancelado")'),

    // 4. Técnicos activos
    (supabase.from('profiles') as any)
      .select('id', { count: 'exact', head: true })
      .eq('role', 'technician'),

    // 5. Últimas 10 reparaciones
    (supabase.from('reparaciones') as any)
      .select('id, status, priority, created_at, vehiculos(license_plate, make, model), profiles!reparaciones_technician_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .limit(10),

    // 6. Citas de hoy
    (supabase.from('citas') as any)
      .select('scheduled_date, service_type, profiles!citas_client_id_fkey(full_name), vehiculos(make, model)')
      .gte('scheduled_date', todayStart)
      .lte('scheduled_date', todayEnd)
      .order('scheduled_date', { ascending: true }),

    // 7. Presupuestos aprobados últimos 6 meses (para revenue chart)
    (supabase.from('presupuestos') as any)
      .select('total_amount, created_at')
      .eq('status', 'aprobado')
      .gte('created_at', sixMonthsAgo.toISOString()),

    // 8. Tareas completadas esta semana (workload)
    (supabase.from('reparacion_tareas') as any)
      .select('updated_at, status')
      .eq('status', 'completada')
      .gte('updated_at', weekStart),

    // 9. Vehículos con mantenimiento vencido
    (supabase.from('vehiculos') as any)
      .select('id', { count: 'exact', head: true })
      .lt('next_service_date', now.toISOString()),

    // 10. Reparaciones esperando repuestos > 3 días
    (supabase.from('reparaciones') as any)
      .select('id', { count: 'exact', head: true })
      .eq('status', 'esperando_repuestos')
      .lt('updated_at', threeDaysAgo.toISOString()),
  ])

  // ── KPI ──────────────────────────────────────────────────────────────────────

  const reparacionesAbiertas = repairsCountRes.count ?? 0
  const vehiculosActivos = vehiclesCountRes.count ?? 0
  const tecnicosActivos = techniciansCountRes.count ?? 0

  // Ingresos del mes actual: presupuestos aprobados en el mes corriente
  const currentMonthKey = isoMonth(now)
  const presupuestos: Array<{ total_amount: number; created_at: string }> = presupuestosRes.data ?? []
  const ingresosMes = presupuestos
    .filter((p) => isoMonth(new Date(p.created_at)) === currentMonthKey)
    .reduce((sum, p) => sum + (p.total_amount ?? 0), 0)

  // ── Revenue Chart (last 6 months) ─────────────────────────────────────────

  // Build last-6-months scaffold
  const revenueMap: Record<string, { ingresos: number; label: string }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - i)
    const key = isoMonth(d)
    revenueMap[key] = { ingresos: 0, label: MONTH_LABELS[d.getMonth()] }
  }

  for (const p of presupuestos) {
    const key = isoMonth(new Date(p.created_at))
    if (revenueMap[key]) {
      revenueMap[key].ingresos += p.total_amount ?? 0
    }
  }

  const revenueData: RevenuePoint[] = Object.entries(revenueMap).map(([key, v]) => ({
    month: v.label,
    isoMonth: key,
    ingresos: Math.round(v.ingresos),
    gastos: Math.round(v.ingresos * 0.6), // placeholder: 60% cost ratio until expenses table exists
  }))

  // ── Repair Status Pie ────────────────────────────────────────────────────────

  const activeRepairsRaw: Array<{ status: string }> = activeRepairsRes.data ?? []
  const statusCountsMap: Record<string, number> = {}
  for (const r of activeRepairsRaw) {
    statusCountsMap[r.status] = (statusCountsMap[r.status] ?? 0) + 1
  }

  const statusConfig: Record<string, { name: string; color: string }> = {
    en_espera: { name: 'En Espera', color: '#eab308' },
    en_proceso: { name: 'En Proceso', color: '#3b82f6' },
    esperando_repuestos: { name: 'Esperando Repuestos', color: '#f97316' },
    listo_entrega: { name: 'Listo Entrega', color: '#22c55e' },
  }

  const repairStatusData: RepairStatusItem[] = Object.entries(statusCountsMap)
    .filter((e) => e[1] > 0)
    .map(([status, count]) => ({
      name: statusConfig[status]?.name ?? status,
      value: count,
      color: statusConfig[status]?.color ?? '#627895',
    }))

  // ── Workload Chart ────────────────────────────────────────────────────────────

  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
  const orderedDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
  const workloadMap: Record<string, number> = { Lun: 0, Mar: 0, Mie: 0, Jue: 0, Vie: 0, Sab: 0 }

  const workloadRaw: Array<{ updated_at: string }> = workloadRes.data ?? []
  for (const t of workloadRaw) {
    const dayIndex = new Date(t.updated_at).getDay()
    const label = dayLabels[dayIndex]
    if (label && label !== 'Dom' && workloadMap[label] !== undefined) {
      workloadMap[label]++
    }
  }

  const workloadData: WorkloadItem[] = orderedDays.map((day) => ({ day, tareas: workloadMap[day] }))

  // ── Recent Repairs ────────────────────────────────────────────────────────────

  const recentRepairsRaw: any[] = recentRepairsRes.data ?? []
  const recentRepairs: RecentRepair[] = recentRepairsRaw.map((r, i) => ({
    id: r.id ? String(r.id).slice(0, 8).toUpperCase() : `REP-${String(i + 1).padStart(3, '0')}`,
    vehicle: r.vehiculos ? `${r.vehiculos.make} ${r.vehiculos.model}` : 'Sin vehículo',
    plate: r.vehiculos?.license_plate ?? '---',
    status: r.status ?? 'en_espera',
    technician: r.profiles?.full_name ?? 'Sin asignar',
    priority: r.priority ?? 'media',
    created_at: r.created_at ?? '',
  }))

  // ── Today's Appointments ──────────────────────────────────────────────────────

  const todayCitasRaw: any[] = todayCitasRes.data ?? []
  const todayAppointments: TodayAppointment[] = todayCitasRaw.map((c) => ({
    time: new Date(c.scheduled_date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    client: c.profiles?.full_name ?? 'Cliente',
    vehicle: c.vehiculos ? `${c.vehiculos.make} ${c.vehiculos.model}` : 'Vehículo',
    service: c.service_type ?? 'Servicio',
  }))

  // ── Alerts ────────────────────────────────────────────────────────────────────

  const alerts: AlertData = {
    overdueVehicles: overdueVehiclesRes.count ?? 0,
    waitingPartsLong: waitingPartsRes.count ?? 0,
    todayCitasCount: todayCitasRaw.length,
  }

  return {
    revenueData,
    repairStatusData,
    workloadData,
    recentRepairs,
    todayAppointments,
    kpi: { ingresosMes, vehiculosActivos, reparacionesAbiertas, tecnicosActivos },
    alerts,
  }
}

// ─── Utility Renderers ────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    en_espera: { label: 'En Espera', className: 'badge-warning' },
    en_proceso: { label: 'En Proceso', className: 'badge-info' },
    esperando_repuestos: { label: 'Esperando Repuestos', className: 'bg-accent-500/20 text-accent-400 badge' },
    listo_entrega: { label: 'Listo Entrega', className: 'badge-success' },
  }
  const s = map[status] || { label: status, className: 'badge' }
  return <span className={s.className}>{s.label}</span>
}

function getPriorityBadge(priority: string) {
  const map: Record<string, { label: string; className: string }> = {
    baja: { label: 'Baja', className: 'bg-steel-600/30 text-steel-300 badge' },
    media: { label: 'Media', className: 'badge-info' },
    alta: { label: 'Alta', className: 'badge-warning' },
    urgente: { label: 'Urgente', className: 'badge-danger' },
  }
  const p = map[priority] || { label: priority, className: 'badge' }
  return <span className={p.className}>{p.label}</span>
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [selectedRepair, setSelectedRepair] = useState<RecentRepair | null>(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch((err) => console.error('SuperAdmin dashboard error:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
        <p className="text-steel-400">Cargando dashboard...</p>
      </div>
    )
  }

  const {
    revenueData = [],
    repairStatusData = [],
    workloadData = [],
    recentRepairs = [],
    todayAppointments = [],
    kpi = { ingresosMes: 0, vehiculosActivos: 0, reparacionesAbiertas: 0, tecnicosActivos: 0 },
    alerts = { overdueVehicles: 0, waitingPartsLong: 0, todayCitasCount: 0 },
  } = data ?? {}

  // ── Period filter for AreaChart ───────────────────────────────────────────────
  const now = new Date()
  const filteredRevenue = revenueData.filter((point) => {
    if (period === 'week') {
      // Show only current month when period=week (weekly granularity not available in monthly data)
      return point.isoMonth === isoMonth(now)
    }
    if (period === 'month') {
      // Last 3 months
      const cutoff = new Date(now)
      cutoff.setMonth(cutoff.getMonth() - 2)
      return point.isoMonth >= isoMonth(cutoff)
    }
    // year: all 6 months
    return true
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-steel-400 mt-1">Resumen general del taller</p>
        </div>
        <div className="flex items-center gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-accent-500 text-white'
                  : 'bg-navy-800 text-steel-400 hover:text-white'
              }`}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Anio'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Ingresos del Mes"
          value={`$${kpi.ingresosMes.toLocaleString('en-US')}`}
          change=""
          trend="neutral"
          icon={<DollarSign className="w-6 h-6" />}
          color="accent"
        />
        <StatCard
          title="Vehiculos Activos"
          value={String(kpi.vehiculosActivos)}
          change=""
          trend="neutral"
          icon={<Car className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Reparaciones Abiertas"
          value={String(kpi.reparacionesAbiertas)}
          change=""
          trend="neutral"
          icon={<Wrench className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Tecnicos Activos"
          value={String(kpi.tecnicosActivos)}
          change=""
          trend="neutral"
          icon={<Users className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Ingresos vs Gastos</h3>
            <Activity className="w-5 h-5 text-steel-500" />
          </div>
          <div className="h-72">
            {filteredRevenue.length === 0 ? (
              <div className="h-full flex items-center justify-center text-steel-500 text-sm">
                Sin datos de ingresos para el periodo seleccionado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredRevenue}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#627895" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#627895" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#313a49" />
                  <XAxis dataKey="month" stroke="#627895" fontSize={13} />
                  <YAxis stroke="#627895" fontSize={13} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#152036',
                      border: '1px solid #313a49',
                      borderRadius: '12px',
                      color: '#ebeef3',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#f97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                  />
                  <Area
                    type="monotone"
                    dataKey="gastos"
                    stroke="#627895"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGastos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Repair Status Pie */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Estado Reparaciones</h3>
            <Gauge className="w-5 h-5 text-steel-500" />
          </div>
          {repairStatusData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-steel-500 text-sm">
              Sin reparaciones activas
            </div>
          ) : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={repairStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {repairStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#152036',
                        border: '1px solid #313a49',
                        borderRadius: '12px',
                        color: '#ebeef3',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {repairStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-steel-300">{item.name}</span>
                    </div>
                    <span className="text-white font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Workload + Appointments Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Workload Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Carga de Trabajo Semanal</h3>
            <BarChart className="w-5 h-5 text-steel-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#313a49" />
                <XAxis dataKey="day" stroke="#627895" fontSize={13} />
                <YAxis stroke="#627895" fontSize={13} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#152036',
                    border: '1px solid #313a49',
                    borderRadius: '12px',
                    color: '#ebeef3',
                  }}
                />
                <Bar dataKey="tareas" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Citas de Hoy</h3>
            <CalendarDays className="w-5 h-5 text-steel-500" />
          </div>
          {todayAppointments.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-steel-500 text-sm">
              No hay citas programadas para hoy
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-navy-900 rounded-xl hover:bg-navy-800 transition-colors"
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-accent-400 font-bold text-lg">{apt.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{apt.client}</p>
                    <p className="text-steel-400 text-sm">{apt.vehicle} &mdash; {apt.service}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-steel-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Repairs Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Reparaciones Recientes</h3>
          <button className="btn-secondary text-sm py-2 px-4 min-h-0">Ver todas</button>
        </div>
        {recentRepairs.length === 0 ? (
          <p className="text-steel-500 text-sm py-4 text-center">No hay reparaciones registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-steel-800">
                  <th className="table-header">ID</th>
                  <th className="table-header">Vehiculo</th>
                  <th className="table-header">Placa</th>
                  <th className="table-header">Tecnico</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {recentRepairs.map((repair) => (
                  <tr
                    key={repair.id}
                    className="hover:bg-navy-900/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedRepair(repair)}
                  >
                    <td className="table-cell font-mono text-accent-400 text-sm">{repair.id}</td>
                    <td className="table-cell font-medium text-white">{repair.vehicle}</td>
                    <td className="table-cell text-steel-300">{repair.plate}</td>
                    <td className="table-cell text-steel-300">{repair.technician}</td>
                    <td className="table-cell">{getStatusBadge(repair.status)}</td>
                    <td className="table-cell">{getPriorityBadge(repair.priority)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts Section */}
      <div className="card border-accent-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-white">Alertas del Sistema</h3>
        </div>
        <div className="space-y-3">
          {alerts.overdueVehicles > 0 && (
            <AlertItem
              type="danger"
              message={`${alerts.overdueVehicles} vehículo${alerts.overdueVehicles !== 1 ? 's' : ''} con mantenimiento vencido requiere${alerts.overdueVehicles === 1 ? '' : 'n'} atención inmediata`}
            />
          )}
          {alerts.waitingPartsLong > 0 && (
            <AlertItem
              type="warning"
              message={`${alerts.waitingPartsLong} reparación${alerts.waitingPartsLong !== 1 ? 'es' : ''} esperando repuestos más de 3 días`}
            />
          )}
          <AlertItem
            type="success"
            message={`${alerts.todayCitasCount} cita${alerts.todayCitasCount !== 1 ? 's' : ''} programada${alerts.todayCitasCount !== 1 ? 's' : ''} para hoy`}
          />
          {alerts.overdueVehicles === 0 && alerts.waitingPartsLong === 0 && (
            <AlertItem
              type="success"
              message="Todo en orden — sin alertas críticas en este momento"
            />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRepair && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRepair(null)}
        >
          <div
            className="bg-navy-950 border border-navy-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-accent-400" />
                Detalles del Vehículo
              </h2>
              <button
                onClick={() => setSelectedRepair(null)}
                className="text-steel-400 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 bg-navy-900/50 p-6 rounded-xl border border-navy-800">
              <div>
                <p className="text-xs uppercase text-steel-500 font-bold tracking-wider mb-1">Vehículo</p>
                <p className="font-semibold text-white text-lg">{selectedRepair.vehicle}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-steel-500 font-bold tracking-wider mb-1">Placa</p>
                <p className="font-mono text-accent-400 text-lg bg-accent-500/10 inline-block px-2 py-0.5 rounded border border-accent-500/20">
                  {selectedRepair.plate}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-steel-500 font-bold tracking-wider mb-1">Reparación ID</p>
                <p className="font-mono text-steel-300">{selectedRepair.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-steel-500 font-bold tracking-wider mb-1">Técnico A Cargo</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-navy-700 flex items-center justify-center">
                    <Users className="w-3 h-3 text-steel-400" />
                  </div>
                  <p className="font-medium text-white">{selectedRepair.technician}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-steel-500 font-bold tracking-wider mb-1">Estado Actual</p>
                <div className="mt-1">{getStatusBadge(selectedRepair.status)}</div>
              </div>
              <div>
                <p className="text-xs uppercase text-steel-500 font-bold tracking-wider mb-1">Prioridad</p>
                <div className="mt-1">{getPriorityBadge(selectedRepair.priority)}</div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-navy-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRepair(null)}
                className="px-4 py-2 text-steel-300 hover:text-white transition-colors"
              >
                Cerrar
              </button>
              <button className="btn-primary py-2 px-6 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Ver Historial Completo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
}: {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: 'accent' | 'blue' | 'yellow' | 'green'
}) {
  const colorMap = {
    accent: 'bg-accent-500/15 text-accent-400',
    blue: 'bg-blue-500/15 text-blue-400',
    yellow: 'bg-yellow-500/15 text-yellow-400',
    green: 'bg-green-500/15 text-green-400',
  }

  return (
    <div className="card hover:border-steel-700 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        {change && (
          <div className="flex items-center gap-1 text-sm">
            {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
            <span className={trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-steel-400'}>
              {change}
            </span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-steel-400 text-sm mt-1">{title}</p>
      </div>
    </div>
  )
}

function AlertItem({ type, message }: { type: 'danger' | 'warning' | 'success'; message: string }) {
  const config = {
    danger: { icon: <AlertTriangle className="w-5 h-5 text-red-400" />, bg: 'bg-red-500/10 border-red-500/20' },
    warning: { icon: <Clock className="w-5 h-5 text-yellow-400" />, bg: 'bg-yellow-500/10 border-yellow-500/20' },
    success: { icon: <CheckCircle2 className="w-5 h-5 text-green-400" />, bg: 'bg-green-500/10 border-green-500/20' },
  }

  const c = config[type]

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${c.bg}`}>
      {c.icon}
      <p className="text-steel-200 text-sm">{message}</p>
    </div>
  )
}
