import * as THREE from 'three'
import type { PartPaintConfig, PaintFinish } from '@/lib/types/database'

export function finishToMaterialProps(finish: PaintFinish): Partial<THREE.MeshPhysicalMaterialParameters> {
  switch (finish) {
    case 'solid':
      return { metalness: 0.0, roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.2 }
    case 'metallic':
      return { metalness: 0.8, roughness: 0.2, clearcoat: 1.0, clearcoatRoughness: 0.1 }
    case 'pearl':
      return { metalness: 0.3, roughness: 0.3, clearcoat: 1.0, clearcoatRoughness: 0.05, sheen: 0.5, sheenRoughness: 0.3 }
    case 'matte':
      return { metalness: 0.0, roughness: 0.9, clearcoat: 0.0, clearcoatRoughness: 1.0 }
    default:
      return { metalness: 0.5, roughness: 0.3, clearcoat: 0.5 }
  }
}

export function createCarMaterial(config: PartPaintConfig): THREE.MeshPhysicalMaterial {
  const finishProps = finishToMaterialProps(config.finish)
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(config.color),
    ...finishProps,
    // allow overrides
    ...(config.metalness !== undefined && { metalness: config.metalness }),
    ...(config.roughness !== undefined && { roughness: config.roughness }),
    ...(config.clearcoat !== undefined && { clearcoat: config.clearcoat }),
  })
}

export function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex)
}
