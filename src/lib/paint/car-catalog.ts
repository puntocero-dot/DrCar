import { FERRARI_PART_MAP, PAINTABLE_PARTS } from './ferrari-parts'
import type { PaintablePart } from './ferrari-parts'
import type { CarBodyType } from '@/lib/types/database'

export interface CarModel {
  id: string
  name: string
  path: string
  bodyType: CarBodyType
  partMap: Record<string, string>
  paintableParts: readonly PaintablePart[]
  scale: number
  position: [number, number, number]
}

const KENNEY_PART_MAP: Record<string, string> = {
  body:                'body',
  spoiler:             'body',
  'wheel-front-right': 'wheels',
  'wheel-front-left':  'wheels',
  'wheel-back-right':  'wheels',
  'wheel-back-left':   'wheels',
  'wheel-back':        'wheels',
}

const KENNEY_PARTS: readonly PaintablePart[] = ['body', 'wheels']

export const CAR_CATALOG: CarModel[] = [
  {
    id:            'ferrari',
    name:          'Ferrari F40',
    path:          '/models/cars/ferrari.glb',
    bodyType:      'coupe',
    partMap:       FERRARI_PART_MAP,
    paintableParts: PAINTABLE_PARTS,
    scale:         1.2,
    position:      [0, -0.5, 0],
  },
  {
    id:            'sedan',
    name:          'Sedán',
    path:          '/models/cars/sedan.glb',
    bodyType:      'sedan',
    partMap:       KENNEY_PART_MAP,
    paintableParts: KENNEY_PARTS,
    scale:         2.8,
    position:      [0, -0.6, 0],
  },
  {
    id:            'sedan-sports',
    name:          'Sedán Sport',
    path:          '/models/cars/sedan-sports.glb',
    bodyType:      'sedan',
    partMap:       KENNEY_PART_MAP,
    paintableParts: KENNEY_PARTS,
    scale:         2.8,
    position:      [0, -0.6, 0],
  },
  {
    id:            'suv',
    name:          'SUV',
    path:          '/models/cars/suv.glb',
    bodyType:      'suv',
    partMap:       KENNEY_PART_MAP,
    paintableParts: KENNEY_PARTS,
    scale:         2.5,
    position:      [0, -0.6, 0],
  },
  {
    id:            'suv-luxury',
    name:          'SUV Luxury',
    path:          '/models/cars/suv-luxury.glb',
    bodyType:      'suv',
    partMap:       KENNEY_PART_MAP,
    paintableParts: KENNEY_PARTS,
    scale:         2.5,
    position:      [0, -0.6, 0],
  },
  {
    id:            'hatchback-sports',
    name:          'Hatchback',
    path:          '/models/cars/hatchback-sports.glb',
    bodyType:      'hatchback',
    partMap:       KENNEY_PART_MAP,
    paintableParts: KENNEY_PARTS,
    scale:         2.8,
    position:      [0, -0.6, 0],
  },
  {
    id:            'truck',
    name:          'Pickup',
    path:          '/models/cars/truck.glb',
    bodyType:      'pickup',
    partMap:       KENNEY_PART_MAP,
    paintableParts: KENNEY_PARTS,
    scale:         2.5,
    position:      [0, -0.6, 0],
  },
  {
    id:            'race',
    name:          'Race Car',
    path:          '/models/cars/race.glb',
    bodyType:      'coupe',
    partMap:       KENNEY_PART_MAP,
    paintableParts: KENNEY_PARTS,
    scale:         3.0,
    position:      [0, -0.6, 0],
  },
]

export function getCarById(id: string): CarModel | undefined {
  return CAR_CATALOG.find((c) => c.id === id)
}

export const DEFAULT_CAR_ID = 'ferrari'
