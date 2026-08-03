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
    'w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-150 select-none border';

  const stateClass =
    state === 'done'
      ? 'bg-green-500/20 border-green-500/40 hover:bg-green-500/30 text-green-500'
      : state === 'skip'
      ? 'bg-red-500/20 border-red-500/40 hover:bg-red-500/30 text-red-500'
      : 'bg-transparent border-slate-200 hover:bg-slate-100 text-transparent';

  const todayClass = isToday ? 'ring-2 ring-indigo-400 ring-offset-1' : '';
  const futureClass = isFuture ? 'opacity-40 cursor-default' : '';

  return (
    <td className="p-0.5">
      <button
        className={`${baseClass} ${stateClass} ${todayClass} ${futureClass}`}
        onClick={isFuture ? undefined : handleClick}
        aria-label={`${date}: ${state}`}
        type="button"
      >
        {state === 'done' && <FaCheck size={12} />}
        {state === 'skip' && <FaXmark size={12} />}
      </button>
    </td>
  );
});

export default HabitCell;
