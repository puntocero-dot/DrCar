'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check, MessageCircle } from 'lucide-react'

interface ShareModalProps {
  sessionId: string
  accessToken: string
  onClose: () => void
}

export default function ShareModal({ accessToken, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const link = origin ? `${origin}/paint-visualizer/s/${accessToken}` : ''

  const whatsappText = `Hola, te comparto tu sesión de Paint Visualizer para ver los colores de tu vehículo: ${link}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`

  const handleCopy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = link
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-base">Compartir sesión</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link input */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Link de visualización
          </label>
          <input
            type="text"
            readOnly
            value={link}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-gray-600 cursor-text select-all"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCopy}
            disabled={!link}
            className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-gray-950 font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar link
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-medium text-sm rounded-lg px-4 py-2.5 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Abrir WhatsApp
          </a>
        </div>

        {/* WhatsApp text preview */}
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Texto listo para WhatsApp
          </p>
          <p className="text-xs text-gray-400 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 leading-relaxed select-all cursor-text">
            {whatsappText}
          </p>
        </div>

        {/* Expiry note */}
        <p className="text-xs text-gray-600 text-center">
          El link expira en 30 días
        </p>
      </div>
    </div>
  )
}
