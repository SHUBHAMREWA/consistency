import { memo, useCallback } from 'react';
import { FaCheck, FaXmark } from 'react-icons/fa6';
import type { CellState } from '../../types/habit';

interface HabitCellProps {
  habitId: number;
  date: string;
  state: CellState;
  isToday: boolean;
  isFuture: boolean;
  onToggle: (habitId: number, date: string) => void;
}

const HabitCell = memo(function HabitCell({
  habitId,
  date,
  state,
  isToday,
  isFuture,
  onToggle,
}: HabitCellProps) {
  const handleClick = useCallback(() => {
    onToggle(habitId, date);
  }, [habitId, date, onToggle]);

  const baseClass =
    'w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150 select-none border';

  const stateClass =
    state === 'done'
      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent shadow-sm'
      : state === 'skip'
      ? 'bg-rose-500 hover:bg-rose-600 text-white border-transparent shadow-sm'
      : 'bg-transparent border-slate-200 dark:border-purple-800/60 hover:bg-slate-100 dark:hover:bg-purple-800/40 text-transparent';

  const todayClass = isToday ? 'ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-[#1a0b2e]' : '';
  const futureClass = isFuture ? 'opacity-40 cursor-default' : '';

  return (
    <td className="p-0 sm:p-0.5">
      <button
        className={`${baseClass} ${stateClass} ${todayClass} ${futureClass}`}
        onClick={isFuture ? undefined : handleClick}
        aria-label={`${date}: ${state}`}
        type="button"
      >
        {state === 'done' && <FaCheck size={14} />}
        {state === 'skip' && <FaXmark size={14} />}
      </button>
    </td>
  );
});

export default HabitCell;
