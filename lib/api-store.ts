/**
 * In-memory store for move data and analysis results.
 * For production, replace with database (PostgreSQL, MongoDB, etc.)
 */

import type { MoveData } from './store';

const moveStore = new Map<string, MoveData>();
const analysisStore = new Map<string, Record<string, unknown>>();

const DEFAULT_SESSION = 'default';

export function getMoveData(sessionId = DEFAULT_SESSION): MoveData | null {
  return moveStore.get(sessionId) ?? null;
}

export function setMoveData(data: MoveData, sessionId = DEFAULT_SESSION): MoveData {
  moveStore.set(sessionId, data);
  return data;
}

export function getAnalysisResult(sessionId = DEFAULT_SESSION): Record<string, unknown> | null {
  return analysisStore.get(sessionId) ?? null;
}

export function setAnalysisResult(data: Record<string, unknown>, sessionId = DEFAULT_SESSION) {
  analysisStore.set(sessionId, data);
}
