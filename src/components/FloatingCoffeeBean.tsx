import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

function CoffeeBean() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef} scale={2.5}>
        {/* Coffee bean shape - elongated sphere with crease */}
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#3B3030"
          roughness={0.3}
          metalness={0.2}
          distort={0.15}
          speed={2}
          envMapIntensity={0.8}
        />
      </mesh>
      
      {/* Inner glow sphere */}
      <mesh scale={2.6}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#C9A97F"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </Float>
  );
}

function GlowingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 100;
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#C9A97F"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function FloatingCoffeeBean() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#E6D2AE" />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#C9A97F" />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#C9A97F" />
        
        <CoffeeBean />
        <GlowingParticles />
        
        <Environment preset="night" />
      </Canvas>
      
      {/* Ambient glow overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full animate-glow-pulse"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(34 60% 70% / 0.1) 0%, transparent 70%)'
          }}
        />
      </div>
    </div>
  );
}