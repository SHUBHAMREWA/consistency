import { db } from './db';
import type { HabitLog, CellState } from '../types/habit';

export const scoreService = {
  async getLogsForMonth(
    habitIds: number[],
    year: number,
    month: number
  ): Promise<HabitLog[]> {
    if (habitIds.length === 0) return [];
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return db.habitLogs
      .where('habitId')
      .anyOf(habitIds)
      .filter((log) => log.date.startsWith(prefix))
      .toArray();
  },

  async getLogsForHabit(habitId: number): Promise<HabitLog[]> {
    return db.habitLogs.where('habitId').equals(habitId).toArray();
  },

  async toggleLog(habitId: number, date: string): Promise<CellState> {
    const existing = await db.habitLogs
      .where('habitId')
      .equals(habitId)
      .filter((l) => l.date === date)
      .first();

    if (!existing) {
      // empty → done
      await db.habitLogs.add({ habitId, date, completed: true });
      return 'done';
    } else if (existing.completed) {
      // done → skip
      await db.habitLogs.update(existing.id!, { completed: false });
      return 'skip';
    } else {
      // skip → empty
      await db.habitLogs.delete(existing.id!);
      return 'empty';
    }
  },

  getCellState(logs: HabitLog[], habitId: number, date: string): CellState {
    const log = logs.find((l) => l.habitId === habitId && l.date === date);
    if (!log) return 'empty';
    return log.completed ? 'done' : 'skip';
  },
};
