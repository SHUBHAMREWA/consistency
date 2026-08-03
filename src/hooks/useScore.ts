import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Habit, HabitLog, CellState, DailyScore } from '../types/habit';
import { scoreService } from '../database/score.service';
import { computeDailyScores } from '../utils/score';

export function useScore(habits: Habit[], year: number, month: number) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const habitIds = useMemo(() => habits.map((h) => h.id!).filter(Boolean), [habits]);

  const loadLogs = useCallback(async () => {
    if (habitIds.length === 0) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await scoreService.getLogsForMonth(habitIds, year, month);
    setLogs(data);
    setLoading(false);
  }, [habitIds, year, month]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const toggleLog = useCallback(
    async (habitId: number, date: string): Promise<CellState> => {
      const newState = await scoreService.toggleLog(habitId, date);
      await loadLogs();
      return newState;
    },
    [loadLogs]
  );

  const getCellState = useCallback(
    (habitId: number, date: string): CellState => {
      return scoreService.getCellState(logs, habitId, date);
    },
    [logs]
  );

  const dailyScores = useMemo((): DailyScore[] => {
    return computeDailyScores(habits, logs, year, month);
  }, [habits, logs, year, month]);

  return { logs, loading, toggleLog, getCellState, dailyScores };
}
