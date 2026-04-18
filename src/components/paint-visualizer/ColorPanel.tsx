'use client'

import { useState } from 'react'
import { PRESET_COLORS } from '@/lib/paint/palette'
import type { PaintFinish } from '@/lib/types/database'

interface ColorPanelProps {
  selectedColor: string
  selectedFinish: PaintFinish
  onColorChange: (hex: string) => void
  onFinishChange: (finish: PaintFinish) => void
}

const FINISH_LABELS: Record<PaintFinish, string> = {
  solid: 'Sólido',
  metallic: 'Metálico',
  pearl: 'Perlado',
  matte: 'Mate',
}

export default function ColorPanel({ selectedColor, selectedFinish, onColorChange, onFinishChange }: ColorPanelProps) {
  const [hexInput, setHexInput] = useState(selectedColor)
  const [activeFinishFilter, setActiveFinishFilter] = useState<PaintFinish | 'all'>('all')

  const filteredColors = activeFinishFilter === 'all'
    ? PRESET_COLORS
    : PRESET_COLORS.filter((c) => c.finish === activeFinishFilter)

  const handleHexSubmit = () => {
    const clean = hexInput.startsWith('#') ? hexInput : `#${hexInput}`
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      onColorChange(clean)
    }
  }

  return (
    <div className="space-y-4">
      {/* Finish selector */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Acabado</p>
        <div className="grid grid-cols-4 gap-1.5">
          {(['solid', 'metallic', 'pearl', 'matte'] as PaintFinish[]).map((finish) => (
            <button
              key={finish}
              onClick={() => onFinishChange(finish)}
              className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                selectedFinish === finish
                  ? 'bg-yellow-400 text-gray-950 border-yellow-400'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white hover:border-gray-600'
              }`}
            >
              {FINISH_LABELS[finish]}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker + hex input */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Color personalizado</p>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => { onColorChange(e.target.value); setHexInput(e.target.value) }}
              className="w-12 h-10 rounded-lg cursor-pointer border border-gray-700 bg-transparent p-0.5"
            />
          </div>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={handleHexSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleHexSubmit()}
            placeholder="#C0392B"
            maxLength={7}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20"
          />
          <div
            className="w-10 h-10 rounded-lg border border-gray-700 flex-shrink-0"
            style={{ backgroundColor: selectedColor }}
          />
        </div>
      </div>

      {/* Preset palette */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Paleta PPG / Sikkens</p>
          <div className="flex gap-1">
            {(['all', 'solid', 'metallic', 'pearl', 'matte'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFinishFilter(f)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                  activeFinishFilter === f
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-gray-700 text-gray-500 hover:text-gray-300'
                }`}
              >
                {f === 'all' ? 'Todo' : FINISH_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {filteredColors.map((color) => (
            <button
              key={color.hex}
              onClick={() => { onColorChange(color.hex); setHexInput(color.hex); onFinishChange(color.finish) }}
              title={`${color.name}${color.code ? ` (${color.code})` : ''}`}
              className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                selectedColor === color.hex
                  ? 'border-yellow-400 scale-110 shadow-sm shadow-yellow-400/30'
                  : 'border-transparent hover:border-gray-500'
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
        {/* Selected color name */}
        {(() => {
          const found = PRESET_COLORS.find((c) => c.hex === selectedColor)
          return found ? (
            <p className="text-xs text-gray-500">
              {found.name}{found.code && <span className="ml-1 font-mono text-gray-600">{found.code}</span>}
            </p>
          ) : null
        })()}
      </div>
    </div>
  )
}
