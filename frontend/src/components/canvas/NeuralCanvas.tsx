import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useOSStore } from '../../store/useOSStore'

function NeuralParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const isThinking = useOSStore((state) => state.isThinking)
  
  // Generate random particle coordinates
  const particles = useMemo(() => {
    const coords = new Float32Array(300 * 3)
    for (let i = 0; i < 300; i++) {
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2)
      const phi = THREE.MathUtils.randFloat(0, Math.PI)
      const r = THREE.MathUtils.randFloat(3, 8)
      
      coords[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      coords[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      coords[i * 3 + 2] = r * Math.cos(phi)
    }
    return coords
  }, [])

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Rotate standard background particles
      const speed = isThinking ? 1.2 : 0.15
      pointsRef.current.rotation.y += speed * delta
      pointsRef.current.rotation.x += (speed / 2) * delta
      
      // Pulse scale if thinking
      if (isThinking) {
        const pulse = Math.sin(state.clock.getElapsedTime() * 10) * 0.05 + 1.05
        pointsRef.current.scale.set(pulse, pulse, pulse)
      } else {
        pointsRef.current.scale.set(1, 1, 1)
      }
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={pointsRef} positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#a855f7"
          size={0.12}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  )
}

export function NeuralCanvas() {
  return (
    <div className="absolute inset-0 -z-10 bg-transparent pointer-events-none opacity-50">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <NeuralParticles />
      </Canvas>
    </div>
  )
}
