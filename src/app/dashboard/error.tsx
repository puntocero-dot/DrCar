'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-navy-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold">Error en el Dashboard</h1>
        <p className="text-steel-400">
          Ocurrió un error cargando esta sección. Esto puede ser temporal.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-xl font-bold hover:bg-accent-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3 bg-navy-800 text-white rounded-xl font-bold hover:bg-navy-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
      </div>
    </div>
  )
}
