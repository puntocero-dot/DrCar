'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, CheckCircle2, AlertCircle, User, Phone, Bell, Wrench, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Profile } from '@/lib/types/database'

type ToastType = 'success' | 'error' | null

const NOTIF_KEYS = {
  reminders: 'drive2go_notif_reminders',
  updates: 'drive2go_notif_updates',
}

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  id: string
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-accent-500' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function ClientSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: ToastType; message: string }>({ type: null, message: '' })

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  // Notification preferences (localStorage only)
  const [notifReminders, setNotifReminders] = useState(true)
  const [notifUpdates, setNotifUpdates] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    // Load localStorage prefs
    if (typeof window !== 'undefined') {
      const savedReminders = localStorage.getItem(NOTIF_KEYS.reminders)
      const savedUpdates = localStorage.getItem(NOTIF_KEYS.updates)
      if (savedReminders !== null) setNotifReminders(savedReminders === 'true')
      if (savedUpdates !== null) setNotifUpdates(savedUpdates === 'true')
    }

    async function fetchProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          const p = data as Profile
          setProfile(p)
          setFullName(p.full_name ?? '')
          setPhone(p.phone ?? '')
        }
      } catch (err) {
        console.error('Error fetching client profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [supabase])

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast({ type: null, message: '' }), 4000)
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await (supabase.from('profiles') as any)
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        showToast('error', `Error al guardar: ${error.message}`)
      } else {
        // Persist notification prefs
        if (typeof window !== 'undefined') {
          localStorage.setItem(NOTIF_KEYS.reminders, String(notifReminders))
          localStorage.setItem(NOTIF_KEYS.updates, String(notifUpdates))
        }
        showToast('success', 'Perfil actualizado correctamente')
        setProfile((prev) =>
          prev ? { ...prev, full_name: fullName || null, phone: phone || null } : prev
        )
      }
    } catch (err) {
      showToast('error', 'Error inesperado al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
        <p className="text-zinc-400">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Mi Perfil</h1>
        <p className="text-zinc-400 mt-1">Gestiona tu información personal y preferencias</p>
      </div>

      {/* Toast */}
      {toast.type && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 text-sm font-medium border ${
            toast.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Profile Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
        <CardContent className="p-6 space-y-5">
          {/* Read-only */}
          <div className="space-y-4 pb-5 border-b border-zinc-800">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Información de cuenta
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile?.email ?? ''}
                  readOnly
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-300 opacity-50 cursor-not-allowed outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs font-medium mb-1.5">Rol</label>
                <input
                  type="text"
                  value="Cliente"
                  readOnly
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-300 opacity-50 cursor-not-allowed outline-none"
                />
              </div>
            </div>
          </div>

          {/* Editable */}
          <div className="space-y-4 pt-1">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
              Información personal
            </h2>

            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Nombre completo
                </span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Teléfono
                </span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. +503 7000-0000"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-accent-500/60 focus:ring-1 focus:ring-accent-500/30 transition-colors"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" /> Preferencias de notificación
          </h2>
          <p className="text-zinc-500 text-xs -mt-2">
            Estas preferencias se guardan localmente en tu dispositivo
          </p>

          <div className="space-y-4">
            {/* Reminder toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg mt-0.5">
                  <Bell className="w-4 h-4 text-accent-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Recordatorios de cita</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    Recibe recordatorios antes de tus citas en el taller
                  </p>
                </div>
              </div>
              <Toggle
                id="notif-reminders"
                checked={notifReminders}
                onChange={setNotifReminders}
              />
            </div>

            {/* Updates toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg mt-0.5">
                  <Wrench className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Actualizaciones de reparación</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    Notificaciones cuando cambie el estado de tu vehículo en taller
                  </p>
                </div>
              </div>
              <Toggle
                id="notif-updates"
                checked={notifUpdates}
                onChange={setNotifUpdates}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          isLoading={saving}
          disabled={saving}
          size="md"
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Guardar perfil
        </Button>
      </div>
    </div>
  )
}
