'use client'

import { useState } from 'react'
import {
  Settings,
  Save,
  Check,
  Building2,
  Clock,
  Globe,
  Bell,
  Palette,
  Database,
  Mail,
} from 'lucide-react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [workshopName, setWorkshopName] = useState('AutoMaster Taller Central')
  const [address, setAddress] = useState('Av. Reforma #456, Col. Centro, CDMX')
  const [phone, setPhone] = useState('+52 55 1234 5678')
  const [email, setEmail] = useState('contacto@automaster.com')
  const [openTime, setOpenTime] = useState('08:00')
  const [closeTime, setCloseTime] = useState('18:00')
  const [timezone, setTimezone] = useState('America/Mexico_City')
  const [currency, setCurrency] = useState('MXN')
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: false,
    appointmentAlerts: true,
    repairUpdates: true,
    dailyReport: true,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Configuración</h1>
          <p className="text-steel-400 mt-1">Ajustes generales del sistema y del taller</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Guardado' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workshop Info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent-500/15 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Información del Taller</h3>
              <p className="text-steel-500 text-sm">Datos generales de tu negocio</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label-text">Nombre del Taller</label>
              <input type="text" value={workshopName} onChange={(e) => setWorkshopName(e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="label-text">Dirección</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Teléfono</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Horario y Zona</h3>
              <p className="text-steel-500 text-sm">Horario de operación del taller</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Hora de Apertura</label>
                <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="input-field w-full" />
              </div>
              <div>
                <label className="label-text">Hora de Cierre</label>
                <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="input-field w-full" />
              </div>
            </div>
            <div>
              <label className="label-text">Zona Horaria</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field w-full">
                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                <option value="America/Monterrey">Monterrey (GMT-6)</option>
                <option value="America/Tijuana">Tijuana (GMT-8)</option>
                <option value="America/Cancun">Cancún (GMT-5)</option>
              </select>
            </div>
            <div>
              <label className="label-text">Moneda</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field w-full">
                <option value="MXN">Peso Mexicano (MXN)</option>
                <option value="USD">Dólar Americano (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Notificaciones</h3>
              <p className="text-steel-500 text-sm">Configura alertas y recordatorios</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: 'emailReminders', label: 'Recordatorios por Email', desc: 'Enviar recordatorios de citas por email' },
              { key: 'smsReminders', label: 'Recordatorios por SMS', desc: 'Enviar recordatorios de citas por SMS' },
              { key: 'appointmentAlerts', label: 'Alertas de Citas', desc: 'Notificar sobre citas próximas' },
              { key: 'repairUpdates', label: 'Actualizaciones de Reparación', desc: 'Notificar cambios de estado de reparaciones' },
              { key: 'dailyReport', label: 'Reporte Diario', desc: 'Enviar resumen diario por email' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-steel-500 text-xs">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications[item.key as keyof typeof notifications] ? 'bg-accent-500' : 'bg-steel-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Información del Sistema</h3>
              <p className="text-steel-500 text-sm">Datos técnicos de la plataforma</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Versión', value: 'AutoMaster AI v1.0.0' },
              { label: 'Framework', value: 'Next.js 14.2.5' },
              { label: 'Base de Datos', value: 'Supabase (PostgreSQL)' },
              { label: 'Almacenamiento', value: 'Supabase Storage' },
              { label: 'Modo', value: 'Demo (Sin conexión a Supabase)' },
              { label: 'Último Deploy', value: '2024-03-26' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-steel-800/50 last:border-0">
                <span className="text-steel-400 text-sm">{item.label}</span>
                <span className="text-white text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
