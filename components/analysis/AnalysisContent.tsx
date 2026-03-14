'use client';

import { useEffect, useState, useRef } from 'react';
import { useAnalysis } from '@/hooks/use-analysis';
import { getMoveData } from '@/lib/api';
import { defaultMoveData } from '@/lib/store';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Check, X, Share2, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface PlacedFurniture {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
}

const ROOM_WIDTH = 3288;
const ROOM_HEIGHT = 5352;
const SCALE = 0.08;

export function LadderTruckContent() {
  const { ladderTruck } = useAnalysis();
  const [moveData, setMoveData] = useState(defaultMoveData);
  useEffect(() => { getMoveData().then(setMoveData).catch(() => {}); }, []);

  const { items, needsCount, estimatedCost } = ladderTruck;
  const { origin, destination } = moveData;

  return (
    <div className="space-y-6">
      <div className="bg-[#1A2733] rounded-xl p-6 border-2 border-[#F5A623]">
        <div className="flex items-center gap-3 mb-2">
          <StatusBadge status="warning" size="lg" />
          <span className="text-xl font-bold text-white">사다리차 필요 — 가구 {needsCount}개</span>
        </div>
        <p className="text-[#A0B0C0]">
          예상 추가 비용: <span className="font-mono-numeric text-[#F5A623] font-bold text-lg">{estimatedCost.toLocaleString()}원</span>
        </p>
      </div>

      <div className="bg-[#1A2733] rounded-xl p-6 border border-[#2A3A4A]">
        <h3 className="text-white font-semibold mb-4">층수 다이어그램</h3>
        <div className="aspect-[2/1] bg-[#2A3A4A] rounded-lg overflow-hidden">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <rect width="400" height="200" fill="#2A3A4A" />
            <g transform="translate(50, 20)">
              <text x="50" y="15" textAnchor="middle" fill="#A0B0C0" fontSize="12">출발지 ({origin.floor}층)</text>
              {[...Array(5)].map((_, i) => {
                const fn = 5 - i;
                const active = fn === origin.floor;
                return <rect key={i} x="10" y={25 + i * 30} width="80" height="28" fill={active ? '#F5A623' : '#1A2733'} stroke={active ? '#F5A623' : '#2A3A4A'} strokeWidth="1" />;
              })}
            </g>
            <g transform="translate(250, 20)">
              <text x="50" y="15" textAnchor="middle" fill="#A0B0C0" fontSize="12">도착지 ({destination.floor}층)</text>
              {[...Array(5)].map((_, i) => {
                const fn = 5 - i;
                const active = fn === destination.floor;
                return <rect key={i} x="10" y={25 + i * 30} width="80" height="28" fill={active ? '#2ECC71' : '#1A2733'} stroke={active ? '#2ECC71' : '#2A3A4A'} strokeWidth="1" />;
              })}
            </g>
            <g transform="translate(175, 160)">
              <rect x="0" y="0" width="50" height="25" fill="#F5A623" rx="3" />
              <text x="25" y="15" textAnchor="middle" fill="#0F1923" fontSize="10" fontWeight="bold">트럭</text>
            </g>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.filter(i => i.needsLadder).map((item) => (
          <div key={item.label} className="bg-[#1A2733] rounded-xl p-4 border-2 border-[#E74C3C]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#E74C3C]/20 flex items-center justify-center"><X className="h-5 w-5 text-[#E74C3C]" /></div>
              <div>
                <h4 className="text-white font-semibold">{item.label}</h4>
                <p className="text-[#A0B0C0] text-sm">{item.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1A2733] rounded-xl p-4 border-2 border-[#2ECC71]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2ECC71]/20 flex items-center justify-center"><Check className="h-5 w-5 text-[#2ECC71]" /></div>
          <div>
            <h4 className="text-white font-semibold">정상 이동: {items.filter(i => !i.needsLadder).map(i => i.label).join(', ')}</h4>
            <p className="text-[#A0B0C0] text-sm">엘리베이터 이동 가능</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PathAnalysisContent() {
  const { pathAnalysis } = useAnalysis();
  const [moveData, setMoveData] = useState(defaultMoveData);
  useEffect(() => { getMoveData().then(setMoveData).catch(() => {}); }, []);

  const frontDoorWidth = moveData.origin.frontDoorSize.w;
  const warningItems = pathAnalysis.filter(i => !i.canPass);

  return (
    <div className="space-y-6">
      <div className="bg-[#1A2733] rounded-xl p-6 border-2 border-[#F5A623]">
        <div className="flex items-center gap-3">
          <StatusBadge status="warning" size="lg" />
          <span className="text-xl font-bold text-white">
            {warningItems.length}개 가구 주의 필요 ({warningItems.map(i => i.label).join(', ')})
          </span>
        </div>
      </div>

      <div className="bg-[#1A2733] rounded-xl p-6 border border-[#2A3A4A]">
        <h3 className="text-white font-semibold mb-4">경로 단면도 (현관문 {frontDoorWidth}mm)</h3>
        <div className="bg-[#2A3A4A] rounded-lg p-4 overflow-hidden">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            <rect width="400" height="200" fill="#2A3A4A" />
            {pathAnalysis.map((item, i) => {
              const y = 35 + i * 32;
              const barW = item.dimensions.w / 8;
              const over = item.dimensions.w > frontDoorWidth;
              return (
                <g key={item.label}>
                  <text x="10" y={y + 14} fill="#A0B0C0" fontSize="11">{item.label}</text>
                  <rect x="90" y={y} width={barW} height="22" fill={over ? '#E74C3C' : '#2ECC71'} rx="3" />
                  <text x={95 + barW} y={y + 15} fill={over ? '#E74C3C' : '#2ECC71'} fontSize="10" fontFamily="monospace">{item.dimensions.w}mm {over ? '✕' : '✓'}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="bg-[#1A2733] rounded-xl border border-[#2A3A4A] overflow-hidden">
        <h3 className="text-white font-semibold p-4 border-b border-[#2A3A4A]">통과 가능 여부</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A3A4A] bg-[#2A3A4A]/50">
                <th className="text-left text-[#A0B0C0] text-sm p-3">가구명</th>
                <th className="text-center text-[#A0B0C0] text-sm p-3">현관문</th>
                <th className="text-center text-[#A0B0C0] text-sm p-3">복도</th>
                <th className="text-center text-[#A0B0C0] text-sm p-3">엘리베이터</th>
                <th className="text-left text-[#A0B0C0] text-sm p-3">해결책</th>
              </tr>
            </thead>
            <tbody>
              {pathAnalysis.map((item) => (
                <tr key={item.label} className="border-b border-[#2A3A4A]">
                  <td className="p-3 text-white font-medium">{item.label}</td>
                  <td className="p-3 text-center">{item.frontDoor ? <Check className="h-5 w-5 text-[#2ECC71] mx-auto" /> : <X className="h-5 w-5 text-[#E74C3C] mx-auto" />}</td>
                  <td className="p-3 text-center">{item.hallway ? <Check className="h-5 w-5 text-[#2ECC71] mx-auto" /> : <X className="h-5 w-5 text-[#E74C3C] mx-auto" />}</td>
                  <td className="p-3 text-center">{item.elevator ? <Check className="h-5 w-5 text-[#2ECC71] mx-auto" /> : <X className="h-5 w-5 text-[#E74C3C] mx-auto" />}</td>
                  <td className="p-3">{item.solution ? <span className="px-2 py-1 rounded bg-[#F39C12]/20 text-[#F39C12] text-sm">{item.solution}</span> : <span className="text-[#A0B0C0]">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function FloorPlanContent() {
  const { truckLoading } = useAnalysis();
  const loadingItems = truckLoading.loadingItems;
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<PlacedFurniture[][]>([[]]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const availableFurniture = loadingItems.map((item) => ({
    label: item.label,
    width: item.dimensions.w * 1000,
    height: item.dimensions.d * 1000,
    color: item.color,
  }));

  const saveHistory = (s: PlacedFurniture[]) => setHistory((h) => [...h.slice(-19), s]);
  const undo = () => {
    if (history.length > 1) {
      const h = history.slice(0, -1);
      setHistory(h);
      setPlacedFurniture(h[h.length - 1] || []);
      setSelectedId(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('furniture');
    if (!raw || !canvasRef.current) return;
    const parsed = JSON.parse(raw);
    const rect = canvasRef.current.getBoundingClientRect();
    const xMm = (e.clientX - rect.left) / SCALE;
    const yMm = (e.clientY - rect.top) / SCALE;
    const w = parsed.width, h = parsed.height;
    const newF: PlacedFurniture = {
      id: Date.now().toString(),
      label: parsed.label,
      x: Math.max(0, Math.min(xMm - w / 2, ROOM_WIDTH - w)),
      y: Math.max(0, Math.min(yMm - h / 2, ROOM_HEIGHT - h)),
      width: w,
      height: h,
      rotation: 0,
      color: parsed.color,
    };
    const next = [...placedFurniture, newF];
    setPlacedFurniture(next);
    saveHistory(next);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('공유 링크가 복사되었습니다');
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1A2733] rounded-xl p-6 border-2 border-[#F5A623]">
        <div className="flex items-center gap-3">
          <StatusBadge status="pending" size="lg" />
          <span className="text-xl font-bold text-white">새 집 배치도를 작성하고 기사님과 공유하세요</span>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="w-40 shrink-0 bg-[#1A2733] rounded-xl p-4 border border-[#2A3A4A]">
          <p className="text-[#A0B0C0] text-sm mb-3">가구 드래그</p>
          {availableFurniture.map((f) => (
            <div
              key={f.label}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('furniture', JSON.stringify(f));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              className="flex items-center gap-2 p-2 mb-2 rounded-lg bg-[#2A3A4A] cursor-grab hover:bg-[#3A4A5A]"
            >
              <div className="w-4 h-4 rounded" style={{ backgroundColor: f.color }} />
              <span className="text-white text-sm">{f.label}</span>
            </div>
          ))}
        </div>

        <div
          ref={canvasRef}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex-1 min-h-[300px] bg-[#2A3A4A] rounded-xl border-2 border-dashed border-[#3A4A5A] relative overflow-hidden"
          style={{ width: ROOM_WIDTH * SCALE, height: ROOM_HEIGHT * SCALE, minWidth: 200, minHeight: 250 }}
        >
          {placedFurniture.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedId(selectedId === f.id ? null : f.id)}
              className={`absolute cursor-pointer rounded border-2 ${selectedId === f.id ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/50' : 'border-transparent'}`}
              style={{
                left: f.x * SCALE,
                top: f.y * SCALE,
                width: f.width * SCALE,
                height: f.height * SCALE,
                backgroundColor: f.color,
                transform: `rotate(${f.rotation}deg)`,
              }}
            >
              <span className="text-xs text-white font-medium p-1 block truncate">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={undo} variant="outline" className="min-h-[48px] border-[#2A3A4A] text-white hover:bg-[#1A2733]">
          <Undo2 className="h-5 w-5 mr-2" />
          되돌리기
        </Button>
        <Button onClick={handleShare} className="flex-1 min-h-[48px] bg-[#F5A623] text-[#0F1923] hover:bg-[#E09500]">
          <Share2 className="h-5 w-5 mr-2" />
          기사님에게 공유
        </Button>
      </div>
    </div>
  );
}

function Room3D({ type, highlightItem }: { type: 'current' | 'new'; highlightItem?: string | null }) {
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
          <meshStandardMaterial color={f.warning && !isCurrent ? '#E74C3C' : f.color} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function ComparisonContent() {
  const { comparisonWarnings } = useAnalysis();
  const [activeTab, setActiveTab] = useState<'current' | 'new' | 'both'>('both');
  const [highlightItem, setHighlightItem] = useState<string | null>(null);

  const warningCount = comparisonWarnings.filter((w) => w.type !== 'success').length;
  const successCount = comparisonWarnings.filter((w) => w.type === 'success').length;

  return (
    <div className="space-y-6">
      <div className="bg-[#1A2733] rounded-xl p-6 border-2 border-[#F5A623]">
        <div className="flex items-center gap-3 mb-2">
          <StatusBadge status="warning" size="lg" />
          <span className="text-xl font-bold text-white">주의 필요 {warningCount}건 / 정상 {successCount}건</span>
        </div>
      </div>

      <div className="space-y-3">
        {comparisonWarnings.map((w, i) => (
          <button
            key={i}
            onClick={() => { setHighlightItem(w.item); setActiveTab('new'); }}
            className={`w-full text-left rounded-xl p-4 border-2 transition-colors ${
              w.type === 'error' ? 'border-[#E74C3C] bg-[#E74C3C]/5' :
              w.type === 'warning' ? 'border-[#F39C12] bg-[#F39C12]/5' :
              'border-[#2ECC71] bg-[#2ECC71]/5'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">
                {w.type === 'error' ? '❌' : w.type === 'warning' ? '⚠️' : '✅'}
              </span>
              <div>
                <p className="font-semibold text-white">{w.item}</p>
                <p className="text-[#A0B0C0] text-sm">{w.message}</p>
                {w.detail && <p className="text-[#A0B0C0] text-xs mt-1">{w.detail}</p>}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-[#1A2733] rounded-xl overflow-hidden border border-[#2A3A4A]">
        <div className="flex border-b border-[#2A3A4A]">
          {(['current', 'new', 'both'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === tab ? 'bg-[#F5A623] text-[#0F1923]' : 'text-[#A0B0C0] hover:text-white'}`}
            >
              {tab === 'current' ? '현재 집' : tab === 'new' ? '새 집' : '나란히 비교'}
            </button>
          ))}
        </div>
        <div className="aspect-[2/1] bg-[#0F1923]">
          <Canvas camera={{ position: [6, 4, 8], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            {(activeTab === 'current' || activeTab === 'both') && (
              <group position={activeTab === 'both' ? [-3, 0, 0] : [0, 0, 0]}>
                <Room3D type="current" highlightItem={highlightItem} />
              </group>
            )}
            {(activeTab === 'new' || activeTab === 'both') && (
              <group position={activeTab === 'both' ? [3, 0, 0] : [0, 0, 0]}>
                <Room3D type="new" highlightItem={highlightItem} />
              </group>
            )}
            <OrbitControls enablePan={false} minDistance={4} maxDistance={15} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
