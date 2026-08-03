import { useMemo, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import type { Habit, CellState } from '../../types/habit';
import HabitRow from './HabitRow';
import { getDaysInMonth } from '../../utils/date';

interface HabitTableProps {
  habits: Habit[];
  year: number;
  month: number;
  getCellState: (habitId: number, date: string) => CellState;
  onToggle: (habitId: number, date: string) => void;
  onRename: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onReorder: (reordered: Habit[]) => void;
}

export default function HabitTable({
  habits,
  year,
  month,
  getCellState,
  onToggle,
  onRename,
  onDelete,
  onReorder,
}: HabitTableProps) {
  const days = useMemo(
    () => Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1),
    [year, month]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = habits.findIndex((h) => h.id === active.id);
      const newIndex = habits.findIndex((h) => h.id === over.id);
      const reordered = arrayMove(habits, oldIndex, newIndex);
      onReorder(reordered);
    },
    [habits, onReorder]
  );

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-purple-500">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-lg font-medium mb-1">No habits yet</p>
        <p className="text-sm">Click the + button to add your first habit</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full rounded-none sm:rounded-xl border-y sm:border border-slate-100 dark:border-purple-800/50 shadow-sm bg-white dark:bg-[#1a0b2e]">
      <table className="border-collapse min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-[#201038] border-b border-slate-100 dark:border-purple-800/50">
            {/* Drag handle col */}
            <th className="w-6 sm:w-8 px-1" />
            {/* Habit name col */}
            <th className="sticky left-0 z-20 bg-slate-50 dark:bg-[#201038] px-2 sm:px-3 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-slate-500 dark:text-purple-300 uppercase tracking-wider border-r border-slate-100 dark:border-purple-800/50 min-w-[90px] sm:min-w-[140px]">
              Habit
            </th>
            {/* Day cols */}
            {days.map((day) => (
              <th
                key={day}
                className="px-0 sm:px-0.5 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-purple-400 w-8 sm:w-10"
              >
                {day}
              </th>
            ))}
            {/* Menu col */}
            <th className="w-8" />
          </tr>
        </thead>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={habits.map((h) => h.id!)}
            strategy={verticalListSortingStrategy}
          >
            <tbody className="divide-y divide-slate-50 dark:divide-purple-900/30">
              {habits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  days={days}
                  year={year}
                  month={month}
                  getCellState={getCellState}
                  onToggle={onToggle}
                  onRename={onRename}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </SortableContext>
        </DndContext>
      </table>
    </div>
  );
}
