'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function Room3D({ type }: { type: 'current' | 'new' }) {
  const isCurrent = type === 'current';
  const roomSize = isCurrent ? { w: 3.6, h: 2.4, d: 4.8 } : { w: 3.288, h: 3.0, d: 5.352 };
  const furnitureData = [
    { label: '장롱', position: [-1.2, 1.1, -2], size: [0.6, 2.2, 2.4], color: '#3B82F6', warning: !isCurrent },
    { label: '퀸 침대', position: [0.5, 0.25, 0], size: [2.0, 0.5, 1.6], color: '#10B981', warning: false },
    { label: '3인 소파', position: [0, 0.425, 2], size: [0.9, 0.85, 2.2], color: '#F59E0B', warning: false },
  ];

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomSize.w, roomSize.d]} />
        <meshStandardMaterial color="#2A3A4A" />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(roomSize.w, roomSize.h, roomSize.d)]} />
        <lineBasicMaterial color={isCurrent ? '#A0B0C0' : '#2ECC71'} />
      </lineSegments>
      {furnitureData.map((f) => (
        <mesh key={f.label} position={f.position as [number, number, number]}>
          <boxGeometry args={f.size as [number, number, number]} />
          <meshStandardMaterial
            color={f.warning && !isCurrent ? '#E74C3C' : f.color}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Fixed3DView() {
  return (
    <div className="bg-[#1A2733] rounded-xl overflow-hidden border border-[#2A3A4A]">
      <div className="p-3 border-b border-[#2A3A4A] flex items-center justify-between">
        <span className="text-[#A0B0C0] text-sm font-medium">3D 뷰 — 현재 집 vs 새 집</span>
        <span className="text-[#A0B0C0] text-xs">드래그로 회전 · 스크롤로 줌</span>
      </div>
      <div className="aspect-[2/1] min-h-[280px] bg-[#0F1923]">
        <Canvas camera={{ position: [6, 4, 8], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, 10, -10]} intensity={0.3} />
          <group position={[-3, 0, 0]}>
            <Room3D type="current" />
          </group>
          <group position={[3, 0, 0]}>
            <Room3D type="new" />
          </group>
          <OrbitControls enablePan={false} minDistance={4} maxDistance={15} />
        </Canvas>
      </div>
    </div>
  );
}
