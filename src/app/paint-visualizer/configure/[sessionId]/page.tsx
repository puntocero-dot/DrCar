'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Paintbrush, RotateCcw, Share2 } from 'lucide-react'
import PartSelector from '@/components/paint-visualizer/PartSelector'
import ColorPanel from '@/components/paint-visualizer/ColorPanel'
import ShareModal from '@/components/paint-visualizer/ShareModal'
import type { PaintConfig, PaintFinish } from '@/lib/types/database'
import type { PaintablePart } from '@/lib/paint/ferrari-parts'
import { DEFAULT_PART_CONFIGS } from '@/lib/paint/ferrari-parts'
import { usePaintSessionSync } from '@/hooks/usePaintSessionSync'

// Dynamic import to prevent SSR (three.js needs browser)
const CarViewer = dynamic(() => import('@/components/paint-visualizer/CarViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400">Cargando modelo 3D…</p>
      </div>
    </div>
  ),
})

const INITIAL_CONFIG: PaintConfig = {
  body: { ...DEFAULT_PART_CONFIGS.body },
  wheels: { ...DEFAULT_PART_CONFIGS.wheels },
  roof: { ...DEFAULT_PART_CONFIGS.roof },
  bumper_front: { ...DEFAULT_PART_CONFIGS.bumper_front },
  bumper_rear: { ...DEFAULT_PART_CONFIGS.bumper_rear },
}

export default function ConfigurePage({ params }: { params: { sessionId: string } }) {
  const [paintConfig, setPaintConfig] = useState<PaintConfig>(INITIAL_CONFIG)
  const [selectedPart, setSelectedPart] = useState<PaintablePart>('body')
  const [showShareModal, setShowShareModal] = useState(false)
  const [sessionAccessToken, setSessionAccessToken] = useState<string | null>(null)
  const [isFetchingToken, setIsFetchingToken] = useState(false)

  // No accessToken in staff flow → hook will skip saving
  const { isSaving } = usePaintSessionSync(params.sessionId, null, paintConfig)

  const currentPartConfig = paintConfig[selectedPart] ?? DEFAULT_PART_CONFIGS[selectedPart]

  const handleColorChange = useCallback((hex: string) => {
    setPaintConfig((prev) => ({
      ...prev,
      [selectedPart]: { ...prev[selectedPart], color: hex },
    }))
  }, [selectedPart])

  const handleFinishChange = useCallback((finish: PaintFinish) => {
    setPaintConfig((prev) => ({
      ...prev,
      [selectedPart]: { ...prev[selectedPart], finish },
    }))
  }, [selectedPart])

  const handleReset = () => setPaintConfig(INITIAL_CONFIG)

  const handleShare = async () => {
    if (sessionAccessToken) {
      setShowShareModal(true)
      return
    }
    setIsFetchingToken(true)
    try {
      const res = await fetch(`/api/paint-visualizer/send-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: params.sessionId }),
      })
      if (res.ok) {
        const data = (await res.json()) as { link: string; access_token?: string }
        // Extract token from link path: /paint-visualizer/s/<token>
        const parts = data.link.split('/paint-visualizer/s/')
        if (parts[1]) {
          setSessionAccessToken(parts[1])
          setShowShareModal(true)
        }
      }
    } finally {
      setIsFetchingToken(false)
    }
  }

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm h-14 flex items-center px-4 gap-3 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center">
          <Paintbrush className="w-3.5 h-3.5 text-gray-950" />
        </div>
        <span className="font-semibold text-sm">Paint Visualizer</span>
        <span className="text-gray-600 text-xs">Sesión #{params.sessionId.slice(0, 8)}</span>
        {isSaving && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Guardando…
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700 rounded-lg px-3 py-1.5 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button
            onClick={handleShare}
            disabled={isFetchingToken}
            className="flex items-center gap-1.5 text-xs text-gray-950 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 rounded-lg px-3 py-1.5 font-medium transition-colors"
          >
            <Share2 className="w-3 h-3" />
            {isFetchingToken ? 'Obteniendo…' : 'Compartir'}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Viewer — left/center */}
        <div className="flex-1 p-4">
          <CarViewer
            paintConfig={paintConfig}
            selectedPart={selectedPart}
            className="h-full"
          />
        </div>

        {/* Controls panel — right sidebar */}
        <aside className="w-80 border-l border-gray-800 bg-gray-950 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-6">
            <PartSelector selectedPart={selectedPart} onSelect={setSelectedPart} />
            <div className="border-t border-gray-800 pt-4">
              <ColorPanel
                selectedColor={currentPartConfig.color}
                selectedFinish={currentPartConfig.finish}
                onColorChange={handleColorChange}
                onFinishChange={handleFinishChange}
              />
            </div>
          </div>

          {/* Current config summary */}
          <div className="mt-auto border-t border-gray-800 p-4 space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Configuración actual</p>
            {Object.entries(paintConfig).map(([part, cfg]) => cfg && (
              <div key={part} className="flex items-center gap-2 text-xs">
                <div
                  className="w-4 h-4 rounded-full border border-gray-700 flex-shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                <span className="text-gray-300 capitalize flex-1">{part.replace('_', ' ')}</span>
                <span className="text-gray-500">{cfg.finish}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {showShareModal && sessionAccessToken && (
        <ShareModal
          sessionId={params.sessionId}
          accessToken={sessionAccessToken}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  )
}
