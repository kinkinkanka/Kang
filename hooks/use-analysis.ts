'use client';

import { useEffect, useState } from 'react';
import type {
  LadderTruckItem,
  PathAnalysisItem,
  LoadingItem,
  ComparisonWarning,
} from '@/lib/store';
import {
  ladderTruckItems,
  pathAnalysisItems,
  loadingItems,
  comparisonWarnings,
} from '@/lib/store';

export interface AnalysisData {
  ladderTruck: {
    items: LadderTruckItem[];
    needsCount: number;
    estimatedCost: number;
    elevatorReservation: boolean;
  };
  pathAnalysis: PathAnalysisItem[];
  truckLoading: {
    loadingItems: LoadingItem[];
    totalVolume: number;
    truckVolume: number;
    utilization: number;
    recommendedTruck: string;
  };
  comparisonWarnings: ComparisonWarning[];
}

const defaultAnalysis: AnalysisData = {
  ladderTruck: {
    items: ladderTruckItems,
    needsCount: ladderTruckItems.filter((i) => i.needsLadder).length,
    estimatedCost: ladderTruckItems.filter((i) => i.needsLadder).length * 100000,
    elevatorReservation: true,
  },
  pathAnalysis: pathAnalysisItems,
  truckLoading: {
    loadingItems,
    totalVolume: 6.8,
    truckVolume: 8.2,
    utilization: 83,
    recommendedTruck: '2.5톤',
  },
  comparisonWarnings,
};

export function useAnalysis() {
  const [data, setData] = useState<AnalysisData>(defaultAnalysis);

  useEffect(() => {
    fetch('/api/analysis/store?session=default')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => {});
  }, []);

  return data;
}
