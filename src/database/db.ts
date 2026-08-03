import Dexie, { type Table } from 'dexie';
import type { Habit, HabitLog } from '../types/habit';

export class HabitTrackerDB extends Dexie {
  habits!: Table<Habit, number>;
  habitLogs!: Table<HabitLog, number>;

  constructor() {
    super('HabitTrackerDB');
    this.version(1).stores({
      habits: '++id, month, year, position, [year+month]',
      habitLogs: '++id, habitId, date, completed',
    });
  }
}

export const db = new HabitTrackerDB();
