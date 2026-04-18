"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Ring } from "@react-three/drei";
import * as THREE from "three";

function RotatingRings() {
  const group1Ref = useRef<THREE.Group>(null!);
  const group2Ref = useRef<THREE.Group>(null!);
  const group3Ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group1Ref.current) {
      group1Ref.current.rotation.x = t * 0.3;
      group1Ref.current.rotation.y = t * 0.2;
    }
    if (group2Ref.current) {
      group2Ref.current.rotation.x = t * -0.2;
      group2Ref.current.rotation.z = t * 0.3;
    }
    if (group3Ref.current) {
      group3Ref.current.rotation.y = t * 0.4;
      group3Ref.current.rotation.z = t * -0.15;
    }
  });

  return (
    <>
      <group ref={group1Ref}>
        <Ring args={[1.8, 1.85, 64]}>
          <meshBasicMaterial color="#10b981" transparent opacity={0.4} side={THREE.DoubleSide} />
        </Ring>
      </group>
      <group ref={group2Ref}>
        <Ring args={[2.2, 2.24, 64]}>
          <meshBasicMaterial color="#f97316" transparent opacity={0.3} side={THREE.DoubleSide} />
        </Ring>
      </group>
      <group ref={group3Ref}>
        <Ring args={[2.6, 2.63, 64]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} />
        </Ring>
      </group>
    </>
  );
}

function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#0a0a0a"
          emissive="#10b981"
          emissiveIntensity={0.15}
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
        />
      </Sphere>
    </Float>
  );
}

function GlowLight() {
  return (
    <>
      <pointLight position={[3, 3, 3]} intensity={1} color="#10b981" />
      <pointLight position={[-3, -3, 2]} intensity={0.5} color="#f97316" />
      <pointLight position={[0, 0, 5]} intensity={0.3} color="#ffffff" />
      <ambientLight intensity={0.1} />
    </>
  );
}

export default function CarShowcase({ className = "" }: { className?: string }) {
  return (
    <div className={`${className}`} style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <GlowLight />
        <CoreSphere />
        <RotatingRings />
      </Canvas>
    </div>
  );
}
