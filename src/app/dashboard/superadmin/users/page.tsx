'use client'

import { useState } from 'react'
import {
  Users,
  Plus,
  Search,
  Shield,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Mail,
  Phone,
} from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: 'superadmin' | 'admin' | 'technician' | 'client'
  status: 'active' | 'inactive'
  joinedDate: string
  lastLogin: string
}

const DEMO_USERS: UserProfile[] = [
  { id: '1', name: 'Carlos Mendoza', email: 'superadmin@automaster.com', phone: '+52 55 1234 5678', role: 'superadmin', status: 'active', joinedDate: '2023-01-15', lastLogin: '2024-03-26' },
  { id: '2', name: 'María García', email: 'admin@automaster.com', phone: '+52 55 2345 6789', role: 'admin', status: 'active', joinedDate: '2023-03-20', lastLogin: '2024-03-26' },
  { id: '3', name: 'Roberto Díaz', email: 'roberto@automaster.com', phone: '+52 55 3456 7890', role: 'technician', status: 'active', joinedDate: '2023-05-10', lastLogin: '2024-03-26' },
  { id: '4', name: 'Miguel Torres', email: 'miguel@automaster.com', phone: '+52 55 4567 8901', role: 'technician', status: 'active', joinedDate: '2023-06-15', lastLogin: '2024-03-25' },
  { id: '5', name: 'Luis Herrera', email: 'luis@automaster.com', phone: '+52 55 5678 9012', role: 'technician', status: 'inactive', joinedDate: '2023-08-01', lastLogin: '2024-03-10' },
  { id: '6', name: 'Juan Pérez', email: 'juan@email.com', phone: '+52 55 6789 0123', role: 'client', status: 'active', joinedDate: '2023-09-12', lastLogin: '2024-03-24' },
  { id: '7', name: 'Ana García', email: 'ana@email.com', phone: '+52 55 7890 1234', role: 'client', status: 'active', joinedDate: '2023-10-05', lastLogin: '2024-03-22' },
  { id: '8', name: 'Pedro Martínez', email: 'pedro@email.com', phone: '+52 55 8901 2345', role: 'client', status: 'inactive', joinedDate: '2023-11-20', lastLogin: '2024-02-15' },
]

const roleConfig: Record<string, { label: string; class: string }> = {
  superadmin: { label: 'SuperAdmin', class: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  admin: { label: 'Admin', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  technician: { label: 'Técnico', class: 'bg-accent-500/15 text-accent-400 border-accent-500/30' },
  client: { label: 'Cliente', class: 'bg-green-500/15 text-green-400 border-green-500/30' },
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = DEMO_USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Usuarios</h1>
          <p className="text-steel-400 mt-1">Administración de usuarios y roles del sistema</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', count: DEMO_USERS.length, icon: <Users className="w-6 h-6 text-accent-400" />, bg: 'bg-accent-500/15' },
          { label: 'Técnicos', count: DEMO_USERS.filter(u => u.role === 'technician').length, icon: <Shield className="w-6 h-6 text-amber-400" />, bg: 'bg-amber-500/15' },
          { label: 'Activos', count: DEMO_USERS.filter(u => u.status === 'active').length, icon: <UserCheck className="w-6 h-6 text-green-400" />, bg: 'bg-green-500/15' },
          { label: 'Inactivos', count: DEMO_USERS.filter(u => u.status === 'inactive').length, icon: <UserX className="w-6 h-6 text-red-400" />, bg: 'bg-red-500/15' },
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
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field min-w-[160px]"
          >
            <option value="all">Todos los roles</option>
            <option value="superadmin">SuperAdmin</option>
            <option value="admin">Admin</option>
            <option value="technician">Técnico</option>
            <option value="client">Cliente</option>
          </select>
        </div>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((user) => (
          <div key={user.id} className="card p-5 hover:border-steel-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 font-bold text-lg">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{user.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleConfig[user.role].class}`}>
                    {roleConfig[user.role].label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-steel-400 hover:text-blue-400 hover:bg-navy-700 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-steel-400 hover:text-red-400 hover:bg-navy-700 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-steel-400">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-steel-400">
                <Phone className="w-4 h-4" />
                <span>{user.phone}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-steel-800">
              <span className="text-steel-500 text-xs">Último login: {user.lastLogin}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                {user.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-steel-600 mx-auto mb-3" />
          <p className="text-steel-400">No se encontraron usuarios</p>
        </div>
      )}
    </div>
  )
}
