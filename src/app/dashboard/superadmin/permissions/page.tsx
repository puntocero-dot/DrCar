'use client'

import { useState } from 'react'
import {
  Shield,
  Save,
  Check,
  X,
  Eye,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react'

interface Permission {
  module: string
  superadmin: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  admin: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  technician: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  client: { view: boolean; create: boolean; edit: boolean; delete: boolean }
}

const INITIAL_PERMISSIONS: Permission[] = [
  {
    module: 'Vehículos',
    superadmin: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: true, edit: true, delete: false },
    technician: { view: true, create: false, edit: false, delete: false },
    client: { view: true, create: false, edit: false, delete: false },
  },
  {
    module: 'Reparaciones',
    superadmin: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: true, edit: true, delete: false },
    technician: { view: true, create: false, edit: true, delete: false },
    client: { view: true, create: false, edit: false, delete: false },
  },
  {
    module: 'Citas',
    superadmin: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: true, edit: true, delete: true },
    technician: { view: true, create: false, edit: false, delete: false },
    client: { view: true, create: true, edit: true, delete: true },
  },
  {
    module: 'Usuarios',
    superadmin: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: false, edit: false, delete: false },
    technician: { view: false, create: false, edit: false, delete: false },
    client: { view: false, create: false, edit: false, delete: false },
  },
  {
    module: 'Facturación',
    superadmin: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: true, edit: true, delete: false },
    technician: { view: false, create: false, edit: false, delete: false },
    client: { view: true, create: false, edit: false, delete: false },
  },
  {
    module: 'Reportes',
    superadmin: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: false, edit: false, delete: false },
    technician: { view: false, create: false, edit: false, delete: false },
    client: { view: false, create: false, edit: false, delete: false },
  },
  {
    module: 'Presupuestos',
    superadmin: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: true, edit: true, delete: false },
    technician: { view: true, create: false, edit: false, delete: false },
    client: { view: true, create: false, edit: false, delete: false },
  },
  {
    module: 'Configuración',
    superadmin: { view: true, create: true, edit: true, delete: true },
    admin: { view: false, create: false, edit: false, delete: false },
    technician: { view: false, create: false, edit: false, delete: false },
    client: { view: false, create: false, edit: false, delete: false },
  },
]

const roles = ['superadmin', 'admin', 'technician', 'client'] as const
const roleLabels: Record<string, string> = { superadmin: 'SuperAdmin', admin: 'Admin', technician: 'Técnico', client: 'Cliente' }
const actionLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  view: { label: 'Ver', icon: <Eye className="w-3.5 h-3.5" /> },
  create: { label: 'Crear', icon: <Plus className="w-3.5 h-3.5" /> },
  edit: { label: 'Editar', icon: <Edit2 className="w-3.5 h-3.5" /> },
  delete: { label: 'Eliminar', icon: <Trash2 className="w-3.5 h-3.5" /> },
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>(INITIAL_PERMISSIONS)
  const [saved, setSaved] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('admin')

  const togglePermission = (moduleIdx: number, role: string, action: string) => {
    if (role === 'superadmin') return
    setPermissions((prev) => {
      const updated = [...prev]
      const mod = { ...updated[moduleIdx] }
      const rolePerms = { ...(mod as any)[role] }
      rolePerms[action] = !rolePerms[action]
      ;(mod as any)[role] = rolePerms
      updated[moduleIdx] = mod
      return updated
    })
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Permisos</h1>
          <p className="text-steel-400 mt-1">Controla el acceso de cada rol a los módulos del sistema</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Guardado' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedRole === role
                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                : 'bg-navy-800 text-steel-400 border border-steel-800 hover:text-white'
            }`}
          >
            {roleLabels[role]}
          </button>
        ))}
      </div>

      {selectedRole === 'superadmin' && (
        <div className="card p-4 mb-6 bg-purple-500/10 border-purple-500/30">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">El SuperAdmin tiene acceso completo a todos los módulos. Estos permisos no son editables.</span>
          </div>
        </div>
      )}

      {/* Permissions Grid */}
      <div className="space-y-4">
        {permissions.map((perm, idx) => {
          const rolePerms = (perm as any)[selectedRole]
          return (
            <div key={perm.module} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{perm.module}</h3>
                </div>
                <div className="flex items-center gap-3">
                  {Object.entries(actionLabels).map(([action, config]) => (
                    <button
                      key={action}
                      onClick={() => togglePermission(idx, selectedRole, action)}
                      disabled={selectedRole === 'superadmin'}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                        rolePerms[action]
                          ? 'bg-green-500/15 text-green-400 border-green-500/30'
                          : 'bg-navy-800 text-steel-500 border-steel-700'
                      } ${selectedRole !== 'superadmin' ? 'cursor-pointer hover:opacity-80' : 'cursor-default opacity-70'}`}
                    >
                      {rolePerms[action] ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
