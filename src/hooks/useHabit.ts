import { useState, useEffect, useCallback } from 'react';
import type { Habit } from '../types/habit';
import { habitService } from '../database/habit.service';

export function useHabit(year: number, month: number) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await habitService.getHabitsForMonth(year, month);
    setHabits(data);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  const addHabit = useCallback(
    async (title: string): Promise<{ success: boolean; error?: string }> => {
      if (!title.trim()) {
        return { success: false, error: 'Habit name cannot be empty.' };
      }
      await habitService.addHabit(year, month, title.trim());
      await load();
      return { success: true };
    },
    [year, month, load]
  );

  const renameHabit = useCallback(
    async (id: number, title: string) => {
      await habitService.renameHabit(id, title);
      await load();
    },
    [load]
  );

  const deleteHabit = useCallback(
    async (id: number) => {
      await habitService.deleteHabit(id);
      await load();
    },
    [load]
  );

  const reorderHabits = useCallback(
    async (reordered: Habit[]) => {
      setHabits(reordered); // optimistic update
      await habitService.reorderHabits(reordered);
    },
    []
  );

  return { habits, loading, addHabit, renameHabit, deleteHabit, reorderHabits };
}
