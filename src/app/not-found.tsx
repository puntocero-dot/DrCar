import Link from 'next/link'
import { Car, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-8">
        <div className="relative">
          <div className="text-[120px] font-black italic tracking-tighter text-zinc-900 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="w-16 h-16 text-emerald-500 animate-bounce" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">
            Ruta no encontrada
          </h1>
          <p className="text-zinc-400">
            La página que buscas no existe o fue movida a otra dirección.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-zinc-900 rounded-xl font-bold hover:bg-emerald-400 transition-colors"
          >
            <Home className="w-4 h-4" /> Ir al inicio
          </Link>
          <Link
            href="/ready2drivesv"
            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-colors"
          >
            <Car className="w-4 h-4" /> Explorar flota
          </Link>
        </div>
      </div>
    </div>
  )
}
