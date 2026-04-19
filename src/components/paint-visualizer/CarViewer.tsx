'use client'

import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { PaintConfig } from '@/lib/types/database'
import { FERRARI_PART_MAP } from '@/lib/paint/ferrari-parts'
import { finishToMaterialProps } from '@/lib/paint/material-utils'

useGLTF.setDecoderPath('/draco/')

function CarModel({ paintConfig, selectedPart }: { paintConfig: PaintConfig; selectedPart: string | null }) {
  const { scene } = useGLTF('/models/cars/ferrari.glb')
  // Cache materials so we mutate instead of recreate
  const matCache = useRef<Map<string, THREE.MeshPhysicalMaterial>>(new Map())

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const partGroup = FERRARI_PART_MAP[child.name]
      if (!partGroup) return

      const config = paintConfig[partGroup as keyof PaintConfig]
      if (!config) return

      // Reuse cached material or create once
      let mat = matCache.current.get(child.name)
      if (!mat) {
        mat = new THREE.MeshPhysicalMaterial()
        matCache.current.set(child.name, mat)
        child.material = mat
      }

      // Mutate in-place — no GC pressure, instant update
      mat.color.set(config.color)
      const props = finishToMaterialProps(config.finish)
      mat.metalness   = config.metalness  ?? props.metalness  ?? 0.5
      mat.roughness   = config.roughness  ?? props.roughness  ?? 0.3
      mat.clearcoat   = config.clearcoat  ?? props.clearcoat  ?? 0.5
      mat.clearcoatRoughness = (props.clearcoatRoughness ?? 0.1)

      // Highlight selected part with subtle yellow rim
      mat.emissive.set(partGroup === selectedPart ? '#facc15' : '#000000')
      mat.emissiveIntensity = partGroup === selectedPart ? 0.06 : 0

      mat.needsUpdate = true
    })
  }, [scene, paintConfig, selectedPart])

  return <primitive object={scene} scale={1.2} position={[0, -0.5, 0]} />
}

function Spinner() {
  return (
    <mesh>
      <boxGeometry args={[2, 1, 4]} />
      <meshStandardMaterial color="#1f2937" wireframe />
    </mesh>
  )
}

interface CarViewerProps {
  paintConfig: PaintConfig
  selectedPart: string | null
  className?: string
}

export default function CarViewer({ paintConfig, selectedPart, className = '' }: CarViewerProps) {
  return (
    <div className={`w-full h-full bg-gray-900 rounded-2xl overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [4, 2, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        shadows
        frameloop="demand"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#aaccff" />

        <Suspense fallback={<Spinner />}>
          <Environment files="/hdri/venice_sunset_1k.hdr" background={false} />
          <CarModel paintConfig={paintConfig} selectedPart={selectedPart} />
          <ContactShadows position={[0, -0.95, 0]} opacity={0.5} scale={12} blur={2} far={3} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.4}
        />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/cars/ferrari.glb')
