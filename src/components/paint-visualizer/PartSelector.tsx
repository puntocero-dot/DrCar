'use client'

import { PAINTABLE_PARTS, PART_LABELS, PART_ICONS, type PaintablePart } from '@/lib/paint/ferrari-parts'

interface PartSelectorProps {
  selectedPart: PaintablePart | null
  onSelect: (part: PaintablePart) => void
}

export default function PartSelector({ selectedPart, onSelect }: PartSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Seleccionar parte</p>
      <div className="flex flex-wrap gap-2">
        {PAINTABLE_PARTS.map((part) => (
          <button
            key={part}
            onClick={() => onSelect(part)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
              selectedPart === part
                ? 'bg-yellow-400 text-gray-950 border-yellow-400 shadow-sm shadow-yellow-400/20'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600 hover:text-white'
            }`}
          >
            <span>{PART_ICONS[part]}</span>
            {PART_LABELS[part]}
          </button>
        ))}
      </div>
    </div>
  )
}
