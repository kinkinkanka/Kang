'use client';

import { useAnalysis } from '@/hooks/use-analysis';
import { getMoveData } from '@/lib/api';
import { defaultMoveData } from '@/lib/store';
import { useEffect, useState } from 'react';

const BASE_TRUCK_COST: Record<string, number> = {
  '1톤': 300000,
  '2.5톤': 400000,
  '5톤': 550000,
};
const PATH_EXTRA = 50000;

export function EstimateSummary() {
  const analysis = useAnalysis();
  const [moveData, setMoveData] = useState(defaultMoveData);

  useEffect(() => {
    getMoveData().then(setMoveData).catch(() => {});
  }, []);

  const baseCost = BASE_TRUCK_COST[analysis.truckLoading.recommendedTruck] ?? 400000;
  const total =
    baseCost +
    analysis.ladderTruck.estimatedCost +
    analysis.pathAnalysis.filter((i) => !i.canPass).length * PATH_EXTRA;

  const ladderCount = analysis.ladderTruck.needsCount;
  const pathWarnCount = analysis.pathAnalysis.filter((i) => !i.canPass).length;
  const compWarnCount = analysis.comparisonWarnings.filter((w) => w.type !== 'success').length;

  const bullets = [
    `${moveData.origin.address} → ${moveData.destination.address}`,
    `${analysis.truckLoading.recommendedTruck} 추천 · 예상 총 ${total.toLocaleString()}원`,
    ...(ladderCount > 0 ? [`사다리차 ${ladderCount}대 필요 (+${analysis.ladderTruck.estimatedCost.toLocaleString()}원)`] : []),
    ...(pathWarnCount > 0 ? [`경로 통과 주의 ${pathWarnCount}건`] : []),
    ...(compWarnCount > 0 ? [`양쪽 집 비교 주의 ${compWarnCount}건`] : []),
  ];

  return (
    <div className="bg-[#FFF5F1] rounded-xl p-5 border-2 border-[#FF7F50]/30">
      <h3 className="text-[#2D3436] font-bold text-sm mb-3">전체 요약</h3>
      <ul className="space-y-1.5 text-[#2D3436] text-sm">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-[#FF7F50] shrink-0">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
