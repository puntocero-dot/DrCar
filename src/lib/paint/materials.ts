export const PAINT_FINISHES = ['solid', 'metallic', 'pearl', 'matte'] as const
export const CAR_BODY_TYPES = ['sedan', 'suv', 'hatchback', 'pickup', 'coupe', 'van', 'crossover'] as const

export const GLB_MODEL_MAP: Record<string, string> = {
  sedan: '/models/cars/sedan.glb',
  suv: '/models/cars/suv.glb',
  hatchback: '/models/cars/hatchback.glb',
  pickup: '/models/cars/pickup.glb',
  coupe: '/models/cars/coupe.glb',
  van: '/models/cars/van.glb',
  crossover: '/models/cars/crossover.glb',
}
