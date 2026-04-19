'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Paintbrush,
  Search,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Archive,
  Activity,
  User,
  Phone,
  Mail,
  Car,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PaintSession, PaintSessionStatus } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/Card'

const PAGE_SIZE = 15

const STATUS_CONFIG: Record<PaintSessionStatus, { label: string; class: string; icon: React.ReactNode }> = {
  active: {
    label: 'Activa',
    class: 'bg-green-500/15 text-green-400 border-green-500/30',
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  completed: {
    label: 'Completada',
    class: 'bg-steel-500/15 text-steel-300 border-steel-500/30',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  archived: {
    label: 'Archivada',
    class: 'bg-red-500/15 text-red-400 border-red-500/30',
    icon: <Archive className="w-3.5 h-3.5" />,
  },
}

const STATUS_TABS: { value: PaintSessionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'archived', label: 'Archivadas' },
]

export default function PaintSessionsPage() {
  const [sessions, setSessions] = useState<PaintSession[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaintSessionStatus | 'all'>('all')
  const [page, setPage] = useState(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      let query = (supabase.from('paint_sessions') as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (!error && data) {
        setSessions(data as PaintSession[])
      }
    } catch (err) {
      console.error('Error fetching paint sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase, statusFilter])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Reset page when filter/search changes
  useEffect(() => {
    setPage(0)
  }, [statusFilter, search])

  const filtered = sessions.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.client_name.toLowerCase().includes(q) ||
      s.client_email.toLowerCase().includes(q) ||
      (s.client_phone ?? '').toLowerCase().includes(q) ||
      (s.car_make ?? '').toLowerCase().includes(q) ||
      (s.car_model ?? '').toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const copyClientLink = async (session: PaintSession) => {
    const url = `${window.location.origin}/paint-visualizer/s/${session.access_token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(session.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopiedId(session.id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const bodyTypeLabel = (type: string | null) => {
    if (!type) return '—'
    const labels: Record<string, string> = {
      sedan: 'Sedán',
      suv: 'SUV',
      hatchback: 'Hatchback',
      pickup: 'Pickup',
      coupe: 'Coupé',
      van: 'Van',
      crossover: 'Crossover',
    }
    return labels[type] ?? type
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Paintbrush className="w-7 h-7 text-yellow-400" />
            Sesiones de Pintura
          </h1>
          <p className="text-steel-400 mt-1">
            Gestiona las sesiones de visualización de color de los clientes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {(
          [
            {
              label: 'Activas',
              count: sessions.filter((s) => s.status === 'active').length,
              color: 'text-green-400',
            },
            {
              label: 'Completadas',
              count: sessions.filter((s) => s.status === 'completed').length,
              color: 'text-steel-300',
            },
            {
              label: 'Archivadas',
              count: sessions.filter((s) => s.status === 'archived').length,
              color: 'text-red-400',
            },
          ] as const
        ).map((s) => (
          <Card key={s.label} className="bg-navy-900/50">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-steel-500 text-xs mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 bg-navy-900/50 border border-steel-800 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-accent-500 text-white'
                : 'text-steel-400 hover:text-white hover:bg-navy-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-steel-500" />
          <input
            type="text"
            placeholder="Buscar por cliente, email, teléfono, marca o modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
            <p className="text-steel-400 text-sm">Cargando sesiones...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-steel-800">
                    <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Cliente
                      </span>
                    </th>
                    <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Email
                      </span>
                    </th>
                    <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Teléfono
                      </span>
                    </th>
                    <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">
                      <span className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5" /> Marca / Modelo
                      </span>
                    </th>
                    <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Carrocería</th>
                    <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Estado</th>
                    <th className="text-left text-steel-400 text-sm font-medium px-6 py-4">Creada</th>
                    <th className="text-right text-steel-400 text-sm font-medium px-6 py-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((session) => {
                    const status = STATUS_CONFIG[session.status]
                    return (
                      <tr
                        key={session.id}
                        className="border-b border-steel-800/50 hover:bg-navy-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-white font-medium text-sm">{session.client_name}</p>
                        </td>
                        <td className="px-6 py-4 text-steel-300 text-sm">{session.client_email}</td>
                        <td className="px-6 py-4 text-steel-300 text-sm">
                          {session.client_phone ?? '—'}
                        </td>
                        <td className="px-6 py-4">
                          {session.car_make || session.car_model ? (
                            <>
                              <p className="text-white text-sm font-medium">
                                {session.car_make} {session.car_model}
                              </p>
                              {session.car_year && (
                                <p className="text-steel-500 text-xs">{session.car_year}</p>
                              )}
                            </>
                          ) : (
                            <span className="text-steel-600 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-steel-300 text-sm">
                          {bodyTypeLabel(session.car_body_type)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.class}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-steel-400 text-sm">
                          {new Date(session.created_at).toLocaleDateString('es', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={`/paint-visualizer/configure/${session.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-steel-400 hover:text-yellow-400 hover:bg-navy-700 rounded-lg transition-colors"
                              title="Abrir configurador"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => copyClientLink(session)}
                              className="p-2 text-steel-400 hover:text-accent-400 hover:bg-navy-700 rounded-lg transition-colors"
                              title="Copiar link del cliente"
                            >
                              {copiedId === session.id ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {paginated.length === 0 && (
              <div className="text-center py-12">
                <Paintbrush className="w-12 h-12 text-steel-600 mx-auto mb-3" />
                <p className="text-steel-400">No hay sesiones de pintura activas</p>
                {(search || statusFilter !== 'all') && (
                  <p className="text-steel-600 text-sm mt-1">
                    Prueba con otros filtros de búsqueda
                  </p>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-steel-800">
              <p className="text-steel-500 text-sm">
                Mostrando {paginated.length > 0 ? page * PAGE_SIZE + 1 : 0}–
                {Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length} sesiones
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 text-steel-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                      page === i
                        ? 'bg-accent-500/20 text-white'
                        : 'text-steel-400 hover:text-white hover:bg-navy-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 text-steel-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
