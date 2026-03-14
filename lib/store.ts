// MoveViz Mock Data Store

export interface Furniture {
  id: string;
  label: string;
  type: string;
  dimensions: { w: number; d: number; h: number };
  weight: number;
  disassemblable: boolean;
  currentRoom: string;
  newRoom?: string;
}

export interface HouseInfo {
  address: string;
  floor: number;
  hasElevator: boolean;
  elevatorSize?: { w: number; d: number; h: number };
  frontDoorSize: { w: number; h: number };
  hallwayWidth: number;
  ceilingHeight?: number;
}

export interface MoveData {
  moveDate: string;
  origin: HouseInfo;
  destination: HouseInfo;
  furniture: Furniture[];
}

export const defaultMoveData: MoveData = {
  moveDate: '2026-03-20',
  origin: {
    address: '서울 강남구 역삼동',
    floor: 3,
    hasElevator: true,
    elevatorSize: { w: 1000, d: 1200, h: 2100 },
    frontDoorSize: { w: 900, h: 2100 },
    hallwayWidth: 1200,
    ceilingHeight: 2400,
  },
  destination: {
    address: '서울 마포구 합정동',
    floor: 5,
    hasElevator: true,
    elevatorSize: { w: 900, d: 1100, h: 2000 },
    frontDoorSize: { w: 850, h: 2100 },
    hallwayWidth: 1100,
    ceilingHeight: 2300,
  },
  furniture: [
    { id: '1', label: '장롱', type: 'wardrobe', dimensions: { w: 2400, d: 600, h: 2200 }, weight: 120, disassemblable: true, currentRoom: '안방', newRoom: '안방' },
    { id: '2', label: '퀸 침대', type: 'bed_q', dimensions: { w: 1600, d: 2000, h: 500 }, weight: 80, disassemblable: false, currentRoom: '안방', newRoom: '안방' },
    { id: '3', label: '3인 소파', type: 'sofa', dimensions: { w: 2200, d: 900, h: 850 }, weight: 60, disassemblable: false, currentRoom: '거실', newRoom: '거실' },
    { id: '4', label: '냉장고', type: 'refrigerator', dimensions: { w: 700, d: 800, h: 1850 }, weight: 100, disassemblable: false, currentRoom: '주방', newRoom: '주방' },
    { id: '5', label: '세탁기', type: 'washing_machine', dimensions: { w: 600, d: 600, h: 850 }, weight: 70, disassemblable: false, currentRoom: '베란다', newRoom: '베란다' },
  ],
};

export type ModuleStatus = 'complete' | 'warning' | 'error' | 'pending';

export interface ModuleInfo {
  id: number;
  name: string;
  description: string;
  status: ModuleStatus;
  summary: string;
}

export const analysisModules: ModuleInfo[] = [
  { id: 1, name: '사다리차 판단', description: '층수·크기 기반 자동 판단', status: 'warning', summary: '사다리차 필요 2개' },
  { id: 2, name: '경로 통과 분석', description: '현관문·복도·엘리베이터 통과 여부', status: 'warning', summary: '주의 필요 2건' },
  { id: 3, name: '배치도 공유', description: '새 집 배치 계획 기사님과 공유', status: 'pending', summary: '배치도 작성 필요' },
  { id: 4, name: '양쪽 집 비교', description: '현재 집 vs 새 집 구조 비교', status: 'warning', summary: '주의 필요 2건' },
];

// Legacy - keep for API/store compatibility
export const modules = analysisModules.map((m, i) => ({ ...m, path: `/module/${i + 1}` }));

export interface LadderTruckItem {
  label: string;
  needsLadder: boolean;
  reason: string;
  dimensions: { w: number };
}

export interface PathAnalysisItem {
  label: string;
  frontDoor: boolean;
  hallway: boolean;
  elevator: boolean;
  canPass: boolean;
  bottleneck: string | null;
  solution: string | null;
  dimensions: { w: number };
}

export interface LoadingItem {
  label: string;
  dimensions: { w: number; d: number; h: number };
  volume: number;
  color: string;
  position: { x: number; y: number; z: number };
}

