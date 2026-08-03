import type { DailyScore } from '../types/habit';

export interface GraphDataPoint {
  day: string;
  score: number;
  total: number;
}

export function buildGraphData(scores: DailyScore[]): GraphDataPoint[] {
  return scores.map((s) => ({
    day: String(s.day),
    score: s.score,
    total: s.total,
  }));
}

export function getMaxScore(scores: DailyScore[]): number {
  return scores.reduce((max, s) => Math.max(max, s.total), 0);
}
