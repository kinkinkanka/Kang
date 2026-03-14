'use client';

import { useAnalysis } from '@/hooks/use-analysis';
import { Receipt, Truck, AlertTriangle } from 'lucide-react';

const BASE_TRUCK_COST: Record<string, number> = {
  '1톤': 300000,
  '2.5톤': 400000,
  '5톤': 550000,
};
const PATH_EXTRA_PER_ITEM = 50000;

export function EstimateVisualization() {
  const analysis = useAnalysis();
  const { ladderTruck, pathAnalysis, truckLoading } = analysis;

  const baseCost = BASE_TRUCK_COST[truckLoading.recommendedTruck] ?? 400000;
  const ladderCost = ladderTruck.estimatedCost;
  const pathWarningCount = pathAnalysis.filter((i) => !i.canPass).length;
  const pathExtraCost = pathWarningCount * PATH_EXTRA_PER_ITEM;

  const items = [
    {
      label: `기본 운송 (${truckLoading.recommendedTruck})`,
      cost: baseCost,
      detail: `적재률 ${truckLoading.utilization}%`,
      icon: Truck,
    },
    ...(ladderCost > 0
      ? [
          {
            label: '사다리차 추가',
            cost: ladderCost,
            detail: `${ladderTruck.needsCount}대`,
            icon: AlertTriangle,
          },
        ]
      : []),
    ...(pathExtraCost > 0
      ? [
          {
            label: '경로 보조 (계단·우회)',
            cost: pathExtraCost,
            detail: `${pathWarningCount}건`,
            icon: AlertTriangle,
          },
        ]
      : []),
  ];

  const total = items.reduce((sum, i) => sum + i.cost, 0);
  const maxCost = Math.max(...items.map((i) => i.cost), 1);

  return (
    <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#2D3436]/20">
      <h2 className="text-[#2D3436] font-semibold text-lg mb-4 flex items-center gap-2">
        <Receipt className="h-5 w-5 text-[#FF7F50]" />
        견적 산출 결과
      </h2>
      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          const pct = (item.cost / maxCost) * 100;
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FF7F50]/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#FF7F50]" />
                  </div>
                  <div>
                    <span className="text-[#2D3436] font-medium">{item.label}</span>
                    <span className="text-[#636E72] text-xs ml-2">({item.detail})</span>
                  </div>
                </div>
                <span className="font-mono font-semibold text-[#2D3436]">
                  {item.cost.toLocaleString()}원
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#2D3436]/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FF7F50]/70 transition-all duration-500"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t-2 border-[#2D3436]/20 flex items-center justify-between">
        <span className="text-[#2D3436] font-bold">예상 총 견적</span>
        <span className="font-mono text-xl font-bold text-[#FF7F50]">
          {total.toLocaleString()}원
        </span>
      </div>
      <p className="text-[#636E72] text-xs mt-2">
        * 실제 견적은 업체별·거리·날짜에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}
