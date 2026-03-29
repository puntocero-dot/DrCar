'use client'

import { useState } from 'react'
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'

const revenueData = [
  { month: 'Ene', ingresos: 4200, gastos: 2800 },
  { month: 'Feb', ingresos: 5100, gastos: 3200 },
  { month: 'Mar', ingresos: 4800, gastos: 2900 },
  { month: 'Abr', ingresos: 6200, gastos: 3500 },
  { month: 'May', ingresos: 5800, gastos: 3100 },
  { month: 'Jun', ingresos: 7100, gastos: 3800 },
]

const repairStatusData = [
  { name: 'En Espera', value: 8, color: '#eab308' },
  { name: 'En Proceso', value: 12, color: '#3b82f6' },
  { name: 'Esperando Repuestos', value: 5, color: '#f97316' },
  { name: 'Listo Entrega', value: 3, color: '#22c55e' },
]

const workloadData = [
  { day: 'Lun', tareas: 12 },
  { day: 'Mar', tareas: 18 },
  { day: 'Mie', tareas: 15 },
  { day: 'Jue', tareas: 22 },
  { day: 'Vie', tareas: 20 },
  { day: 'Sab', tareas: 8 },
]

const recentRepairs = [
  { id: 'REP-001', vehicle: 'Toyota Corolla 2022', plate: 'P-123-456', status: 'en_proceso', technician: 'Carlos M.', priority: 'alta' },
  { id: 'REP-002', vehicle: 'Honda Civic 2021', plate: 'P-789-012', status: 'esperando_repuestos', technician: 'Luis R.', priority: 'media' },
  { id: 'REP-003', vehicle: 'Nissan Sentra 2023', plate: 'P-345-678', status: 'en_espera', technician: 'Sin asignar', priority: 'urgente' },
  { id: 'REP-004', vehicle: 'Hyundai Elantra 2020', plate: 'P-901-234', status: 'listo_entrega', technician: 'Maria G.', priority: 'baja' },
  { id: 'REP-005', vehicle: 'Kia Sportage 2022', plate: 'P-567-890', status: 'en_proceso', technician: 'Carlos M.', priority: 'media' },
]

const upcomingAppointments = [
  { time: '09:00', client: 'Juan Perez', vehicle: 'Toyota RAV4', service: 'Cambio de aceite' },
  { time: '10:30', client: 'Ana Lopez', vehicle: 'Honda CR-V', service: 'Revision de frenos' },
  { time: '12:00', client: 'Pedro Diaz', vehicle: 'Mazda 3', service: 'Diagnostico general' },
  { time: '14:00', client: 'Sofia Martinez', vehicle: 'Nissan Kicks', service: 'Cambio de filtros' },
]

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

export default function SuperAdminDashboard() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [selectedRepair, setSelectedRepair] = useState<any>(null)

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
          value="$7,100"
          change="+22.4%"
          trend="up"
          icon={<DollarSign className="w-6 h-6" />}
          color="accent"
        />
        <StatCard
          title="Vehiculos Activos"
          value="28"
          change="+3"
          trend="up"
          icon={<Car className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Reparaciones Abiertas"
          value="28"
          change="-2"
          trend="down"
          icon={<Wrench className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Tecnicos Activos"
          value="6"
          change="0"
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
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
          </div>
        </div>

        {/* Repair Status Pie */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Estado Reparaciones</h3>
            <Gauge className="w-5 h-5 text-steel-500" />
          </div>
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
                <YAxis stroke="#627895" fontSize={13} />
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
          <div className="space-y-3">
            {upcomingAppointments.map((apt, i) => (
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
        </div>
      </div>

      {/* Recent Repairs Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Reparaciones Recientes</h3>
          <button className="btn-secondary text-sm py-2 px-4 min-h-0">Ver todas</button>
        </div>
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
      </div>

      {/* Alerts Section */}
      <div className="card border-accent-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-white">Alertas del Sistema</h3>
        </div>
        <div className="space-y-3">
          <AlertItem
            type="danger"
            message="3 vehiculos con mantenimiento vencido requieren atencion inmediata"
          />
          <AlertItem
            type="warning"
            message="Stock bajo en filtros de aceite - solo quedan 5 unidades"
          />
          <AlertItem
            type="success"
            message="Backup automatico completado exitosamente"
          />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRepair && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedRepair(null)}>
          <div className="bg-navy-950 border border-navy-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Car className="w-5 h-5 text-accent-400" />
                Detalles del Vehículo
              </h2>
              <button onClick={() => setSelectedRepair(null)} className="text-steel-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 bg-navy-900/50 p-6 rounded-xl border border-navy-800">
              <div>
                <p className="text-xs uppercase text-steel-500 font-bold tracking-wider mb-1">Vehículo</p>
                <p className="font-semibold text-white text-lg">{selectedRepair.vehicle}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-steel-500 font-bold tracking-wider mb-1">Placa</p>
                <p className="font-mono text-accent-400 text-lg bg-accent-500/10 inline-block px-2 py-0.5 rounded border border-accent-500/20">{selectedRepair.plate}</p>
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
              <button onClick={() => setSelectedRepair(null)} className="px-4 py-2 text-steel-300 hover:text-white transition-colors">
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
        <div className="flex items-center gap-1 text-sm">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
          <span className={trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-steel-400'}>
            {change}
          </span>
        </div>
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
