'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Paintbrush, Car, Camera, Sparkles } from 'lucide-react'
import SpecForm from '@/components/paint-visualizer/SpecForm'
import PhotoUploader from '@/components/paint-visualizer/PhotoUploader'
import type { SpecFormData } from '@/components/paint-visualizer/SpecForm'
import type { CarBodyType } from '@/lib/types/database'

type ActiveTab = 'specs' | 'photo'

interface DetectedData {
  make: string
  model: string
  year: number
  body_type: CarBodyType
  color_hex: string
  stub?: boolean
}

export default function PaintVisualizerPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ActiveTab>('specs')
  const [detectedData, setDetectedData] = useState<Partial<SpecFormData> | undefined>(undefined)
  const [photoError, setPhotoError] = useState<string | null>(null)

  const handleSuccess = useCallback(
    (sessionId: string) => {
      router.push(`/paint-visualizer/configure/${sessionId}`)
    },
    [router],
  )

  const handleDetected = useCallback((data: DetectedData) => {
    setDetectedData({
      make: data.make,
      model: data.model,
      year: String(data.year),
      bodyType: data.body_type,
    })
    setActiveTab('specs')
  }, [])

  const handlePhotoError = useCallback((msg: string) => {
    setPhotoError(msg)
  }, [])

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* ---- Header ---- */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
              <Paintbrush className="w-4 h-4 text-gray-950" />
            </div>
            <span className="font-semibold text-white tracking-tight">Paint Visualizer</span>
            <span className="hidden sm:block text-gray-500 text-sm">— by Drive2go</span>
          </div>
          <span className="text-xs text-gray-500 border border-gray-800 rounded-full px-3 py-1">
            Beta
          </span>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 text-yellow-400 text-sm font-medium mb-6 border border-yellow-400/20 bg-yellow-400/5 rounded-full px-4 py-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Detección automática con Inteligencia Artificial
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
          Visualiza el nuevo color<br />
          <span className="text-yellow-400">de tu vehículo</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
          Carga las especificaciones de tu auto o sube fotos para que nuestra IA lo detecte
          automáticamente. Experimenta con colores y acabados antes de pintar.
        </p>
      </section>

      {/* ---- Tabs ---- */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        {/* Tab selector */}
        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'specs'
                ? 'bg-yellow-400 text-gray-950 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Car className="w-4 h-4" />
            Especificaciones
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === 'photo'
                ? 'bg-yellow-400 text-gray-950 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            Foto 360°
          </button>
        </div>

        {/* Photo error banner */}
        {photoError && activeTab === 'photo' && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 flex items-center justify-between">
            <span>{photoError}</span>
            <button
              type="button"
              onClick={() => setPhotoError(null)}
              className="ml-4 text-red-400/60 hover:text-red-400 text-xs underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* ---- Tab: Especificaciones ---- */}
        {activeTab === 'specs' && (
          <SpecForm onSuccess={handleSuccess} initialData={detectedData} />
        )}

        {/* ---- Tab: Foto 360° ---- */}
        {activeTab === 'photo' && (
          <PhotoUploader onDetected={handleDetected} onError={handlePhotoError} />
        )}

        {/* ---- Feature preview cards ---- */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: '🎨',
              title: 'Paleta profesional',
              desc: 'Colores PPG/Sikkens con acabados sólido, metálico, perla y mate',
            },
            {
              icon: '🚗',
              title: 'Modelo 3D interactivo',
              desc: 'Visualiza el resultado final con un modelo 3D del vehículo',
            },
            {
              icon: '🔗',
              title: 'Enlace mágico',
              desc: 'Comparte la sesión con tu cliente por email o WhatsApp',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2">{feat.icon}</div>
              <p className="text-sm font-medium text-white mb-1">{feat.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
