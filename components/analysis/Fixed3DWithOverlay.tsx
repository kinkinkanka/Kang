'use client';

import { useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAnalysis } from '@/hooks/use-analysis';
import { getMoveData } from '@/lib/api';
import { defaultMoveData } from '@/lib/store';

function WhiteBackground() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color('#ffffff');
  }, [scene]);
  return null;
}

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
        <meshStandardMaterial color="#636E72" />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(roomSize.w, roomSize.h, roomSize.d)]} />
        <lineBasicMaterial color={isCurrent ? '#636E72' : '#B2F2BB'} />
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

function OverlayLayer({ moduleId, origin, destination, ladderTruck, pathAnalysis, comparisonWarnings }: {
  moduleId: number;
  origin: { floor: number };
  destination: { floor: number };
  ladderTruck: { items: { needsLadder: boolean }[] };
  pathAnalysis: { label: string; dimensions: { w: number }; canPass: boolean }[];
  comparisonWarnings: { type: string; item: string }[];
}) {
  const frontDoorWidth = 900;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="w-full h-full max-w-2xl max-h-full p-4 flex flex-col justify-between">
        {moduleId === 1 && (
          <>
            <div className="flex justify-between">
              <div className="bg-[#FF7F50]/90 text-[#2D3436] px-3 py-1.5 rounded-lg text-sm font-bold">
                출발 {origin.floor}층
              </div>
              <div className="bg-[#E74C3C]/90 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                사다리차 {ladderTruck.items.filter(i => i.needsLadder).length}개
              </div>
              <div className="bg-[#B2F2BB]/90 text-[#2D3436] px-3 py-1.5 rounded-lg text-sm font-bold">
                도착 {destination.floor}층
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#E74C3C] animate-pulse" />
              <span className="text-[#E74C3C] text-xs font-medium">사다리차 필요 경로</span>
            </div>
          </>
        )}
        {moduleId === 2 && (
          <div className="bg-white/95 rounded-lg p-3 border border-[#2D3436]/20 self-start shadow-sm">
            <p className="text-[#636E72] text-xs mb-2">현관문 기준 {frontDoorWidth}mm</p>
            <div className="space-y-1">
              {pathAnalysis.slice(0, 3).map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.canPass ? 'bg-[#B2F2BB]' : 'bg-[#E74C3C]'}`} />
                  <span className="text-[#2D3436] text-xs">{item.label} {item.dimensions.w}mm</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {moduleId === 3 && (
          <div className="bg-[#FF7F50]/90 text-[#2D3436] px-4 py-2 rounded-lg text-sm font-bold self-center">
            배치도 — 가구 드래그로 배치
          </div>
        )}
        {moduleId === 4 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {comparisonWarnings.map((w, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  w.type === 'error' ? 'bg-[#E74C3C]/90 text-white' :
                  w.type === 'warning' ? 'bg-[#F39C12]/90 text-[#2D3436]' :
                  'bg-[#B2F2BB]/90 text-[#2D3436]'
                }`}
              >
                {w.type === 'error' ? '❌' : w.type === 'warning' ? '⚠️' : '✅'} {w.item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Fixed3DWithOverlay({ moduleId }: { moduleId: number }) {
  const { ladderTruck, pathAnalysis, comparisonWarnings } = useAnalysis();
  const [moveData, setMoveData] = useState(defaultMoveData);
  useEffect(() => { getMoveData().then(setMoveData).catch(() => {}); }, []);

  return (
    <div className="h-full bg-[#FFF5F1] rounded-lg border border-[#2D3436]/20 overflow-hidden relative">
      <div className="p-2 border-b border-[#2D3436]/20 flex items-center justify-between">
        <span className="text-[#636E72] text-xs">3D 뷰 — 현재 집 vs 새 집</span>
        <span className="text-[#636E72] text-[10px]">드래그 회전 · 스크롤 줌</span>
      </div>
      <div className="h-[calc(100%-28px)] bg-white relative">
        <Canvas camera={{ position: [5, 3, 6], fov: 50 }}>
          <WhiteBackground />
          <ambientLight intensity={0.5} />
          <pointLight position={[8, 8, 8]} intensity={1} />
          <group position={[-2.5, 0, 0]}>
            <Room3D type="current" />
          </group>
          <group position={[2.5, 0, 0]}>
            <Room3D type="new" highlightWarnings={moduleId === 4} />
          </group>
          <OrbitControls enablePan={false} minDistance={3} maxDistance={12} />
        </Canvas>
        <OverlayLayer
          moduleId={moduleId}
          origin={moveData.origin}
          destination={moveData.destination}
          ladderTruck={ladderTruck}
          pathAnalysis={pathAnalysis}
          comparisonWarnings={comparisonWarnings}
        />
      </div>
    </div>
  );
}