export interface ComparisonWarning {
  type: 'error' | 'warning' | 'success';
  item: string;
  message: string;
  detail: string;
}

export const ladderTruckItems: LadderTruckItem[] = [
  { label: '장롱', needsLadder: true, reason: '현관문(900mm) 통과 불가, 가구 너비 2400mm', dimensions: { w: 2400 } },
  { label: '냉장고', needsLadder: true, reason: '도착지 엘리베이터 내부 너비 부족', dimensions: { w: 700 } },
  { label: '퀸 침대', needsLadder: false, reason: '엘리베이터 이동 가능', dimensions: { w: 1600 } },
  { label: '3인 소파', needsLadder: false, reason: '엘리베이터 이동 가능', dimensions: { w: 2200 } },
  { label: '세탁기', needsLadder: false, reason: '엘리베이터 이동 가능', dimensions: { w: 600 } },
];

export const pathAnalysisItems: PathAnalysisItem[] = [
  { label: '장롱', frontDoor: false, hallway: true, elevator: true, canPass: false, bottleneck: '현관문', solution: '사다리차', dimensions: { w: 2400 } },
  { label: '3인 소파', frontDoor: true, hallway: true, elevator: false, canPass: false, bottleneck: '엘리베이터', solution: '계단 이동', dimensions: { w: 2200 } },
  { label: '퀸 침대', frontDoor: true, hallway: true, elevator: true, canPass: true, bottleneck: null, solution: null, dimensions: { w: 1600 } },
  { label: '냉장고', frontDoor: true, hallway: true, elevator: true, canPass: true, bottleneck: null, solution: null, dimensions: { w: 700 } },
  { label: '세탁기', frontDoor: true, hallway: true, elevator: true, canPass: true, bottleneck: null, solution: null, dimensions: { w: 600 } },
];

export const loadingItems: LoadingItem[] = [
  { label: '장롱', dimensions: { w: 2.4, d: 0.6, h: 2.2 }, volume: 3.17, color: '#3B82F6', position: { x: 0, y: 1.1, z: -0.4 } },
  { label: '퀸 침대', dimensions: { w: 1.6, d: 2.0, h: 0.5 }, volume: 1.6, color: '#10B981', position: { x: 0, y: 0.25, z: 0.6 } },
  { label: '3인 소파', dimensions: { w: 2.2, d: 0.9, h: 0.85 }, volume: 1.68, color: '#F59E0B', position: { x: 0, y: 0.425, z: 1.8 } },
  { label: '냉장고', dimensions: { w: 0.7, d: 0.8, h: 1.85 }, volume: 1.04, color: '#8B5CF6', position: { x: -0.5, y: 0.925, z: 2.8 } },
  { label: '세탁기', dimensions: { w: 0.6, d: 0.6, h: 0.85 }, volume: 0.31, color: '#EC4899', position: { x: 0.5, y: 0.425, z: 2.8 } },
];

export const comparisonWarnings: ComparisonWarning[] = [
  { type: 'error', item: 'TV 위치', message: '동쪽 벽 콘센트 없음', detail: '배선 변경 필요' },
  { type: 'warning', item: '장롱', message: '새 집 천장 여유 100mm', detail: '2200mm / 천장 2300mm' },
  { type: 'success', item: '3인 소파', message: '거실 폭 여유 1000mm 확보', detail: '' },
];

// API용 타입 (트럭/반출 분석 - UI에서 미사용)
export interface CarryOutStep {
  step: number;
  label: string;
  location: string;
  score: number | null;
  reasons: string[];
  warning: string | null;
}

export interface TruckSize {
  name: string;
  volume: number;
  dimensions: { l: number; w: number; h: number };
  recommended: boolean;
}

export const truckSizes: TruckSize[] = [
  { name: '1톤', volume: 3.9, dimensions: { l: 2.1, w: 1.4, h: 1.3 }, recommended: false },
  { name: '2.5톤', volume: 8.2, dimensions: { l: 3.2, w: 1.7, h: 1.5 }, recommended: true },
  { name: '5톤', volume: 20, dimensions: { l: 4.5, w: 2.3, h: 1.9 }, recommended: false },
];
