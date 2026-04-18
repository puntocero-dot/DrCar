'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Car } from 'lucide-react'
import Link from 'next/link'

export default function RentalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Rental module error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">
          Error en <span className="text-emerald-500">Ready2Drive</span>
        </h1>
        <p className="text-zinc-400">
          No pudimos cargar esta sección. Por favor intenta de nuevo.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-zinc-900 rounded-xl font-bold hover:bg-emerald-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
          <Link
            href="/ready2drivesv"
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-colors"
          >
            <Car className="w-4 h-4" /> Catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}
