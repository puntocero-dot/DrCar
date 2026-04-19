'use client'

import { useState } from 'react'
import {
  Calendar,
  Plus,
  Search,
  Clock,
  User,
  Car,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Appointment {
  id: string
  client: string
  vehicle: string
  plate: string
  date: string
  time: string
  type: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  notes: string
}

const DEMO_APPOINTMENTS: Appointment[] = [
  { id: 'CIT-001', client: 'Juan Pérez', vehicle: 'Toyota Corolla 2022', plate: 'ABC-1234', date: '2024-03-26', time: '09:00', type: 'Mantenimiento preventivo', status: 'confirmed', notes: 'Cambio de aceite y filtros' },
  { id: 'CIT-002', client: 'María López', vehicle: 'Honda Civic 2021', plate: 'DEF-5678', date: '2024-03-26', time: '10:30', type: 'Diagnóstico', status: 'confirmed', notes: 'Ruido en suspensión delantera' },
  { id: 'CIT-003', client: 'Carlos Ruiz', vehicle: 'Ford Explorer 2023', plate: 'GHI-9012', date: '2024-03-26', time: '12:00', type: 'Reparación', status: 'pending', notes: 'Continuación de reparación de frenos' },
  { id: 'CIT-004', client: 'Ana García', vehicle: 'Chevrolet Spark 2020', plate: 'JKL-3456', date: '2024-03-26', time: '14:00', type: 'Entrega', status: 'confirmed', notes: 'Entrega de vehículo reparado' },
  { id: 'CIT-005', client: 'Lucía Fernández', vehicle: 'Volkswagen Jetta 2021', plate: 'PQR-2345', date: '2024-03-26', time: '15:30', type: 'Presupuesto', status: 'pending', notes: 'Evaluación de aire acondicionado' },
  { id: 'CIT-006', client: 'Sandra Morales', vehicle: 'Kia Sportage 2022', plate: 'VWX-0123', date: '2024-03-25', time: '09:00', type: 'Mantenimiento preventivo', status: 'completed', notes: 'Revisión de 20,000 km' },
  { id: 'CIT-007', client: 'Pedro Martínez', vehicle: 'Nissan Sentra 2022', plate: 'MNO-7890', date: '2024-03-25', time: '11:00', type: 'Diagnóstico', status: 'cancelled', notes: 'Cliente canceló - reagendar' },
  { id: 'CIT-008', client: 'Roberto Díaz', vehicle: 'Hyundai Tucson 2023', plate: 'STU-6789', date: '2024-03-27', time: '10:00', type: 'Reparación', status: 'confirmed', notes: 'Revisión de transmisión' },
]

const statusConfig: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
  confirmed: { label: 'Confirmada', class: 'bg-green-500/15 text-green-400 border-green-500/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pending: { label: 'Pendiente', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  completed: { label: 'Completada', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelada', class: 'bg-red-500/15 text-red-400 border-red-500/30', icon: <XCircle className="w-3.5 h-3.5" /> },
}

