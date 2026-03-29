'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  authenticateDemo,
  setDemoUser,
  isSupabaseConfigured,
  DEMO_USERS,
} from '@/lib/auth/demo-users'
import {
  Wrench,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Users,
} from 'lucide-react'

const isDemoMode = !isSupabaseConfigured()

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const redirectByRole = (role: string) => {
    const routes: Record<string, string> = {
      superadmin: '/dashboard/superadmin',
      admin: '/dashboard/admin',
      technician: '/dashboard/technician',
      client: '/dashboard/client',
    }
    router.push(routes[role] || '/dashboard/client')
  }

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const user = authenticateDemo(email, password)
    if (!user) {
      setError('Credenciales incorrectas. Usa las credenciales demo.')
      setLoading(false)
      return
    }

    setDemoUser(user)
    redirectByRole(user.role)
  }

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.')
        setLoading(false)
        return
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          redirectByRole((profile as any).role)
        }
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = isDemoMode ? handleDemoLogin : handleSupabaseLogin

  const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-navy-400 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-lg px-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30">
              <Wrench className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                AutoMaster
              </h1>
              <span className="text-accent-400 font-semibold text-lg">AI</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-4">
            Gestión Inteligente de Talleres
          </h2>
          <p className="text-steel-300 text-lg leading-relaxed mb-10">
            Controla reparaciones, gestiona citas, registra evidencia y optimiza
            tu taller con inteligencia artificial.
          </p>

          <div className="space-y-5">
            <FeatureItem
              icon={<ShieldCheck className="w-5 h-5 text-accent-400" />}
              text="Control total por roles: SuperAdmin, Admin, Técnico, Cliente"
            />
            <FeatureItem
              icon={<Wrench className="w-5 h-5 text-accent-400" />}
              text="Seguimiento de reparaciones en tiempo real"
            />
            <FeatureItem
              icon={<Mail className="w-5 h-5 text-accent-400" />}
              text="Recordatorios automáticos de mantenimiento"
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-navy-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AutoMaster</h1>
              <span className="text-accent-400 font-semibold text-sm">AI</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-steel-400 text-base">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label-text">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input-field pl-12"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-text">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-12 pr-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-steel-500 hover:text-steel-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {isDemoMode && (
            <div className="mt-6 p-4 bg-navy-800/50 border border-navy-700 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-accent-400" />
                <span className="text-accent-400 font-semibold text-sm">Modo Demo</span>
              </div>
              <p className="text-steel-400 text-xs mb-3">
                Haz clic en un usuario para autocompletar credenciales:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => fillDemoCredentials(u.email, u.password)}
                    className="text-left p-2.5 rounded-lg bg-navy-700/50 hover:bg-navy-700 border border-navy-600/50 hover:border-accent-500/50 transition-all group"
                  >
                    <span className="text-white text-xs font-medium block group-hover:text-accent-400 transition-colors">
                      {u.full_name}
                    </span>
                    <span className="text-steel-500 text-[11px] capitalize">{u.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-steel-500 text-sm mt-8">
            AutoMaster AI &copy; {new Date().getFullYear()} &mdash; Todos los
            derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-navy-700 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-steel-200 text-base">{text}</span>
    </div>
  )
}
