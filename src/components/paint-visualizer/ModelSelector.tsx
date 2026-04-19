'use client'

import { CAR_CATALOG } from '@/lib/paint/car-catalog'

const BODY_ICONS: Record<string, string> = {
  coupe:     '🏎️',
  sedan:     '🚗',
  suv:       '🚙',
  hatchback: '🚘',
  pickup:    '🛻',
  van:       '🚐',
  crossover: '🚙',
}

interface ModelSelectorProps {
  selectedModelId: string
  onSelect: (id: string) => void
}

export default function ModelSelector({ selectedModelId, onSelect }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Modelo</p>
      <div className="flex flex-wrap gap-2">
        {CAR_CATALOG.map((car) => (
          <button
            key={car.id}
            onClick={() => onSelect(car.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
              selectedModelId === car.id
                ? 'bg-yellow-400 text-gray-950 border-yellow-400 shadow-sm shadow-yellow-400/20'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600 hover:text-white'
            }`}
          >
            <span>{BODY_ICONS[car.bodyType] ?? '🚗'}</span>
            {car.name}
          </button>
        ))}
      </div>
    </div>
  )
}
