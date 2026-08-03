import type { Habit, HabitLog, DailyScore } from '../types/habit';
import { getDaysInMonth, formatDateKey } from './date';

export function computeDailyScores(
  habits: Habit[],
  logs: HabitLog[],
  year: number,
  month: number
): DailyScore[] {
  const days = getDaysInMonth(year, month);
  const scores: DailyScore[] = [];

  for (let day = 1; day <= days; day++) {
    const dateKey = formatDateKey(year, month, day);
    let completed = 0;
    for (const habit of habits) {
      const log = logs.find((l) => l.habitId === habit.id && l.date === dateKey);
      if (log && log.completed) completed++;
    }
    scores.push({ day, score: completed, total: habits.length });
  }

  return scores;
}

export function getMonthCompletionRate(
  habits: Habit[],
  logs: HabitLog[],
  year: number,
  month: number
): number {
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const daysToCount = isCurrentMonth ? today.getDate() : getDaysInMonth(year, month);

  let total = 0;
  let done = 0;

  for (let day = 1; day <= daysToCount; day++) {
    const dateKey = formatDateKey(year, month, day);
    for (const habit of habits) {
      total++;
      const log = logs.find((l) => l.habitId === habit.id && l.date === dateKey);
      if (log && log.completed) done++;
    }
  }

  return total === 0 ? 0 : Math.round((done / total) * 100);
}
