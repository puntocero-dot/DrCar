'use client'

import { useState } from 'react'
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Budget {
  id: string
  client: string
  vehicle: string
  date: string
  validUntil: string
  items: number
  total: number
  status: 'draft' | 'sent' | 'approved' | 'rejected'
}

const DEMO_BUDGETS: Budget[] = [
  { id: 'PRE-001', client: 'Juan Pérez', vehicle: 'Toyota Corolla 2022', date: '2024-03-25', validUntil: '2024-04-10', items: 4, total: 4500, status: 'approved' },
  { id: 'PRE-002', client: 'María López', vehicle: 'Honda Civic 2021', date: '2024-03-24', validUntil: '2024-04-08', items: 3, total: 8200, status: 'sent' },
  { id: 'PRE-003', client: 'Carlos Ruiz', vehicle: 'Ford Explorer 2023', date: '2024-03-26', validUntil: '2024-04-11', items: 2, total: 1200, status: 'draft' },
  { id: 'PRE-004', client: 'Roberto Díaz', vehicle: 'Hyundai Tucson 2023', date: '2024-03-23', validUntil: '2024-04-07', items: 6, total: 15000, status: 'approved' },
  { id: 'PRE-005', client: 'Lucía Fernández', vehicle: 'Volkswagen Jetta 2021', date: '2024-03-26', validUntil: '2024-04-11', items: 5, total: 5500, status: 'sent' },
  { id: 'PRE-006', client: 'Sandra Morales', vehicle: 'Kia Sportage 2022', date: '2024-03-25', validUntil: '2024-04-09', items: 3, total: 6200, status: 'rejected' },
  { id: 'PRE-007', client: 'Pedro Martínez', vehicle: 'Nissan Sentra 2022', date: '2024-03-22', validUntil: '2024-04-06', items: 2, total: 2400, status: 'approved' },
  { id: 'PRE-008', client: 'Ana García', vehicle: 'Chevrolet Spark 2020', date: '2024-03-20', validUntil: '2024-04-04', items: 4, total: 3800, status: 'approved' },
]

const statusConfig: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  draft: { label: 'Borrador', class: 'bg-steel-500/15 text-steel-300 border-steel-500/30', icon: <Edit2 className="w-3.5 h-3.5" /> },
  sent: { label: 'Enviado', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: <Send className="w-3.5 h-3.5" /> },
  approved: { label: 'Aprobado', class: 'bg-green-500/15 text-green-400 border-green-500/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  rejected: { label: 'Rechazado', class: 'bg-red-500/15 text-red-400 border-red-500/30', icon: <XCircle className="w-3.5 h-3.5" /> },
}

export default function BudgetsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = DEMO_BUDGETS.filter((b) => {
    const matchSearch =
      b.client.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalApproved = DEMO_BUDGETS.filter(b => b.status === 'approved').reduce((s, b) => s + b.total, 0)

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Presupuestos</h1>
          <p className="text-steel-400 mt-1">Crea y gestiona presupuestos para clientes</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Presupuesto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', count: DEMO_BUDGETS.length, color: 'text-accent-400' },
          { label: 'Aprobados', count: DEMO_BUDGETS.filter(b => b.status === 'approved').length, color: 'text-green-400' },
          { label: 'Enviados', count: DEMO_BUDGETS.filter(b => b.status === 'sent').length, color: 'text-blue-400' },
          { label: 'Monto Aprobado', count: `$${totalApproved.toLocaleString()}`, color: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-steel-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-500" />
            <input type="text" placeholder="Buscar por cliente o ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field min-w-[160px]">
            <option value="all">Todos</option>
            <option value="draft">Borradores</option>
            <option value="sent">Enviados</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-steel-800">
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">ID</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Cliente</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Vehículo</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Fecha</th>
                <th className="text-center text-steel-400 text-sm font-medium px-6 py-4">Items</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Estado</th>
                <th className="text-right text-steel-400 text-sm font-medium px-6 py-4">Total</th>
                <th className="text-right text-steel-400 text-sm font-medium px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((budget) => (
                <tr key={budget.id} className="border-b border-steel-800/50 hover:bg-navy-800/50 transition-colors">
                  <td className="px-6 py-4"><span className="text-accent-400 font-mono text-sm font-medium">{budget.id}</span></td>
                  <td className="px-6 py-4 text-white text-sm">{budget.client}</td>
                  <td className="px-6 py-4 text-steel-300 text-sm">{budget.vehicle}</td>
                  <td className="px-6 py-4 text-steel-400 text-sm">{budget.date}</td>
                  <td className="px-6 py-4 text-center text-steel-300 text-sm">{budget.items}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[budget.status].class}`}>
                      {statusConfig[budget.status].icon}
                      {statusConfig[budget.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-white font-bold text-sm">${budget.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-steel-400 hover:text-accent-400 hover:bg-navy-700 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 text-steel-400 hover:text-blue-400 hover:bg-navy-700 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-steel-600 mx-auto mb-3" />
            <p className="text-steel-400">No se encontraron presupuestos</p>
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-4 border-t border-steel-800">
          <p className="text-steel-500 text-sm">Mostrando {filtered.length} de {DEMO_BUDGETS.length}</p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-steel-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors" disabled><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-white text-sm px-3 py-1 bg-accent-500/20 rounded-lg">1</span>
            <button className="p-2 text-steel-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors" disabled><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
