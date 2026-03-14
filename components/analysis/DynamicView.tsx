'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAnalysis } from '@/hooks/use-analysis';
import { getMoveData } from '@/lib/api';
import { defaultMoveData } from '@/lib/store';

function Room3D({ type, highlightWarnings }: { type: 'current' | 'new'; highlightWarnings?: boolean }) {
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
            color={highlightWarnings && f.warning && !isCurrent ? '#E74C3C' : f.color}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

export function DynamicView({ moduleId }: { moduleId: number }) {
  const { ladderTruck, pathAnalysis } = useAnalysis();
  const [moveData, setMoveData] = useState(defaultMoveData);
  useEffect(() => { getMoveData().then(setMoveData).catch(() => {}); }, []);

  const { origin, destination } = moveData;
  const frontDoorWidth = moveData.origin.frontDoorSize?.w ?? 900;

  // 모듈 1: 사다리차 — 층수 + 건물 다이어그램
  if (moduleId === 1) {
    const hasLadder = ladderTruck.items.some(i => i.needsLadder);
    return (
      <div className="h-full bg-[#1A2733] rounded-lg border border-[#2A3A4A] overflow-hidden">
        <div className="p-2 border-b border-[#2A3A4A] text-[#A0B0C0] text-xs">사다리차 필요 건물</div>
        <div className="h-[calc(100%-28px)] p-3">
          <svg viewBox="0 0 400 180" className="w-full h-full">
            <defs>
              <marker id="arr1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#E74C3C" />
              </marker>
            </defs>
            <rect width="400" height="180" fill="#0F1923" />
            <g transform="translate(40, 20)">
              <text x="50" y="12" textAnchor="middle" fill="#A0B0C0" fontSize="10">출발 {origin.floor}층</text>
              {[5,4,3,2,1].map((f, i) => (
                <rect key={f} x="5" y={18+i*28} width="90" height="24" fill={f===origin.floor?'#F5A623':'#1A2733'} stroke={f===origin.floor?'#F5A623':'#2A3A4A'} strokeWidth="1" rx="2" />
              ))}
              {hasLadder && <path d="M 55 90 L 55 50 L 200 50" fill="none" stroke="#E74C3C" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#arr1)" />}
            </g>
            <g transform="translate(160, 120)">
              <rect x="0" y="0" width="80" height="35" fill="#F5A623" rx="3" />
              <text x="40" y="22" textAnchor="middle" fill="#0F1923" fontSize="9" fontWeight="bold">트럭</text>
            </g>
            <g transform="translate(310, 20)">
              <text x="50" y="12" textAnchor="middle" fill="#A0B0C0" fontSize="10">도착 {destination.floor}층</text>
              {[5,4,3,2,1].map((f, i) => (
                <rect key={f} x="5" y={18+i*28} width="90" height="24" fill={f===destination.floor?'#2ECC71':'#1A2733'} stroke={f===destination.floor?'#2ECC71':'#2A3A4A'} strokeWidth="1" rx="2" />
              ))}
              {hasLadder && <path d="M 345 90 L 345 50 L 200 50" fill="none" stroke="#E74C3C" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#arr1)" />}
            </g>
          </svg>
        </div>
      </div>
    );
  }

  // 모듈 2: 경로 통과 — 현관문 기준 막대
  if (moduleId === 2) {
    return (
      <div className="h-full bg-[#1A2733] rounded-lg border border-[#2A3A4A] overflow-hidden">
        <div className="p-2 border-b border-[#2A3A4A] text-[#A0B0C0] text-xs">가구 폭 vs 현관문 {frontDoorWidth}mm</div>
        <div className="h-[calc(100%-28px)] p-3">
          <svg viewBox="0 0 350 160" className="w-full h-full">
            <rect width="350" height="160" fill="#0F1923" />
            <line x1="70" y1="25" x2={70 + frontDoorWidth/6} y2="25" stroke="#FFFFFF" strokeWidth="2" />
            <text x="72" y="18" fill="#FFFFFF" fontSize="9">기준 {frontDoorWidth}mm</text>
            {pathAnalysis.map((item, i) => {
              const y = 45 + i * 22;
              const w = Math.min(item.dimensions.w / 5, 200);
              const over = item.dimensions.w > frontDoorWidth;
              return (
                <g key={item.label}>
                  <text x="5" y={y+14} fill="#A0B0C0" fontSize="10">{item.label}</text>
                  <rect x="70" y={y} width={w} height="16" fill={over ? '#E74C3C' : '#2ECC71'} rx="2" />
                  <text x={75+w} y={y+12} fill={over ? '#E74C3C' : '#2ECC71'} fontSize="9">{item.dimensions.w}mm {over ? '✕' : '✓'}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }

  // 모듈 3: 배치도 — 2D 평면도
  if (moduleId === 3) {
    return (
      <div className="h-full bg-[#1A2733] rounded-lg border border-[#2A3A4A] overflow-hidden">
        <div className="p-2 border-b border-[#2A3A4A] text-[#A0B0C0] text-xs">새 집 평면도 (배치 예시)</div>
        <div className="h-[calc(100%-28px)] p-2">
          <svg viewBox="0 0 200 140" className="w-full h-full">
            <rect x="20" y="20" width="160" height="100" fill="#2A3A4A" stroke="#A0B0C0" strokeWidth="1" rx="2" />
            <rect x="25" y="25" width="45" height="30" fill="#3B82F6" opacity="0.8" rx="1" />
            <text x="47" y="42" textAnchor="middle" fill="#fff" fontSize="8">장롱</text>
            <rect x="80" y="50" width="50" height="35" fill="#10B981" opacity="0.8" rx="1" />
            <text x="105" y="68" textAnchor="middle" fill="#fff" fontSize="8">침대</text>
            <rect x="50" y="90" width="60" height="25" fill="#F59E0B" opacity="0.8" rx="1" />
            <text x="80" y="105" textAnchor="middle" fill="#fff" fontSize="8">소파</text>
            <rect x="120" y="25" width="25" height="35" fill="#8B5CF6" opacity="0.8" rx="1" />
            <text x="132" y="44" textAnchor="middle" fill="#fff" fontSize="7">냉장고</text>
          </svg>
        </div>
      </div>
    );
  }

  // 모듈 4: 양쪽 집 비교 — 3D
  return (
    <div className="h-full bg-[#1A2733] rounded-lg border border-[#2A3A4A] overflow-hidden">
      <div className="p-2 border-b border-[#2A3A4A] text-[#A0B0C0] text-xs">3D — 현재 집 vs 새 집</div>
      <div className="h-[calc(100%-28px)] bg-[#0F1923]">
        <Canvas camera={{ position: [5, 3, 6], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[8, 8, 8]} intensity={1} />
          <group position={[-2.5, 0, 0]}>
            <Room3D type="current" />
          </group>
          <group position={[2.5, 0, 0]}>
            <Room3D type="new" highlightWarnings />
          </group>
          <OrbitControls enablePan={false} minDistance={3} maxDistance={12} />
        </Canvas>
      </div>
    </div>
  );
}
