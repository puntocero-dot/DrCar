'use client'

import { useState } from 'react'
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Repair {
  id: string
  vehicle: string
  plate: string
  client: string
  technician: string
  status: 'pending' | 'in_progress' | 'waiting_parts' | 'ready' | 'delivered'
  priority: 'low' | 'medium' | 'high'
  description: string
  date: string
  estimatedCost: number
}

const DEMO_REPAIRS: Repair[] = [
  { id: 'REP-001', vehicle: 'Toyota Corolla 2022', plate: 'ABC-1234', client: 'Juan Pérez', technician: 'Roberto Díaz', status: 'in_progress', priority: 'high', description: 'Cambio de frenos delanteros y pastillas', date: '2024-03-25', estimatedCost: 4500 },
  { id: 'REP-002', vehicle: 'Honda Civic 2021', plate: 'DEF-5678', client: 'María López', technician: 'Roberto Díaz', status: 'waiting_parts', priority: 'medium', description: 'Reemplazo de alternador', date: '2024-03-24', estimatedCost: 8200 },
  { id: 'REP-003', vehicle: 'Ford Explorer 2023', plate: 'GHI-9012', client: 'Carlos Ruiz', technician: 'Miguel Torres', status: 'pending', priority: 'low', description: 'Cambio de aceite y filtros', date: '2024-03-26', estimatedCost: 1200 },
  { id: 'REP-004', vehicle: 'Chevrolet Spark 2020', plate: 'JKL-3456', client: 'Ana García', technician: 'Miguel Torres', status: 'ready', priority: 'medium', description: 'Diagnóstico de motor - ruido anormal', date: '2024-03-22', estimatedCost: 3800 },
  { id: 'REP-005', vehicle: 'Hyundai Tucson 2023', plate: 'STU-6789', client: 'Roberto Díaz', technician: 'Luis Herrera', status: 'in_progress', priority: 'high', description: 'Reparación de transmisión automática', date: '2024-03-23', estimatedCost: 15000 },
  { id: 'REP-006', vehicle: 'Nissan Sentra 2022', plate: 'MNO-7890', client: 'Pedro Martínez', technician: 'Luis Herrera', status: 'delivered', priority: 'low', description: 'Alineación y balanceo', date: '2024-03-20', estimatedCost: 800 },
  { id: 'REP-007', vehicle: 'Volkswagen Jetta 2021', plate: 'PQR-2345', client: 'Lucía Fernández', technician: 'Roberto Díaz', status: 'pending', priority: 'high', description: 'Sistema de aire acondicionado no enfría', date: '2024-03-26', estimatedCost: 5500 },
  { id: 'REP-008', vehicle: 'Kia Sportage 2022', plate: 'VWX-0123', client: 'Sandra Morales', technician: 'Miguel Torres', status: 'in_progress', priority: 'medium', description: 'Cambio de amortiguadores traseros', date: '2024-03-25', estimatedCost: 6200 },
]

const statusConfig: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendiente', class: 'bg-steel-500/15 text-steel-300 border-steel-500/30', icon: <Clock className="w-3.5 h-3.5" /> },
  in_progress: { label: 'En Proceso', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: <Wrench className="w-3.5 h-3.5" /> },
  waiting_parts: { label: 'Esperando Repuestos', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: <Package className="w-3.5 h-3.5" /> },
  ready: { label: 'Listo para Entrega', class: 'bg-green-500/15 text-green-400 border-green-500/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  delivered: { label: 'Entregado', class: 'bg-navy-500/15 text-navy-300 border-navy-500/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
}

const priorityConfig: Record<string, { label: string; class: string }> = {
  low: { label: 'Baja', class: 'text-green-400' },
  medium: { label: 'Media', class: 'text-amber-400' },
  high: { label: 'Alta', class: 'text-red-400' },
}

