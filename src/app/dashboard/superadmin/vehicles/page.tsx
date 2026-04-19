'use client'

import { useState } from 'react'
import {
  Car,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface Vehicle {
  id: string
  brand: string
  model: string
  year: number
  plate: string
  vin: string
  color: string
  km: number
  status: 'active' | 'in_repair' | 'inactive'
  owner: string
  lastService: string
}

const DEMO_VEHICLES: Vehicle[] = [
  { id: '1', brand: 'Toyota', model: 'Corolla', year: 2022, plate: 'ABC-1234', vin: '1HGBH41JXMN109186', color: 'Blanco', km: 35200, status: 'active', owner: 'Juan Pérez', lastService: '2024-01-15' },
  { id: '2', brand: 'Honda', model: 'Civic', year: 2021, plate: 'DEF-5678', vin: '2HGFC2F59MH123456', color: 'Negro', km: 48700, status: 'in_repair', owner: 'María López', lastService: '2024-02-20' },
  { id: '3', brand: 'Ford', model: 'Explorer', year: 2023, plate: 'GHI-9012', vin: '1FM5K8D87LGA12345', color: 'Gris', km: 12300, status: 'active', owner: 'Carlos Ruiz', lastService: '2024-03-10' },
  { id: '4', brand: 'Chevrolet', model: 'Spark', year: 2020, plate: 'JKL-3456', vin: 'KL8CB6SA5LC123456', color: 'Rojo', km: 67800, status: 'active', owner: 'Ana García', lastService: '2024-01-28' },
  { id: '5', brand: 'Nissan', model: 'Sentra', year: 2022, plate: 'MNO-7890', vin: '3N1AB8CV1NY123456', color: 'Azul', km: 29400, status: 'inactive', owner: 'Pedro Martínez', lastService: '2023-12-05' },
  { id: '6', brand: 'Volkswagen', model: 'Jetta', year: 2021, plate: 'PQR-2345', vin: '3VWC57BU5MM123456', color: 'Plata', km: 41200, status: 'active', owner: 'Lucía Fernández', lastService: '2024-02-14' },
  { id: '7', brand: 'Hyundai', model: 'Tucson', year: 2023, plate: 'STU-6789', vin: 'KM8J33A46NU123456', color: 'Blanco', km: 8900, status: 'in_repair', owner: 'Roberto Díaz', lastService: '2024-03-25' },
  { id: '8', brand: 'Kia', model: 'Sportage', year: 2022, plate: 'VWX-0123', vin: 'KNDPM3AC5N7123456', color: 'Negro', km: 22100, status: 'active', owner: 'Sandra Morales', lastService: '2024-01-30' },
]

const statusConfig = {
  active: { label: 'Activo', class: 'bg-green-500/15 text-green-400 border-green-500/30' },
  in_repair: { label: 'En Reparación', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  inactive: { label: 'Inactivo', class: 'bg-red-500/15 text-red-400 border-red-500/30' },
}

const PAGE_SIZE = 10

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isViewOnly, setIsViewOnly] = useState(false)
  const [page, setPage] = useState(0)

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.owner.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || v.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleSave = (vehicleData: Partial<Vehicle>) => {
    if (selectedVehicle) {
      // Edit
      setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? { ...v, ...vehicleData } as Vehicle : v))
    } else {
      // Create
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'active',
        lastService: new Date().toISOString().split('T')[0],
      } as Vehicle
      setVehicles([newVehicle, ...vehicles])
    }
    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      setVehicles(vehicles.filter(v => v.id !== id))
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehículos</h1>
          <p className="text-steel-400 mt-1">Gestiona todos los vehículos registrados</p>
        </div>
        <button
          onClick={() => { setSelectedVehicle(null); setShowModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Vehículo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-500/15 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{vehicles.length}</p>
            <p className="text-steel-400 text-sm">Total Vehículos</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/15 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{vehicles.filter(v => v.status === 'active').length}</p>
            <p className="text-steel-400 text-sm">Activos</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center">
            <Car className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{vehicles.filter(v => v.status === 'in_repair').length}</p>
            <p className="text-steel-400 text-sm">En Reparación</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-500" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo, placa o propietario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-steel-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field min-w-[160px]"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="in_repair">En Reparación</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-steel-800">
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Vehículo</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Placa</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Propietario</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Kilometraje</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Estado</th>
                <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Último Servicio</th>
                <th className="text-right text-steel-400 text-sm font-medium px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-steel-800/50 hover:bg-navy-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-accent-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-steel-500 text-sm">{vehicle.year} · {vehicle.color}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-mono bg-navy-700 px-2 py-1 rounded text-sm">{vehicle.plate}</span>
                  </td>
                  <td className="px-6 py-4 text-steel-300">{vehicle.owner}</td>
                  <td className="px-6 py-4 text-steel-300">{vehicle.km.toLocaleString()} km</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[vehicle.status].class}`}>
                      {statusConfig[vehicle.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-steel-400 text-sm">{vehicle.lastService}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => { setSelectedVehicle(vehicle); setIsViewOnly(true); setShowModal(true) }}
                        className="p-2 text-steel-400 hover:text-accent-400 hover:bg-navy-700 rounded-lg transition-colors" 
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedVehicle(vehicle); setIsViewOnly(false); setShowModal(true) }}
                        className="p-2 text-steel-400 hover:text-blue-400 hover:bg-navy-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(vehicle.id)}
                        className="p-2 text-steel-400 hover:text-red-400 hover:bg-navy-700 rounded-lg transition-colors" 
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
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
            <Car className="w-12 h-12 text-steel-600 mx-auto mb-3" />
            <p className="text-steel-400">No se encontraron vehículos</p>
          </div>
        )}
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-steel-800">
          <p className="text-steel-500 text-sm">Mostrando {paginated.length} de {filtered.length} vehículos</p>
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

      {/* Modal */}
      {showModal && (
        <VehicleModal
          vehicle={selectedVehicle}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isViewOnly={isViewOnly}
        />
      )}
    </div>
  )
}

function VehicleModal({ vehicle, onClose, onSave, isViewOnly }: { 
  vehicle: Vehicle | null; 
  onClose: () => void; 
  onSave: (v: Partial<Vehicle>) => void;
  isViewOnly?: boolean;
}) {
  const isEdit = !!vehicle
  const [formData, setFormData] = useState<Partial<Vehicle>>(vehicle || {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    plate: '',
    km: 0,
    vin: '',
    owner: ''
  })

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-navy-900 border border-steel-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-steel-800">
          <h2 className="text-xl font-bold text-white">
            {isViewOnly ? 'Detalles del Vehículo' : isEdit ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </h2>
          <p className="text-steel-400 text-sm mt-1">
            {isViewOnly ? 'Información completa del vehículo registrado' : isEdit ? 'Modifica los datos del vehículo' : 'Registra un nuevo vehículo en el sistema'}
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Marca</label>
              <input 
                type="text" 
                className="input-field w-full disabled:opacity-60" 
                value={formData.brand} 
                onChange={e => setFormData({...formData, brand: e.target.value})}
                placeholder="Toyota" 
                disabled={isViewOnly}
              />
            </div>
            <div>
              <label className="label-text">Modelo</label>
              <input 
                type="text" 
                className="input-field w-full disabled:opacity-60" 
                value={formData.model} 
                onChange={e => setFormData({...formData, model: e.target.value})}
                placeholder="Corolla" 
                disabled={isViewOnly}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Año</label>
              <input 
                type="number" 
                className="input-field w-full disabled:opacity-60" 
                value={formData.year} 
                onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                placeholder="2024" 
                disabled={isViewOnly}
              />
            </div>
            <div>
              <label className="label-text">Color</label>
              <input 
                type="text" 
                className="input-field w-full disabled:opacity-60" 
                value={formData.color} 
                onChange={e => setFormData({...formData, color: e.target.value})}
                placeholder="Blanco" 
                disabled={isViewOnly}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="label-text">Kilometraje</label>
              <input 
                type="number" 
                className="input-field w-full disabled:opacity-60" 
                value={formData.km} 
                onChange={e => setFormData({...formData, km: parseInt(e.target.value)})}
                placeholder="0" 
                disabled={isViewOnly}
              />
            </div>
          </div>
          <div>
            <label className="label-text">VIN</label>
            <input 
              type="text" 
              className="input-field w-full disabled:opacity-60" 
              value={formData.vin} 
              onChange={e => setFormData({...formData, vin: e.target.value})}
              placeholder="Número de identificación vehicular" 
              disabled={isViewOnly}
            />
          </div>
          <div>
            <label className="label-text">Propietario</label>
            <input 
              type="text" 
              className="input-field w-full disabled:opacity-60" 
              value={formData.owner} 
              onChange={e => setFormData({...formData, owner: e.target.value})}
              placeholder="Nombre del propietario" 
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
              {isEdit ? 'Guardar Cambios' : 'Registrar Vehículo'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
