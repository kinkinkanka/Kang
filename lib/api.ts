/**
 * Frontend API client for MoveViz backend
 */

import type { MoveData } from './store';

const API_BASE = '';

export async function getMoveData(session = 'default'): Promise<MoveData> {
  const res = await fetch(`${API_BASE}/api/move?session=${session}`);
  if (!res.ok) throw new Error('Failed to fetch move data');
  return res.json();
}

export async function saveMoveData(data: MoveData, session = 'default'): Promise<MoveData> {
  const res = await fetch(`${API_BASE}/api/move?session=${session}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save move data');
  return res.json();
}

export interface AnalysisResult {
  carryOutSteps: import('./store').CarryOutStep[];
  ladderTruck: {
    items: import('./store').LadderTruckItem[];
    needsCount: number;
    estimatedCost: number;
    elevatorReservation: boolean;
  };
  pathAnalysis: import('./store').PathAnalysisItem[];
  truckLoading: {
    loadingItems: import('./store').LoadingItem[];
    totalVolume: number;
    truckVolume: number;
    utilization: number;
    recommendedTruck: string;
  };
  comparisonWarnings: import('./store').ComparisonWarning[];
}

export async function runAnalysis(moveData: MoveData): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(moveData),
  });
  if (!res.ok) throw new Error('Analysis failed');
  return res.json();
}
