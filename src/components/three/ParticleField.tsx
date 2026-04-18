"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 500, color = "#10b981" }: { count?: number; color?: string }) {
  const meshRef = useRef<THREE.Points>(null!);
  const mouseRef = useRef({ x: 0, y: 0 });

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    return { positions, velocities, sizes };
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3] += particles.velocities[i3] + Math.sin(time * 0.3 + i * 0.1) * 0.002;
      positions[i3 + 1] += particles.velocities[i3 + 1] + Math.cos(time * 0.2 + i * 0.1) * 0.002;
      positions[i3 + 2] += particles.velocities[i3 + 2];

      // Wrap around
      if (Math.abs(positions[i3]) > 10) positions[i3] *= -0.9;
      if (Math.abs(positions[i3 + 1]) > 10) positions[i3 + 1] *= -0.9;
      if (Math.abs(positions[i3 + 2]) > 5) positions[i3 + 2] *= -0.9;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.rotation.y = time * 0.02;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particles.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.03}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingGrid() {
  const gridRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!gridRef.current) return;
    gridRef.current.rotation.x = Math.PI * 0.5 + Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    gridRef.current.position.y = -3 + Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
  });

  return (
    <group ref={gridRef}>
      <gridHelper args={[30, 30, "#10b981", "#10b981"]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.02} />
      </mesh>
    </group>
  );
}

export default function ParticleField({
  className = "",
  particleColor = "#10b981",
  particleCount = 400,
}: {
  className?: string;
  particleColor?: string;
  particleCount?: number;
}) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <Particles count={particleCount} color={particleColor} />
        <FloatingGrid />
      </Canvas>
    </div>
  );
}
