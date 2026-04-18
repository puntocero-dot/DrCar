'use client'

import React, { useState, useEffect } from 'react'
import { ChevronRight, Loader2 } from 'lucide-react'
import { CAR_BODY_TYPES } from '@/lib/paint/materials'
import type { CarBodyType } from '@/lib/types/database'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1990 + 1 }, (_, i) => CURRENT_YEAR - i)

const CAR_MAKES = [
  'Toyota', 'Honda', 'Chevrolet', 'Ford', 'Hyundai', 'Kia', 'Nissan',
  'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Mazda', 'Mitsubishi', 'Subaru',
]

export interface SpecFormData {
  clientName: string
  clientEmail: string
  clientPhone: string
  make: string
  model: string
  year: string
  bodyType: CarBodyType | ''
}

interface SpecFormProps {
  onSuccess: (sessionId: string) => void
  initialData?: Partial<SpecFormData>
}

const INPUT_CLASS =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition-colors'

const SELECT_CLASS =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition-colors appearance-none cursor-pointer'

export default function SpecForm({ onSuccess, initialData }: SpecFormProps) {
  const [clientName, setClientName] = useState(initialData?.clientName ?? '')
  const [clientEmail, setClientEmail] = useState(initialData?.clientEmail ?? '')
  const [clientPhone, setClientPhone] = useState(initialData?.clientPhone ?? '')
  const [make, setMake] = useState(initialData?.make ?? '')
  const [model, setModel] = useState(initialData?.model ?? '')
  const [year, setYear] = useState(initialData?.year ?? '')
  const [bodyType, setBodyType] = useState<CarBodyType | ''>(initialData?.bodyType ?? '')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Re-fill when initialData changes (e.g. after AI detection)
  useEffect(() => {
    if (!initialData) return
    if (initialData.clientName !== undefined) setClientName(initialData.clientName)
    if (initialData.clientEmail !== undefined) setClientEmail(initialData.clientEmail)
    if (initialData.clientPhone !== undefined) setClientPhone(initialData.clientPhone)
    if (initialData.make !== undefined) setMake(initialData.make)
    if (initialData.model !== undefined) setModel(initialData.model)
    if (initialData.year !== undefined) setYear(initialData.year)
    if (initialData.bodyType !== undefined) setBodyType(initialData.bodyType)
  }, [initialData])

  const validate = (): string | null => {
    if (!clientName.trim()) return 'El nombre completo es obligatorio.'
    if (!clientEmail.trim()) return 'El correo electrónico es obligatorio.'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) return 'El correo electrónico no es válido.'
    if (!bodyType) return 'El tipo de carrocería es obligatorio.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const validationError = validate()
    if (validationError) {
      setErrorMsg(validationError)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/paint-visualizer/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName.trim(),
          client_email: clientEmail.trim(),
          client_phone: clientPhone.trim() || undefined,
          car_make: make.trim() || undefined,
          car_model: model.trim() || undefined,
          car_year: year ? parseInt(year, 10) : undefined,
          car_body_type: bodyType || undefined,
        }),
      })

      const data = (await res.json()) as { session_id?: string; error?: string }

      if (!res.ok || !data.session_id) {
        setErrorMsg(data.error ?? 'No se pudo crear la sesión. Intenta de nuevo.')
        return
      }

      onSuccess(data.session_id)
    } catch {
      setErrorMsg('Error de conexión. Verifica tu red e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6"
      noValidate
    >
      {/* ── Client data ── */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Datos del cliente</h2>
        <p className="text-sm text-gray-500">
          Información de contacto para enviarte el enlace de visualización
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Nombre completo <span className="text-yellow-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej. Juan Pérez"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className={INPUT_CLASS}
            autoComplete="name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Correo electrónico <span className="text-yellow-400">*</span>
          </label>
          <input
            type="email"
            placeholder="juan@correo.com"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className={INPUT_CLASS}
            autoComplete="email"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Teléfono</label>
          <input
            type="tel"
            placeholder="+503 7000-0000"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className={INPUT_CLASS}
            autoComplete="tel"
          />
        </div>
      </div>

      {/* ── Vehicle data ── */}
      <div className="border-t border-gray-800 pt-6">
        <h2 className="text-lg font-semibold text-white mb-1">Datos del vehículo</h2>
        <p className="text-sm text-gray-500">Especificaciones del auto a visualizar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Make */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Marca</label>
          <input
            type="text"
            list="car-makes-list"
            placeholder="Ej. Toyota"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className={INPUT_CLASS}
          />
          <datalist id="car-makes-list">
            {CAR_MAKES.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Modelo</label>
          <input
            type="text"
            placeholder="Ej. Corolla"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Año</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Seleccionar</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Body type */}
        <div className="sm:col-span-3">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Tipo de carrocería <span className="text-yellow-400">*</span>
          </label>
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value as CarBodyType | '')}
            className={SELECT_CLASS}
          >
            <option value="">Seleccionar tipo</option>
            {CAR_BODY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/40 disabled:cursor-not-allowed text-gray-950 disabled:text-gray-950/50 rounded-xl py-3.5 px-6 font-medium text-sm transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando sesión…
            </>
          ) : (
            <>
              Iniciar visualización
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
