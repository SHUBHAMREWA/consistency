import { db } from './db';
import type { Habit } from '../types/habit';

export const habitService = {
  async getHabitsForMonth(year: number, month: number): Promise<Habit[]> {
    return db.habits
      .where('[year+month]')
      .equals([year, month])
      .sortBy('position')
      .catch(() =>
        // fallback if compound index not available
        db.habits
          .filter((h) => h.year === year && h.month === month)
          .toArray()
          .then((arr) => arr.sort((a, b) => a.position - b.position))
      );
  },

  async addHabit(year: number, month: number, title: string): Promise<number> {
    const existing = await habitService.getHabitsForMonth(year, month);
    const position = existing.length;
    return db.habits.add({ year, month, title, position });
  },

  async renameHabit(id: number, title: string): Promise<void> {
    await db.habits.update(id, { title });
  },

  async deleteHabit(id: number): Promise<void> {
    await db.transaction('rw', db.habits, db.habitLogs, async () => {
      await db.habitLogs.where('habitId').equals(id).delete();
      await db.habits.delete(id);
    });
  },

  async reorderHabits(habits: Habit[]): Promise<void> {
    await db.transaction('rw', db.habits, async () => {
      for (let i = 0; i < habits.length; i++) {
        if (habits[i].id !== undefined) {
          await db.habits.update(habits[i].id!, { position: i });
        }
      }
    });
  },
};
