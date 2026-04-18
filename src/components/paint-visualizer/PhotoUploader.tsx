'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { CAR_BODY_TYPES } from '@/lib/paint/materials'
import type { CarBodyType } from '@/lib/types/database'

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface DetectedData {
  make: string
  model: string
  year: number
  body_type: CarBodyType
  color_hex: string
  stub?: boolean
}

interface PhotoUploaderProps {
  onDetected: (data: DetectedData) => void
  onError: (msg: string) => void
}

interface PreviewFile {
  file: File
  previewUrl: string
}

export default function PhotoUploader({ onDetected, onError }: PhotoUploaderProps) {
  const [files, setFiles] = useState<PreviewFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detected, setDetected] = useState<DetectedData | null>(null)

  // Editable detected fields
  const [editMake, setEditMake] = useState('')
  const [editModel, setEditModel] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editBodyType, setEditBodyType] = useState<CarBodyType | ''>('')

  const inputRef = useRef<HTMLInputElement>(null)

  const CURRENT_YEAR = new Date().getFullYear()
  const YEARS = Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, i) => CURRENT_YEAR - i)

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming)
      const valid: PreviewFile[] = []
      let hasError = false

      for (const file of arr) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          onError(`El archivo "${file.name}" no es una imagen válida (JPG, PNG o WebP).`)
          hasError = true
          continue
        }
        if (file.size > MAX_FILE_SIZE) {
          onError(`El archivo "${file.name}" supera el límite de 10 MB.`)
          hasError = true
          continue
        }
        if (files.length + valid.length >= MAX_FILES) {
          if (!hasError) onError(`Máximo ${MAX_FILES} imágenes permitidas.`)
          break
        }
        valid.push({ file, previewUrl: URL.createObjectURL(file) })
      }

      if (valid.length) setFiles((prev) => [...prev, ...valid])
    },
    [files.length, onError],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles],
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleDetect = async () => {
    if (!files.length) {
      onError('Agrega al menos una imagen para detectar.')
      return
    }

    setLoading(true)
    setDetected(null)

    try {
      const formData = new FormData()
      files.forEach((pf) => formData.append('images', pf.file))

      const res = await fetch('/api/paint-visualizer/detect-car', {
        method: 'POST',
        body: formData,
      })

      const data = (await res.json()) as DetectedData & { error?: string }

      if (!res.ok || data.error) {
        onError(data.error ?? 'No se pudo detectar el vehículo. Intenta de nuevo.')
        return
      }

      setDetected(data)
      setEditMake(data.make)
      setEditModel(data.model)
      setEditYear(String(data.year))
      setEditBodyType(data.body_type)
    } catch {
      onError('Error de conexión al detectar el vehículo.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (!detected) return
    onDetected({
      make: editMake,
      model: editModel,
      year: parseInt(editYear, 10) || detected.year,
      body_type: (editBodyType as CarBodyType) || detected.body_type,
      color_hex: detected.color_hex,
      stub: detected.stub,
    })
  }

  const INPUT_CLASS =
    'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition-colors'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Subir fotos del vehículo</h2>
        <p className="text-sm text-gray-500">
          Nuestra IA analizará las imágenes para detectar marca, modelo, año, tipo de carrocería y
          color actual
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-yellow-400 bg-yellow-400/5'
            : 'border-gray-700 hover:border-yellow-400 bg-gray-800/30 hover:bg-gray-800/50'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center">
          <Upload className="w-6 h-6 text-gray-500" />
        </div>
        <div>
          <p className="text-white font-medium mb-1">Arrastra o haz clic para seleccionar</p>
          <p className="text-sm text-gray-500">JPG, PNG, WebP · máx. 5 imágenes · 10 MB c/u</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {files.map((pf, i) => (
            <div key={i} className="relative group aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pf.previewUrl}
                alt={pf.file.name}
                className="w-full h-full object-cover rounded-xl border border-gray-700"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(i)
                }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-900/80 border border-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI Note */}
      <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/15 rounded-xl p-4">
        <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-400 mb-0.5">
            Detección con IA (OpenAI Vision)
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Con 2–5 fotos desde distintos ángulos, la IA detectará automáticamente las
            especificaciones del vehículo y pre-llenará el formulario por ti.
          </p>
        </div>
      </div>

      {/* Detect button */}
      {!detected && (
        <button
          type="button"
          onClick={handleDetect}
          disabled={loading || files.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/30 disabled:cursor-not-allowed text-gray-950 disabled:text-gray-950/40 rounded-xl py-3.5 px-6 font-medium text-sm transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando con IA…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Detectar con IA
            </>
          )}
        </button>
      )}

      {/* Detection results */}
      {detected && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Vehículo detectado</span>
            {detected.stub ? (
              <span className="ml-auto text-xs bg-yellow-400/15 text-yellow-400 border border-yellow-400/20 rounded-full px-2.5 py-0.5">
                Modo demo
              </span>
            ) : (
              <span className="ml-auto text-xs bg-green-400/10 text-green-400 border border-green-400/20 rounded-full px-2.5 py-0.5">
                Detectado por IA
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Marca</label>
              <input
                type="text"
                value={editMake}
                onChange={(e) => setEditMake(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Modelo</label>
              <input
                type="text"
                value={editModel}
                onChange={(e) => setEditModel(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Año</label>
              <select
                value={editYear}
                onChange={(e) => setEditYear(e.target.value)}
                className={INPUT_CLASS}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Carrocería</label>
              <select
                value={editBodyType}
                onChange={(e) => setEditBodyType(e.target.value as CarBodyType)}
                className={INPUT_CLASS}
              >
                {CAR_BODY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Color detectado</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg border border-gray-700 flex-shrink-0"
                  style={{ backgroundColor: detected.color_hex }}
                />
                <span className="text-sm text-gray-300 font-mono">{detected.color_hex}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDetected(null)}
              className="flex-1 py-2.5 px-4 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
            >
              Volver a detectar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-gray-950 rounded-xl text-sm font-medium transition-colors"
            >
              Confirmar y continuar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
