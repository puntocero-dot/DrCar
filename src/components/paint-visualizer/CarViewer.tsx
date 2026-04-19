'use client'

import { Suspense, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { PaintConfig } from '@/lib/types/database'
import type { CarModel } from '@/lib/paint/car-catalog'
import { CAR_CATALOG, DEFAULT_CAR_ID, getCarById } from '@/lib/paint/car-catalog'
import { finishToMaterialProps } from '@/lib/paint/material-utils'

useGLTF.setDecoderPath('/draco/')
// Preload all catalogue models up-front
CAR_CATALOG.forEach((car) => useGLTF.preload(car.path))

function CarModelMesh({
  car,
  paintConfig,
  selectedPart,
}: {
  car: CarModel
  paintConfig: PaintConfig
  selectedPart: string | null
}) {
  const { scene } = useGLTF(car.path)
  const matCache = useRef<Map<string, THREE.MeshPhysicalMaterial>>(new Map())

  useEffect(() => {
    matCache.current.clear()
  }, [car.path])

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const partGroup = car.partMap[child.name]
      if (!partGroup) return

      const config = paintConfig[partGroup as keyof PaintConfig]
      if (!config) return

      let mat = matCache.current.get(child.name)
      if (!mat) {
        mat = new THREE.MeshPhysicalMaterial()
        matCache.current.set(child.name, mat)
        child.material = mat
      }

      mat.color.set(config.color)
      const props = finishToMaterialProps(config.finish)
      mat.metalness          = config.metalness ?? props.metalness  ?? 0.5
      mat.roughness          = config.roughness  ?? props.roughness  ?? 0.3
      mat.clearcoat          = config.clearcoat  ?? props.clearcoat  ?? 0.5
      mat.clearcoatRoughness = props.clearcoatRoughness ?? 0.1

      mat.emissive.set(partGroup === selectedPart ? '#facc15' : '#000000')
      mat.emissiveIntensity = partGroup === selectedPart ? 0.06 : 0
      mat.needsUpdate = true
    })
  }, [scene, paintConfig, selectedPart, car])

  return <primitive object={scene} scale={car.scale} position={car.position} />
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
  carModelId?: string
  className?: string
}

export default function CarViewer({
  paintConfig,
  selectedPart,
  carModelId = DEFAULT_CAR_ID,
  className = '',
}: CarViewerProps) {
  const car = getCarById(carModelId) ?? getCarById(DEFAULT_CAR_ID)!

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
          <CarModelMesh car={car} paintConfig={paintConfig} selectedPart={selectedPart} />
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
