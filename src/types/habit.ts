export interface Habit {
  id?: number;
  month: number; // 1-12
  year: number;
  title: string;
  position: number;
}

export interface HabitLog {
  id?: number;
  habitId: number;
  date: string; // "YYYY-MM-DD"
  completed: boolean; // true = done ✔, false = skip ✖
}

export type CellState = 'empty' | 'done' | 'skip';

export interface DailyScore {
  day: number;
  score: number;
  total: number;
}
