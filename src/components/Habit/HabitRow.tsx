import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  FaEllipsisVertical,
  FaGripVertical,
  FaPen,
  FaTrash,
} from 'react-icons/fa6';
import type { Habit, CellState } from '../../types/habit';
import HabitCell from './HabitCell';
import { formatDateKey, todayKey } from '../../utils/date';

interface HabitRowProps {
  habit: Habit;
  days: number[];
  year: number;
  month: number;
  getCellState: (habitId: number, date: string) => CellState;
  onToggle: (habitId: number, date: string) => void;
  onRename: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export default function HabitRow({
  habit,
  days,
  year,
  month,
  getCellState,
  onToggle,
  onRename,
  onDelete,
}: HabitRowProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const today = todayKey();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: habit.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto' as const,
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleRename = () => {
    handleMenuClose();
    onRename(habit);
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete(habit);
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="group hover:bg-slate-50 dark:hover:bg-[#2d1b4e]/50 transition-colors"
    >
      {/* Drag handle */}
      <td className="w-6 sm:w-8 px-0 sm:px-1 text-slate-300 dark:text-purple-600 hover:text-slate-500 dark:hover:text-purple-400 cursor-grab active:cursor-grabbing">
        <button
          className="flex items-center justify-center w-7 h-7 rounded touch-none"
          {...attributes}
          {...listeners}
          aria-label={`Drag ${habit.title}`}
          type="button"
        >
          <FaGripVertical size={14} />
        </button>
      </td>

      {/* Habit name */}
      <td className="sticky left-0 z-10 bg-white dark:bg-[#1a0b2e] group-hover:bg-slate-50 dark:group-hover:bg-[#201038] transition-colors min-w-[90px] sm:min-w-[140px] max-w-[110px] sm:max-w-[180px] px-2 sm:px-3 py-2 border-r border-slate-100 dark:border-purple-800/50">
        <span className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-purple-200 truncate">
          {habit.title}
        </span>
      </td>

      {/* Day cells */}
      {days.map((day) => {
        const dateKey = formatDateKey(year, month, day);
        const isToday = dateKey === today;
        const isFuture = dateKey > today;
        return (
          <HabitCell
            key={day}
            habitId={habit.id!}
            date={dateKey}
            state={getCellState(habit.id!, dateKey)}
            isToday={isToday}
            isFuture={isFuture}
            onToggle={onToggle}
          />
        );
      })}

      {/* Three-dot menu */}
      <td className="px-1">
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          aria-label={`Options for ${habit.title}`}
          sx={{ color: '#94a3b8', '&:hover': { color: '#475569' } }}
        >
          <FaEllipsisVertical size={13} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              elevation: 3,
              sx: { borderRadius: 2, minWidth: 140 },
            },
          }}
        >
          <MenuItem onClick={handleRename} dense>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FaPen size={13} color="#475569" />
            </ListItemIcon>
            <ListItemText
              primary="Rename"
              slotProps={{ primary: { style: { fontSize: 14 } } }}
            />
          </MenuItem>
          <MenuItem onClick={handleDelete} dense>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FaTrash size={13} color="#ef4444" />
            </ListItemIcon>
            <ListItemText
              primary="Delete"
              slotProps={{ primary: { style: { fontSize: 14, color: '#ef4444' } } }}
            />
          </MenuItem>
        </Menu>
      </td>
    </tr>
  );
}
