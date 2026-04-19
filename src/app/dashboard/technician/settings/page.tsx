'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, CheckCircle2, AlertCircle, User, Phone, Image, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Profile } from '@/lib/types/database'

type ToastType = 'success' | 'error' | null

export default function TechnicianSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: ToastType; message: string }>({ type: null, message: '' })

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const supabase = createClient()

  useEffect(() => {
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
          setAvatarUrl(p.avatar_url ?? '')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
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
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) {
        showToast('error', `Error al guardar: ${error.message}`)
      } else {
        showToast('success', 'Cambios guardados correctamente')
        setProfile((prev) =>
          prev
            ? { ...prev, full_name: fullName || null, phone: phone || null, avatar_url: avatarUrl || null }
            : prev
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
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
        <p className="text-steel-400">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Configuración</h1>
        <p className="text-steel-400 mt-1">Actualiza tu información de perfil</p>
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

      {/* Avatar Preview */}
      {avatarUrl && (
        <Card className="mb-6 bg-navy-900/50">
          <CardContent className="p-4 flex items-center gap-4">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-steel-700"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div>
              <p className="text-white font-medium text-sm">{fullName || 'Sin nombre'}</p>
              <p className="text-steel-500 text-xs capitalize">{profile?.role}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card className="bg-navy-900/50">
        <CardContent className="p-6 space-y-5">
          {/* Read-only fields */}
          <div className="space-y-4 pb-5 border-b border-steel-800">
            <h2 className="text-xs uppercase tracking-widest text-steel-500 font-semibold flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Información de cuenta (no editable)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-steel-400 text-xs font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile?.email ?? ''}
                  readOnly
                  className="input-field w-full opacity-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-steel-400 text-xs font-medium mb-1.5">Rol</label>
                <input
                  type="text"
                  value="Técnico"
                  readOnly
                  className="input-field w-full opacity-50 cursor-not-allowed capitalize"
                />
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-4 pt-1">
            <h2 className="text-xs uppercase tracking-widest text-steel-500 font-semibold">
              Información personal
            </h2>

            <div>
              <label className="block text-steel-400 text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Nombre completo
                </span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Roberto Díaz"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-steel-400 text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Teléfono
                </span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. +503 7000-0000"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-steel-400 text-xs font-medium mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" /> URL de avatar
                </span>
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://ejemplo.com/mi-foto.jpg"
                className="input-field w-full"
              />
              <p className="text-steel-600 text-xs mt-1">Ingresa la URL directa de tu imagen de perfil</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          isLoading={saving}
          disabled={saving}
          size="md"
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