const PAGE_SIZE = 10

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(DEMO_APPOINTMENTS)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('2024-03-26')
  const [showModal, setShowModal] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)
  const [page, setPage] = useState(0)

  const todayAppts = appointments.filter(a => a.date === dateFilter)
  const filtered = todayAppts.filter((a) =>
    a.client.toLowerCase().includes(search.toLowerCase()) ||
    a.vehicle.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleSave = (apptData: Partial<Appointment>) => {
    if (selectedAppt) {
      setAppointments(appointments.map(a => a.id === selectedAppt.id ? { ...a, ...apptData } as Appointment : a))
    } else {
      const newAppt: Appointment = {
        ...apptData,
        id: `CIT-${Math.floor(100 + Math.random() * 900)}`,
        status: 'pending',
      } as Appointment
      setAppointments([...appointments, newAppt])
    }
    setShowModal(false)
  }

  const handleConfirm = (id: string) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'confirmed' } : a))
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Citas</h1>
          <p className="text-steel-400 mt-1">Gestión de citas y agenda del taller</p>
        </div>
        <button 
          onClick={() => { setSelectedAppt(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Cita
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Hoy', count: appointments.filter(a => a.date === '2024-03-26').length, icon: <Calendar className="w-6 h-6 text-accent-400" />, bg: 'bg-accent-500/15' },
          { label: 'Confirmadas', count: appointments.filter(a => a.status === 'confirmed').length, icon: <CheckCircle2 className="w-6 h-6 text-green-400" />, bg: 'bg-green-500/15' },
          { label: 'Pendientes', count: appointments.filter(a => a.status === 'pending').length, icon: <AlertCircle className="w-6 h-6 text-amber-400" />, bg: 'bg-amber-500/15' },
          { label: 'Canceladas', count: appointments.filter(a => a.status === 'cancelled').length, icon: <XCircle className="w-6 h-6 text-red-400" />, bg: 'bg-red-500/15' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-white">{s.count}</p>
              <p className="text-steel-400 text-sm">{s.label}</p>
            </div>
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
              placeholder="Buscar por cliente o vehículo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field min-w-[180px]"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar className="w-12 h-12 text-steel-600 mx-auto mb-3" />
            <p className="text-steel-400">No hay citas para esta fecha</p>
          </div>
        ) : (
          paginated.map((appt) => (
            <div key={appt.id} className="card p-5 hover:border-steel-700 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Time */}
                <div className="flex items-center gap-3 sm:w-24 flex-shrink-0">
                  <div className="w-12 h-12 bg-navy-700 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-accent-400" />
                  </div>
                  <span className="text-white font-bold text-lg sm:hidden">{appt.time}</span>
                  <span className="text-white font-bold text-lg hidden sm:block">{appt.time}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{appt.type}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig[appt.status].class}`}>
                      {statusConfig[appt.status].icon}
                      {statusConfig[appt.status].label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-steel-400">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{appt.client}</span>
                    <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" />{appt.vehicle} · {appt.plate}</span>
                  </div>
                  <p className="text-steel-500 text-sm mt-1">{appt.notes}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <button 
                    onClick={() => { setSelectedAppt(appt); setShowModal(true) }}
                    className="btn-secondary text-sm py-2 px-3"
                  >
                    Reagendar
                  </button>
                  {appt.status === 'pending' && (
                    <button 
                      onClick={() => handleConfirm(appt.id)}
                      className="btn-primary text-sm py-2 px-3"
                    >
                      Confirmar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-steel-500 text-sm">Mostrando {paginated.length} de {filtered.length} citas</p>
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
      )}

      {/* Appointment Modal */}
      {showModal && (
        <AppointmentModal
          appointment={selectedAppt}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function AppointmentModal({ appointment, onClose, onSave }: {
  appointment: Appointment | null;
  onClose: () => void;
  onSave: (data: Partial<Appointment>) => void;
}) {
  const isEdit = !!appointment
  const [formData, setFormData] = useState<Partial<Appointment>>(appointment || {
    client: '',
    vehicle: '',
    plate: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Mantenimiento preventivo',
    notes: '',
  })

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-navy-900 border border-steel-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-steel-800">
          <h2 className="text-xl font-bold text-white">{isEdit ? 'Reagendar Cita' : 'Nueva Cita'}</h2>
          <p className="text-steel-400 text-sm mt-1">{isEdit ? 'Modifica la fecha u hora de la cita' : 'Agenda una nueva visita al taller'}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label-text">Cliente</label>
            <input 
              type="text" 
              className="input-field w-full" 
              value={formData.client} 
              onChange={e => setFormData({...formData, client: e.target.value})}
              placeholder="Nombre completo" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Vehículo</label>
              <input 
                type="text" 
                className="input-field w-full" 
                value={formData.vehicle} 
                onChange={e => setFormData({...formData, vehicle: e.target.value})}
                placeholder="Ej. Toyota Corolla" 
              />
            </div>
            <div>
              <label className="label-text">Placa</label>
              <input 
                type="text" 
                className="input-field w-full" 
                value={formData.plate} 
                onChange={e => setFormData({...formData, plate: e.target.value})}
                placeholder="ABC-1234" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Fecha</label>
              <input 
                type="date" 
                className="input-field w-full" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="label-text">Hora</label>
              <input 
                type="time" 
                className="input-field w-full" 
                value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="label-text">Tipo de Servicio</label>
            <select 
              className="input-field w-full" 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option>Mantenimiento preventivo</option>
              <option>Diagnóstico</option>
              <option>Reparación</option>
              <option>Presupuesto</option>
              <option>Entrega</option>
            </select>
          </div>
          <div>
            <label className="label-text">Notas</label>
            <textarea 
              className="input-field w-full h-20 py-2" 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Detalles adicionales..."
            />
          </div>
        </div>
        <div className="p-6 border-t border-steel-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={() => onSave(formData)} className="btn-primary">{isEdit ? 'Reagendar' : 'Programar Cita'}</button>
        </div>
      </div>
    </div>
  )
}