const PAGE_SIZE = 10

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>(DEMO_REPAIRS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)
  const [isViewOnly, setIsViewOnly] = useState(false)
  const [page, setPage] = useState(0)

  const filtered = repairs.filter((r) => {
    const matchSearch =
      r.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      r.client.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.plate.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleSave = (repairData: Partial<Repair>) => {
    if (selectedRepair) {
      setRepairs(repairs.map(r => r.id === selectedRepair.id ? { ...r, ...repairData } as Repair : r))
    } else {
      const newRepair: Repair = {
        ...repairData,
        id: `REP-${Math.floor(100 + Math.random() * 900)}`,
        status: 'pending',
        priority: 'medium',
        date: new Date().toISOString().split('T')[0],
      } as Repair
      setRepairs([newRepair, ...repairs])
    }
    setShowModal(false)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Reparaciones</h1>
          <p className="text-steel-400 mt-1">Control y seguimiento de todas las reparaciones</p>
        </div>
        <button 
          onClick={() => { setSelectedRepair(null); setIsViewOnly(false); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Reparación
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Pendientes', count: repairs.filter(r => r.status === 'pending').length, color: 'text-steel-300' },
          { label: 'En Proceso', count: repairs.filter(r => r.status === 'in_progress').length, color: 'text-blue-400' },
          { label: 'Esp. Repuestos', count: repairs.filter(r => r.status === 'waiting_parts').length, color: 'text-amber-400' },
          { label: 'Listos', count: repairs.filter(r => r.status === 'ready').length, color: 'text-green-400' },
          { label: 'Entregados', count: repairs.filter(r => r.status === 'delivered').length, color: 'text-navy-300' },
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
            <input
              type="text"
              placeholder="Buscar por ID, vehículo, placa o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field min-w-[180px]"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="in_progress">En Proceso</option>
            <option value="waiting_parts">Esperando Repuestos</option>
            <option value="ready">Listos para Entrega</option>
            <option value="delivered">Entregados</option>
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
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Vehículo</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Cliente</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Técnico</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Estado</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Prioridad</th>
                <th className="text-right text-steel-400 text-sm font-medium px-6 py-4">Costo Est.</th>
                <th className="text-right text-steel-400 text-sm font-medium px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((repair) => (
                <tr key={repair.id} className="border-b border-steel-800/50 hover:bg-navy-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-accent-400 font-mono text-sm font-medium">{repair.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium text-sm">{repair.vehicle}</p>
                    <p className="text-steel-500 text-xs">{repair.plate}</p>
                  </td>
                  <td className="px-6 py-4 text-steel-300 text-sm">{repair.client}</td>
                  <td className="px-6 py-4 text-steel-300 text-sm">{repair.technician}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[repair.status].class}`}>
                      {statusConfig[repair.status].icon}
                      {statusConfig[repair.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 ${priorityConfig[repair.priority].class}`} />
                      <span className={`text-sm ${priorityConfig[repair.priority].class}`}>{priorityConfig[repair.priority].label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-white font-medium text-sm">${repair.estimatedCost.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => { setSelectedRepair(repair); setIsViewOnly(true); setShowModal(true) }}
                        className="p-2 text-steel-400 hover:text-accent-400 hover:bg-navy-700 rounded-lg transition-colors" 
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedRepair(repair); setIsViewOnly(false); setShowModal(true) }}
                        className="p-2 text-steel-400 hover:text-blue-400 hover:bg-navy-700 rounded-lg transition-colors" 
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-steel-600 mx-auto mb-3" />
            <p className="text-steel-400">No se encontraron reparaciones</p>
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-4 border-t border-steel-800">
          <p className="text-steel-500 text-sm">Mostrando {paginated.length} de {filtered.length} reparaciones</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              className="p-2 text-steel-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-steel-400 text-sm px-3 py-1">Página {page + 1} de {Math.max(totalPages, 1)}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="p-2 text-steel-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Repair Modal */}
      {showModal && (
        <RepairModal
          repair={selectedRepair}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isViewOnly={isViewOnly}
        />
      )}
    </div>
  )
}

function RepairModal({ repair, onClose, onSave, isViewOnly }: {
  repair: Repair | null;
  onClose: () => void;
  onSave: (data: Partial<Repair>) => void;
  isViewOnly?: boolean;
}) {
  const isEdit = !!repair
  const [formData, setFormData] = useState<Partial<Repair>>(repair || {
    vehicle: '',
    plate: '',
    client: '',
    technician: '',
    status: 'pending',
    priority: 'medium',
    description: '',
    estimatedCost: 0,
  })

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-navy-900 border border-steel-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-steel-800">
          <h2 className="text-xl font-bold text-white">
            {isViewOnly ? 'Detalle de Reparación' : isEdit ? 'Editar Reparación' : 'Nueva Reparación'}
          </h2>
          <p className="text-steel-400 text-sm mt-1">
            {isViewOnly ? 'Información técnica del servicio' : isEdit ? 'Modifica los datos de la orden de trabajo' : 'Registra una nueva orden de servicio'}
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Vehículo</label>
              <input 
                type="text" 
                className="input-field w-full disabled:opacity-60" 
                value={formData.vehicle} 
                onChange={e => setFormData({...formData, vehicle: e.target.value})}
                placeholder="Ej. Toyota Corolla"
                disabled={isViewOnly}
              />
            </div>
            <div>
              <label className="label-text">Placa</label>
              <input 
                type="text" 
                className="input-field w-full disabled:opacity-60" 
                value={formData.plate} 
                onChange={e => setFormData({...formData, plate: e.target.value})}
                placeholder="ABC-1234"
                disabled={isViewOnly}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Cliente</label>
              <input 
                type="text" 
                className="input-field w-full disabled:opacity-60" 
                value={formData.client} 
                onChange={e => setFormData({...formData, client: e.target.value})}
                placeholder="Nombre del cliente"
                disabled={isViewOnly}
              />
            </div>
            <div>
              <label className="label-text">Técnico Asignado</label>
              <input 
                type="text" 
                className="input-field w-full disabled:opacity-60" 
                value={formData.technician} 
                onChange={e => setFormData({...formData, technician: e.target.value})}
                placeholder="Nombre del técnico"
                disabled={isViewOnly}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Estado</label>
              <select 
                className="input-field w-full disabled:opacity-60" 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as Repair['status']})}
                disabled={isViewOnly}
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En Proceso</option>
                <option value="waiting_parts">Esperando Repuestos</option>
                <option value="ready">Listo para Entrega</option>
                <option value="delivered">Entregado</option>
              </select>
            </div>
            <div>
              <label className="label-text">Prioridad</label>
              <select 
                className="input-field w-full disabled:opacity-60" 
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: e.target.value as Repair['priority']})}
                disabled={isViewOnly}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-text">Costo Estimado</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-400">$</span>
              <input 
                type="number" 
                className="input-field w-full pl-7 disabled:opacity-60" 
                value={formData.estimatedCost} 
                onChange={e => setFormData({...formData, estimatedCost: parseFloat(e.target.value)})}
                placeholder="0.00"
                disabled={isViewOnly}
              />
            </div>
          </div>
          <div>
            <label className="label-text">Descripción del Trabajo</label>
            <textarea 
              className="input-field w-full h-24 py-2 disabled:opacity-60" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Detalle de los fallos o trabajos a realizar..."
              disabled={isViewOnly}
            />
          </div>
        </div>
        <div className="p-6 border-t border-steel-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            {isViewOnly ? 'Cerrar' : 'Cancelar'}
          </button>
          {!isViewOnly && (
            <button onClick={() => onSave(formData)} className="btn-primary">
              {isEdit ? 'Guardar Cambios' : 'Abrir Orden'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
