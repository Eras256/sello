'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Orbiting Particles ────────────────────────────────────────────────── */
function Particles({ count = 120 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const radius = 2.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.1 + Math.random() * 0.3;
      const size = 0.01 + Math.random() * 0.025;
      arr.push({ radius, theta, phi, speed, size, offset: Math.random() * Math.PI * 2 });
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      const angle = p.theta + t * p.speed;
      dummy.position.set(
        p.radius * Math.sin(p.phi) * Math.cos(angle),
        p.radius * Math.cos(p.phi) + Math.sin(t * 0.5 + p.offset) * 0.3,
        p.radius * Math.sin(p.phi) * Math.sin(angle)
      );
      const scale = p.size * (0.8 + 0.4 * Math.sin(t * 2 + p.offset));
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#818cf8" transparent opacity={0.5} />
    </instancedMesh>
  );
}

/* ─── Orbital Rings ─────────────────────────────────────────────────────── */
function OrbitalRing({ radius, speed, tilt, color }: {
  radius: number; speed: number; tilt: number; color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = tilt;
    ref.current.rotation.y = state.clock.elapsedTime * speed;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

/* ─── Glass Shield ──────────────────────────────────────────────────────── */
function GlassShield() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  // Shield shape — extruded rounded pentagon
  const shieldShape = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 1.1;
    const h = 1.4;
    const r = 0.15;

    shape.moveTo(0, h);
    shape.quadraticCurveTo(w * 0.1, h, w * 0.5, h * 0.7);
    shape.quadraticCurveTo(w, h * 0.5, w, h * 0.2);
    shape.quadraticCurveTo(w, -h * 0.05, w * 0.7, -h * 0.3);
    shape.lineTo(r, -h);
    shape.quadraticCurveTo(0, -h - r * 0.5, -r, -h);
    shape.lineTo(-w * 0.7, -h * 0.3);
    shape.quadraticCurveTo(-w, -h * 0.05, -w, h * 0.2);
    shape.quadraticCurveTo(-w, h * 0.5, -w * 0.5, h * 0.7);
    shape.quadraticCurveTo(-w * 0.1, h, 0, h);

    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.04,
    bevelSegments: 8,
    curveSegments: 32,
  }), []);

  return (
    <group ref={groupRef} position={[0, -0.6, 0]} scale={0.85}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Main glass shield */}
        <mesh position={[0, 0, -0.1]} castShadow>
          <extrudeGeometry args={[shieldShape, extrudeSettings]} />
          <MeshTransmissionMaterial
            backside
            thickness={0.4}
            roughness={0.1}
            transmission={0.95}
            chromaticAberration={0.3}
            anisotropy={0.5}
            distortion={0.2}
            distortionScale={0.3}
            temporalDistortion={0.1}
            ior={1.5}
            color="#6366f1"
          />
        </mesh>

        {/* Inner glow edge */}
        <mesh position={[0, 0, 0.05]}>
          <extrudeGeometry args={[shieldShape, { ...extrudeSettings, depth: 0.01, bevelThickness: 0.01, bevelSize: 0.01 }]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.08} />
        </mesh>

        <CheckMark />
      </Float>
    </group>
  );
}

/* ─── Checkmark Symbol ──────────────────────────────────────────────────── */
function CheckMark() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const pulse = 0.85 + 0.15 * Math.sin(state.clock.elapsedTime * 2);
    groupRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0.2]} rotation={[0, 0, 0]} scale={0.55}>
      {/* Short leg of check */}
      <mesh position={[-0.35, -0.1, 0]} rotation={[0, 0, Math.PI * 0.25]}>
        <boxGeometry args={[0.55, 0.12, 0.12]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      {/* Long leg of check */}
      <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, -Math.PI * 0.25]}>
        <boxGeometry args={[0.9, 0.12, 0.12]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ─── Ambient Grid Floor ────────────────────────────────────────────────── */
function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
      <planeGeometry args={[20, 20, 20, 20]} />
      <meshBasicMaterial
        color="#6366f1"
        transparent
        opacity={0.03}
        wireframe
      />
    </mesh>
  );
}

/* ─── Full 3D Scene ─────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#818cf8" />
      <pointLight position={[-5, 3, -5]} intensity={0.4} color="#8b5cf6" />
      <spotLight
        position={[0, 8, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={0.6}
        color="#6366f1"
      />

      <GlassShield />
      <Particles count={120} />

      <OrbitalRing radius={2.5} speed={0.2} tilt={0.3} color="#6366f1" />
      <OrbitalRing radius={3.0} speed={-0.15} tilt={-0.5} color="#8b5cf6" />
      <OrbitalRing radius={3.5} speed={0.1} tilt={0.8} color="#818cf8" />

      <GridFloor />

      <Environment preset="night" />
    </>
  );
}

/* ─── Exported Component ────────────────────────────────────────────────── */
export default function Hero3D() {
  return (
    <div
      id="hero-3d"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
