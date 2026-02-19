import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Float,
  Text,
} from "@react-three/drei";
import * as THREE from "three";

/* ─── Orbiting Skill Node ─── */
const SkillNode = ({ position, label, color, speed = 1 }) => {
  const meshRef = useRef();
  const initialPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * speed;
      meshRef.current.position.x =
        initialPos.x * Math.cos(t) - initialPos.z * Math.sin(t);
      meshRef.current.position.z =
        initialPos.x * Math.sin(t) + initialPos.z * Math.cos(t);
      meshRef.current.position.y = initialPos.y + Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Sphere args={[0.15, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.12}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
};

/* ─── Connection Lines Between Nodes ─── */
const ConnectionLines = () => {
  const linesRef = useRef();

  useFrame(({ clock }) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      p.push(
        new THREE.Vector3(
          Math.cos(angle) * 2.5,
          Math.sin(angle * 3) * 0.5,
          Math.sin(angle) * 2.5,
        ),
      );
    }
    return p;
  }, []);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <group ref={linesRef}>
      <line geometry={geometry}>
        <lineBasicMaterial color="#00BFFF" transparent opacity={0.2} />
      </line>
    </group>
  );
};

/* ─── Floating Particles ─── */
const Particles = ({ count = 200 }) => {
  const meshRef = useRef();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
        ],
        size: Math.random() * 0.02 + 0.005,
      });
    }
    return temp;
  }, [count]);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    particles.forEach((p, i) => {
      pos[i * 3] = p.position[0];
      pos[i * 3 + 1] = p.position[1];
      pos[i * 3 + 2] = p.position[2];
    });
    return pos;
  }, [particles, count]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.02;
      meshRef.current.rotation.x =
        Math.sin(clock.getElapsedTime() * 0.01) * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00BFFF"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

/* ─── Central Nexus Orb ─── */
const NexusOrb = () => {
  const orbRef = useRef();

  useFrame(({ clock }) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      orbRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={orbRef}>
        {/* Core orb */}
        <Sphere args={[1, 64, 64]}>
          <MeshDistortMaterial
            color="#0A192F"
            emissive="#00BFFF"
            emissiveIntensity={0.15}
            metalness={0.9}
            roughness={0.1}
            distort={0.3}
            speed={2}
            transparent
            opacity={0.85}
          />
        </Sphere>

        {/* Inner glow */}
        <Sphere args={[0.95, 32, 32]}>
          <meshStandardMaterial
            color="#00BFFF"
            emissive="#A020F0"
            emissiveIntensity={0.3}
            transparent
            opacity={0.1}
            wireframe
          />
        </Sphere>

        {/* Outer ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshStandardMaterial
            color="#00BFFF"
            emissive="#00BFFF"
            emissiveIntensity={0.5}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Second ring */}
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[1.8, 0.015, 16, 100]} />
          <meshStandardMaterial
            color="#A020F0"
            emissive="#A020F0"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
};

/* ─── Main 3D Scene ─── */
const NexusScene = () => {
  const skillNodes = [
    { position: [2, 0.5, 1], label: "React", color: "#61DAFB", speed: 0.5 },
    { position: [-1.5, 1, 2], label: "Three.js", color: "#00BFFF", speed: 0.7 },
    { position: [1, -1, -2], label: "Node.js", color: "#68A063", speed: 0.4 },
    { position: [-2, -0.5, -1], label: "Design", color: "#A020F0", speed: 0.6 },
    { position: [0, 2, 1.5], label: "Python", color: "#FFD43B", speed: 0.3 },
    {
      position: [1.5, -1.5, 1.5],
      label: "AI/ML",
      color: "#FF6B6B",
      speed: 0.45,
    },
  ];

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00BFFF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#A020F0" />
      <spotLight
        position={[0, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#FFFFFF"
      />

      {/* Central Orb */}
      <NexusOrb />

      {/* Skill Nodes */}
      {skillNodes.map((node, i) => (
        <SkillNode key={i} {...node} />
      ))}

      {/* Connection Lines */}
      <ConnectionLines />

      {/* Particles */}
      <Particles count={150} />

      {/* Controls */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
};

export default NexusScene;
