import { NextRequest, NextResponse } from 'next/server';
import type {
  MoveData,
  CarryOutStep,
  LadderTruckItem,
  PathAnalysisItem,
  LoadingItem,
  ComparisonWarning,
} from '@/lib/store';

/**
 * 백엔드 분석 엔진: 이사 데이터를 기반으로 모듈별 분석 결과 생성
 */

const FURNITURE_COLORS: Record<string, string> = {
  wardrobe: '#3B82F6',
  bed_q: '#10B981',
  sofa: '#F59E0B',
  refrigerator: '#8B5CF6',
  washing_machine: '#EC4899',
  desk: '#06B6D4',
  bookshelf: '#84CC16',
  other: '#A0B0C0',
};

export async function POST(request: NextRequest) {
  try {
    const moveData: MoveData = await request.json();

    // Module 1: 반출/반입 순서 (가구 데이터 기반 생성)
    const carryOutSteps = computeCarryOutOrder(moveData);

    // Module 2: 사다리차 판단
    const ladderTruckAnalysis = computeLadderTruck(moveData);

    // Module 3: 경로 통과 분석
    const pathAnalysis = computePathAnalysis(moveData);

    // Module 4: 트럭 적재
    const truckLoading = computeTruckLoading(moveData);

    // Module 6: 양쪽 집 비교
    const comparisonWarnings = computeComparison(moveData);

    return NextResponse.json({
      carryOutSteps,
      ladderTruck: ladderTruckAnalysis,
      pathAnalysis,
      truckLoading,
      comparisonWarnings,
    });
  } catch (error) {
    console.error('POST /api/analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

function computeCarryOutOrder(data: MoveData): CarryOutStep[] {
  const steps: CarryOutStep[] = [];
  let stepNum = 1;

  for (const f of data.furniture) {
    const reasons: string[] = [];
    let warning: string | null = null;

    if (f.weight >= 100) {
      reasons.push(`⚖️ 무게 ${f.weight}kg — 트럭 바닥 안쪽 배치 필수`);
    } else if (f.weight >= 60) {
      reasons.push(`⚖️ 무게 ${f.weight}kg`);
    }

    const doorWidth = data.origin.frontDoorSize.w;
    if (f.dimensions.w > doorWidth) {
      reasons.push(`🚪 현관문 통과 불가 → 사다리차 먼저 배치`);
    }

    if (f.disassemblable) {
      reasons.push(`🔧 해체 가능 → 해체 후 반출 권장`);
      warning = '조립 공구 미리 챙기기';
    }

    if (f.type === 'refrigerator') {
      reasons.push('🪜 사다리차 이동 예정 → 트럭 입구 배치');
      reasons.push('⚡ 전원 차단 후 12시간 경과 확인');
      warning = '이사 전날 전원 차단 필요';
    }

    const volume = (f.dimensions.w * f.dimensions.d * f.dimensions.h) / 1e9;
    if (volume > 1.5) {
      reasons.push(`📦 부피 ${volume.toFixed(1)}㎥ — 중간 적재`);
    }

    const score = Math.min(100, 95 - f.weight / 2 + (f.disassemblable ? 10 : 0));
    const room = f.currentRoom || '알 수 없음';

    steps.push({
      step: stepNum++,
      label: f.label,
      location: `${room} → 트럭`,
      score: Math.round(score),
      reasons: reasons.length ? reasons : ['일반 이동'],
      warning,
    });
  }

  steps.push({
    step: 99,
    label: '이불/충전기/귀중품',
    location: '마지막 반출',
    score: null,
    reasons: ['⭐ 도착 즉시 필요 — 별도 보관 권장'],
    warning: null,
  });

  return steps;
}

function computeLadderTruck(data: MoveData) {
  const items: LadderTruckItem[] = [];
  const doorWidth = data.origin.frontDoorSize.w;
  const destElevatorW = data.destination.elevatorSize?.w ?? 1000;

  for (const f of data.furniture) {
    const needsLadder =
      f.dimensions.w > doorWidth ||
      (data.destination.hasElevator && f.dimensions.w > destElevatorW);
    const reason = needsLadder
      ? f.dimensions.w > doorWidth
        ? `현관문(${doorWidth}mm) 통과 불가, 가구 너비 ${f.dimensions.w}mm`
        : '도착지 엘리베이터 내부 너비 부족'
      : '엘리베이터 이동 가능';

    items.push({
      label: f.label,
      needsLadder,
      reason,
      dimensions: { w: f.dimensions.w },
    });
  }

  const needsCount = items.filter((i) => i.needsLadder).length;
  const estimatedCost = needsCount * 100000;

  return {
    items,
    needsCount,
    estimatedCost,
    elevatorReservation: data.destination.hasElevator,
  };
}

function computePathAnalysis(data: MoveData): PathAnalysisItem[] {
  const doorWidth = data.origin.frontDoorSize.w;
  const hallwayWidth = data.origin.hallwayWidth;
  const elevatorW = data.origin.elevatorSize?.w ?? 1000;

  return data.furniture.map((f) => {
    const frontDoor = f.dimensions.w <= doorWidth;
    const hallway = f.dimensions.w <= hallwayWidth;
    const elevator = f.dimensions.w <= elevatorW;
    const canPass = frontDoor && hallway && elevator;

    let bottleneck: string | null = null;
    let solution: string | null = null;

    if (!frontDoor) {
      bottleneck = '현관문';
      solution = '사다리차';
    } else if (!elevator) {
      bottleneck = '엘리베이터';
      solution = '계단 이동';
    }

    return {
      label: f.label,
      frontDoor,
      hallway,
      elevator,
      canPass,
      bottleneck,
      solution,
      dimensions: { w: f.dimensions.w },
    };
  });
}

function computeTruckLoading(data: MoveData) {
  const truckSizes = [
    { name: '1톤', volume: 3.9, recommended: false },
    { name: '2.5톤', volume: 8.2, recommended: true },
    { name: '5톤', volume: 20, recommended: false },
  ];

  const loadingItems: LoadingItem[] = [];
  let z = -0.4;
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  let totalVolume = 0;

  data.furniture.forEach((f, i) => {
    const w = f.dimensions.w / 1000;
    const d = f.dimensions.d / 1000;
    const h = f.dimensions.h / 1000;
    const volume = w * d * h;
    totalVolume += volume;

    loadingItems.push({
      label: f.label,
      dimensions: { w, d, h },
      volume: Math.round(volume * 100) / 100,
      color: colors[i % colors.length],
      position: { x: 0, y: h / 2, z },
    });
    z += d + 0.1;
  });

  const truckVolume = 8.2;
  const utilization = Math.round((totalVolume / truckVolume) * 100);

  return {
    loadingItems,
    totalVolume: Math.round(totalVolume * 10) / 10,
    truckVolume,
    utilization,
    recommendedTruck: '2.5톤',
  };
}

function computeComparison(data: MoveData): ComparisonWarning[] {
  const warnings: ComparisonWarning[] = [];
  const destCeiling = data.destination.ceilingHeight ?? 2400;

  data.furniture.forEach((f) => {
    const ceilingMargin = destCeiling - f.dimensions.h;
    if (ceilingMargin > 0 && ceilingMargin < 200) {
      warnings.push({
        type: 'warning',
        item: f.label,
        message: `새 집 천장 여유 ${ceilingMargin}mm`,
        detail: `${f.dimensions.h}mm / 천장 ${destCeiling}mm`,
      });
    } else if (ceilingMargin >= 500) {
      warnings.push({
        type: 'success',
        item: f.label,
        message: '배치 여유 충분',
        detail: '',
      });
    }
  });

  if (warnings.length === 0) {
    warnings.push({
      type: 'success',
      item: '전체',
      message: '모든 가구 정상 배치 가능',
      detail: '',
    });
  }

  return warnings;
}
