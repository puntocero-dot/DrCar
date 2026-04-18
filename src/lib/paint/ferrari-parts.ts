// Mapping of mesh names in ferrari.glb to our paint part system
export const FERRARI_PART_MAP: Record<string, string> = {
  body_0: 'body',
  body_1: 'body',
  glass: 'windows',
  wheel_fl: 'wheels',
  wheel_fr: 'wheels',
  wheel_rl: 'wheels',
  wheel_rr: 'wheels',
  details_0: 'trim',
}

// Parts that are paintable (user can select color)
export const PAINTABLE_PARTS = ['body', 'wheels', 'roof', 'bumper_front', 'bumper_rear'] as const
export type PaintablePart = typeof PAINTABLE_PARTS[number]

// Default material config per part type
export const DEFAULT_PART_CONFIGS = {
  body: { color: '#C0392B', finish: 'metallic' as const, metalness: 0.8, roughness: 0.2, clearcoat: 1.0 },
  wheels: { color: '#2C2C2C', finish: 'metallic' as const, metalness: 0.9, roughness: 0.3, clearcoat: 0.5 },
  roof: { color: '#C0392B', finish: 'metallic' as const, metalness: 0.8, roughness: 0.2, clearcoat: 1.0 },
  bumper_front: { color: '#C0392B', finish: 'metallic' as const, metalness: 0.8, roughness: 0.2, clearcoat: 1.0 },
  bumper_rear: { color: '#C0392B', finish: 'metallic' as const, metalness: 0.8, roughness: 0.2, clearcoat: 1.0 },
} as const
