'use client'

import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
} from '@react-three/drei'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'
import type { PaintConfig } from '@/lib/types/database'
import { FERRARI_PART_MAP } from '@/lib/paint/ferrari-parts'
import { createCarMaterial } from '@/lib/paint/material-utils'

// Point Draco decoder to local files (avoids CSP issues with gstatic.com)
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

useGLTF.setDecoderPath('/draco/')

interface CarModelProps {
  paintConfig: PaintConfig
  selectedPart: string | null
}

function CarModel({ paintConfig, selectedPart }: CarModelProps) {
  const { scene } = useGLTF('/models/cars/ferrari.glb')
  const materialsRef = useRef<Map<string, THREE.MeshPhysicalMaterial>>(new Map())

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const partGroup = FERRARI_PART_MAP[child.name]
      if (!partGroup) return

      const config = paintConfig[partGroup as keyof PaintConfig]
      if (!config) return

      const mat = createCarMaterial(config)

      if (partGroup === selectedPart) {
        mat.emissive = new THREE.Color('#facc15')
        mat.emissiveIntensity = 0.08
      }

      child.material = mat
      materialsRef.current.set(child.name, mat)
    })
  }, [scene, paintConfig, selectedPart])

  return <primitive object={scene} scale={1.2} position={[0, -0.5, 0]} />
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 1, 4]} />
      <meshStandardMaterial color="#374151" wireframe />
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
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        shadows
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#aaccff" />
        <pointLight position={[0, 3, 0]} intensity={0.5} color="#ffffee" />

        <Suspense fallback={<LoadingFallback />}>
          {/* Use local HDR file — avoids fetching from Google Storage CDN */}
          <Environment files="/hdri/venice_sunset_1k.hdr" background={false} />
          <CarModel paintConfig={paintConfig} selectedPart={selectedPart} />
          <ContactShadows
            position={[0, -0.95, 0]}
            opacity={0.6}
            scale={12}
            blur={2}
            far={3}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/cars/ferrari.glb')
