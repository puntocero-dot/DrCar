'use client'

import {
  BarChart3,
  TrendingUp,
  Car,
  Wrench,
  DollarSign,
  Download,
  Calendar,
  Users,
} from 'lucide-react'

const monthlyData = [
  { month: 'Ene', repairs: 45, revenue: 125000, vehicles: 38 },
  { month: 'Feb', repairs: 52, revenue: 148000, vehicles: 42 },
  { month: 'Mar', repairs: 48, revenue: 135000, vehicles: 40 },
]

export default function ReportsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Reportes</h1>
          <p className="text-steel-400 mt-1">Análisis y estadísticas del taller</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input-field">
            <option>Marzo 2024</option>
            <option>Febrero 2024</option>
            <option>Enero 2024</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Reparaciones del Mes', value: '48', change: '+8%', icon: <Wrench className="w-6 h-6 text-accent-400" />, bg: 'bg-accent-500/15', positive: true },
          { label: 'Ingresos del Mes', value: '$135,000', change: '+15%', icon: <DollarSign className="w-6 h-6 text-green-400" />, bg: 'bg-green-500/15', positive: true },
          { label: 'Vehículos Atendidos', value: '40', change: '+5%', icon: <Car className="w-6 h-6 text-blue-400" />, bg: 'bg-blue-500/15', positive: true },
          { label: 'Clientes Nuevos', value: '12', change: '-3%', icon: <Users className="w-6 h-6 text-purple-400" />, bg: 'bg-purple-500/15', positive: false },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center`}>{kpi.icon}</div>
              <span className={`text-sm font-medium flex items-center gap-1 ${kpi.positive ? 'text-green-400' : 'text-red-400'}`}>
                <TrendingUp className={`w-4 h-4 ${!kpi.positive && 'rotate-180'}`} />
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-steel-400 text-sm mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-1">Ingresos Mensuales</h3>
          <p className="text-steel-400 text-sm mb-6">Últimos 3 meses</p>
          <div className="space-y-4">
            {monthlyData.map((m) => (
              <div key={m.month} className="flex items-center gap-4">
                <span className="text-steel-400 w-10 text-sm">{m.month}</span>
                <div className="flex-1 bg-navy-700 rounded-full h-8 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${(m.revenue / 150000) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">${(m.revenue / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repairs by Category */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-1">Reparaciones por Categoría</h3>
          <p className="text-steel-400 text-sm mb-6">Distribución del mes</p>
          <div className="space-y-4">
            {[
              { label: 'Frenos y Suspensión', count: 15, percent: 31, color: 'bg-accent-500' },
              { label: 'Motor y Transmisión', count: 10, percent: 21, color: 'bg-blue-500' },
              { label: 'Mantenimiento Preventivo', count: 12, percent: 25, color: 'bg-green-500' },
              { label: 'Eléctrico y A/C', count: 6, percent: 13, color: 'bg-purple-500' },
              { label: 'Otros', count: 5, percent: 10, color: 'bg-steel-500' },
            ].map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-steel-300 text-sm">{cat.label}</span>
                  <span className="text-white text-sm font-medium">{cat.count} ({cat.percent}%)</span>
                </div>
                <div className="w-full bg-navy-700 rounded-full h-2.5">
                  <div className={`${cat.color} h-2.5 rounded-full transition-all`} style={{ width: `${cat.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Technicians */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-1">Rendimiento de Técnicos</h3>
        <p className="text-steel-400 text-sm mb-6">Productividad del mes actual</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-steel-800">
                <th className="text-left text-steel-400 text-sm font-medium px-4 py-3">Técnico</th>
                <th className="text-center text-steel-400 text-sm font-medium px-4 py-3">Reparaciones</th>
                <th className="text-center text-steel-400 text-sm font-medium px-4 py-3">Completadas</th>
                <th className="text-center text-steel-400 text-sm font-medium px-4 py-3">Tiempo Promedio</th>
                <th className="text-center text-steel-400 text-sm font-medium px-4 py-3">Satisfacción</th>
                <th className="text-right text-steel-400 text-sm font-medium px-4 py-3">Ingresos Generados</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Roberto Díaz', repairs: 20, completed: 18, avgTime: '4.2h', satisfaction: 4.8, revenue: 52000 },
                { name: 'Miguel Torres', repairs: 16, completed: 15, avgTime: '3.8h', satisfaction: 4.6, revenue: 41000 },
                { name: 'Luis Herrera', repairs: 12, completed: 10, avgTime: '5.1h', satisfaction: 4.3, revenue: 32000 },
              ].map((tech) => (
                <tr key={tech.name} className="border-b border-steel-800/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-sm font-bold">{tech.name.charAt(0)}</div>
                      <span className="text-white font-medium">{tech.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-white">{tech.repairs}</td>
                  <td className="px-4 py-4 text-center text-green-400">{tech.completed}</td>
                  <td className="px-4 py-4 text-center text-steel-300">{tech.avgTime}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-amber-400">★ {tech.satisfaction}</span>
                  </td>
                  <td className="px-4 py-4 text-right text-white font-medium">${tech.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
