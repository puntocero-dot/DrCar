// Real mesh names extracted from ferrari.glb (three.js example model)
export const FERRARI_PART_MAP: Record<string, string> = {
  // Body / Carrocería
  body:               'body',
  metal:              'body',
  blue:               'body',

  // Wheels / Rines
  rim_fl:             'wheels',
  rim_fr:             'wheels',
  rim_rl:             'wheels',
  rim_rr:             'wheels',

  // Bumpers (plastic exterior pieces)
  plastic_gray:       'bumper_front',

  // Trim / Detalles
  trim:               'trim',
  yellow_trim:        'trim',
  carbon_fibre_trim:  'trim',
  'carbon fibre':     'trim',
  chrome:             'trim',
}

export const PAINTABLE_PARTS = ['body', 'wheels', 'bumper_front', 'trim'] as const
export type PaintablePart = typeof PAINTABLE_PARTS[number]

export const PART_LABELS: Record<PaintablePart, string> = {
  body:         'Carrocería',
  wheels:       'Rines',
  bumper_front: 'Bumpers',
  trim:         'Detalles',
}

export const PART_ICONS: Record<PaintablePart, string> = {
  body:         '🚗',
  wheels:       '⚙️',
  bumper_front: '🔲',
  trim:         '✨',
}

export const DEFAULT_PART_CONFIGS = {
  body:         { color: '#C0392B', finish: 'metallic' as const, metalness: 0.8, roughness: 0.2, clearcoat: 1.0 },
  wheels:       { color: '#1A1A1A', finish: 'metallic' as const, metalness: 0.9, roughness: 0.3, clearcoat: 0.5 },
  bumper_front: { color: '#1C1C1C', finish: 'solid'    as const, metalness: 0.0, roughness: 0.6, clearcoat: 0.2 },
  trim:         { color: '#FFD700', finish: 'metallic' as const, metalness: 1.0, roughness: 0.1, clearcoat: 0.8 },
} as const
