'use client'

import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Banknote,
} from 'lucide-react'

interface Invoice {
  id: string
  client: string
  vehicle: string
  repairId: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  method: 'cash' | 'card' | 'transfer'
}

const DEMO_INVOICES: Invoice[] = [
  { id: 'FAC-001', client: 'Juan Pérez', vehicle: 'Toyota Corolla 2022', repairId: 'REP-006', date: '2024-03-20', amount: 800, status: 'paid', method: 'card' },
  { id: 'FAC-002', client: 'Ana García', vehicle: 'Chevrolet Spark 2020', repairId: 'REP-004', date: '2024-03-22', amount: 3800, status: 'paid', method: 'transfer' },
  { id: 'FAC-003', client: 'María López', vehicle: 'Honda Civic 2021', repairId: 'REP-002', date: '2024-03-24', amount: 8200, status: 'pending', method: 'cash' },
  { id: 'FAC-004', client: 'Carlos Ruiz', vehicle: 'Ford Explorer 2023', repairId: 'REP-003', date: '2024-03-26', amount: 1200, status: 'pending', method: 'card' },
  { id: 'FAC-005', client: 'Roberto Díaz', vehicle: 'Hyundai Tucson 2023', repairId: 'REP-005', date: '2024-03-23', amount: 15000, status: 'overdue', method: 'transfer' },
  { id: 'FAC-006', client: 'Lucía Fernández', vehicle: 'Volkswagen Jetta 2021', repairId: 'REP-007', date: '2024-03-26', amount: 5500, status: 'pending', method: 'card' },
  { id: 'FAC-007', client: 'Sandra Morales', vehicle: 'Kia Sportage 2022', repairId: 'REP-008', date: '2024-03-25', amount: 6200, status: 'paid', method: 'cash' },
  { id: 'FAC-008', client: 'Pedro Martínez', vehicle: 'Nissan Sentra 2022', repairId: 'REP-006', date: '2024-03-20', amount: 800, status: 'paid', method: 'card' },
]

const statusConfig: Record<string, { label: string; class: string }> = {
  paid: { label: 'Pagada', class: 'bg-green-500/15 text-green-400 border-green-500/30' },
  pending: { label: 'Pendiente', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  overdue: { label: 'Vencida', class: 'bg-red-500/15 text-red-400 border-red-500/30' },
}

const methodIcons: Record<string, React.ReactNode> = {
  cash: <Banknote className="w-4 h-4" />,
  card: <CreditCard className="w-4 h-4" />,
  transfer: <DollarSign className="w-4 h-4" />,
}

export default function BillingPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const totalRevenue = DEMO_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalPending = DEMO_INVOICES.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
  const totalOverdue = DEMO_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)

  const filtered = DEMO_INVOICES.filter((i) => {
    const matchSearch =
      i.client.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || i.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Facturación</h1>
          <p className="text-steel-400 mt-1">Control de ingresos, pagos y facturas</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportar
        </button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-500/15 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-green-400 text-sm font-medium">+12%</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
          <p className="text-steel-400 text-sm mt-1">Ingresos cobrados</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-amber-400 text-sm font-medium">{DEMO_INVOICES.filter(i => i.status === 'pending').length} facturas</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalPending.toLocaleString()}</p>
          <p className="text-steel-400 text-sm mt-1">Pagos pendientes</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-500/15 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-red-400 text-sm font-medium">Vencido</span>
          </div>
          <p className="text-3xl font-bold text-white">${totalOverdue.toLocaleString()}</p>
          <p className="text-steel-400 text-sm mt-1">Pagos vencidos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-500" />
            <input type="text" placeholder="Buscar por cliente o factura..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field min-w-[160px]">
            <option value="all">Todos</option>
            <option value="paid">Pagadas</option>
            <option value="pending">Pendientes</option>
            <option value="overdue">Vencidas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-steel-800">
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Factura</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Cliente</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Vehículo</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Fecha</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Método</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Estado</th>
                <th className="text-right text-steel-400 text-sm font-medium px-6 py-4">Monto</th>
                <th className="text-right text-steel-400 text-sm font-medium px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-steel-800/50 hover:bg-navy-800/50 transition-colors">
                  <td className="px-6 py-4"><span className="text-accent-400 font-mono text-sm font-medium">{inv.id}</span></td>
                  <td className="px-6 py-4 text-white text-sm">{inv.client}</td>
                  <td className="px-6 py-4 text-steel-300 text-sm">{inv.vehicle}</td>
                  <td className="px-6 py-4 text-steel-400 text-sm">{inv.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-steel-400 text-sm">
                      {methodIcons[inv.method]}
                      <span className="capitalize">{inv.method === 'cash' ? 'Efectivo' : inv.method === 'card' ? 'Tarjeta' : 'Transferencia'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[inv.status].class}`}>
                      {statusConfig[inv.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-white font-bold text-sm">${inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-steel-400 hover:text-accent-400 hover:bg-navy-700 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 text-steel-400 hover:text-green-400 hover:bg-navy-700 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-steel-600 mx-auto mb-3" />
            <p className="text-steel-400">No se encontraron facturas</p>
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-4 border-t border-steel-800">
          <p className="text-steel-500 text-sm">Mostrando {filtered.length} de {DEMO_INVOICES.length} facturas</p>
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
