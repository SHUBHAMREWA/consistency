import { useState, useEffect, useMemo, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { FaClockRotateLeft, FaCheck } from 'react-icons/fa6';

import { habitService } from '../../database/habit.service';
import { prevMonth, formatMonthLabel } from '../../utils/date';
import type { Habit } from '../../types/habit';

interface ImportHabitsDialogProps {
  open: boolean;
  onClose: () => void;
  year: number;
  month: number;
  currentHabits: Habit[];
  onImport: (titles: string[]) => Promise<void>;
}

export default function ImportHabitsDialog({
  open,
  onClose,
  year,
  month,
  currentHabits,
  onImport,
}: ImportHabitsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [previousHabits, setPreviousHabits] = useState<Habit[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const previousDate = useMemo(() => prevMonth(year, month), [year, month]);
  const previousMonthLabel = useMemo(
    () => formatMonthLabel(previousDate.year, previousDate.month),
    [previousDate]
  );
  const currentMonthLabel = useMemo(
    () => formatMonthLabel(year, month),
    [year, month]
  );

  const existingHabitSet = useMemo(() => {
    return new Set(currentHabits.map((h) => h.title.trim().toLowerCase()));
  }, [currentHabits]);

  // Load previous month's habits whenever the dialog opens
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoading(true);
    setError('');

    habitService
      .getHabitsForMonth(previousDate.year, previousDate.month)
      .then((habits) => {
        if (!isMounted) return;
        setPreviousHabits(habits);

        // Pre-select habits that are not yet in the current month
        const defaultSelected = habits
          .filter((h) => !existingHabitSet.has(h.title.trim().toLowerCase()))
          .map((h) => h.title);
        setSelectedTitles(defaultSelected);
        setLoading(false);
      })
      .catch((_err) => {
        if (!isMounted) return;
        setError('Failed to load habits from previous month.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, previousDate, existingHabitSet]);

  const availableHabits = useMemo(() => {
    return previousHabits.filter(
      (h) => !existingHabitSet.has(h.title.trim().toLowerCase())
    );
  }, [previousHabits, existingHabitSet]);

  const handleToggleHabit = useCallback((title: string) => {
    setSelectedTitles((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedTitles(availableHabits.map((h) => h.title));
  }, [availableHabits]);

  const handleDeselectAll = useCallback(() => {
    setSelectedTitles([]);
  }, []);

  const handleImport = async () => {
    if (selectedTitles.length === 0) return;
    setImporting(true);
    setError('');
    try {
      await onImport(selectedTitles);
      setImporting(false);
      onClose();
    } catch (_err) {
      setError('Failed to import habits. Please try again.');
      setImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={importing ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            maxHeight: '85vh',
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-purple-950/60 text-indigo-600 dark:text-purple-300">
            <FaClockRotateLeft size={16} />
          </div>
          <div>
            <div className="font-bold text-base sm:text-lg text-slate-900 dark:text-purple-100">
              Import from Previous Month
            </div>
            <div className="text-xs text-slate-500 dark:text-purple-300 font-normal">
              Copy habits from {previousMonthLabel} into {currentMonthLabel}
            </div>
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {error && (
          <div className="p-4 pb-0">
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <CircularProgress size={32} />
            <span className="text-xs text-slate-400 dark:text-purple-300">
              Loading habits from {previousMonthLabel}...
            </span>
          </div>
        ) : previousHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="text-4xl mb-3">🗓️</div>
            <p className="text-sm font-semibold text-slate-800 dark:text-purple-200 mb-1">
              No habits found in {previousMonthLabel}
            </p>
            <p className="text-xs text-slate-500 dark:text-purple-400 max-w-xs">
              There are no recorded habits from the previous month to copy. You can add new habits directly using the Add Habit button.
            </p>
          </div>
        ) : (
          <div>
            {/* Toolbar for bulk actions */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-[#201038] border-b border-slate-100 dark:border-purple-800/40 text-xs text-slate-600 dark:text-purple-300">
              <span>
                {availableHabits.length > 0 ? (
                  <>
                    <strong className="text-slate-800 dark:text-purple-100">
                      {selectedTitles.length}
                    </strong>{' '}
                    of {availableHabits.length} available selected
                  </>
                ) : (
                  'All previous habits are already in this month'
                )}
              </span>
              {availableHabits.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    disabled={selectedTitles.length === availableHabits.length}
                    className="text-xs font-semibold text-indigo-600 dark:text-purple-300 hover:underline disabled:opacity-40"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-purple-700">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    disabled={selectedTitles.length === 0}
                    className="text-xs font-semibold text-slate-500 dark:text-purple-400 hover:underline disabled:opacity-40"
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>

            {/* List of habits */}
            <div className="divide-y divide-slate-100 dark:divide-purple-900/30 max-h-[380px] overflow-y-auto">
              {previousHabits.map((habit) => {
                const isAlreadyAdded = existingHabitSet.has(
                  habit.title.trim().toLowerCase()
                );
                const isSelected = selectedTitles.includes(habit.title);

                return (
                  <div
                    key={habit.id ?? habit.title}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={isAlreadyAdded ? -1 : 0}
                    onClick={() => {
                      if (!isAlreadyAdded && !importing) {
                        handleToggleHabit(habit.title);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!isAlreadyAdded && !importing && (e.key === ' ' || e.key === 'Enter')) {
                        e.preventDefault();
                        handleToggleHabit(habit.title);
                      }
                    }}
                    className={`flex items-center justify-between px-4 py-3 transition-colors select-none ${
                      isAlreadyAdded
                        ? 'bg-slate-50/50 dark:bg-purple-950/20 opacity-60 cursor-not-allowed'
                        : 'hover:bg-slate-50 dark:hover:bg-[#201038] cursor-pointer active:bg-slate-100 dark:active:bg-purple-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        disabled={isAlreadyAdded || importing}
                        tabIndex={-1}
                        sx={{
                          p: 0.5,
                          pointerEvents: 'none',
                          '&.Mui-checked': {
                            color: (theme) =>
                              theme.palette.mode === 'dark' ? '#c084fc' : '#4f46e5',
                          },
                        }}
                      />
                      <span
                        className={`text-sm truncate font-medium ${
                          isAlreadyAdded
                            ? 'text-slate-400 dark:text-purple-400'
                            : 'text-slate-800 dark:text-purple-100'
                        }`}
                      >
                        {habit.title}
                      </span>
                    </div>

                    {isAlreadyAdded && (
                      <Chip
                        label="Already in month"
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '10px',
                          height: '20px',
                          borderColor: 'rgba(148, 163, 184, 0.4)',
                          color: 'text.secondary',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={importing}
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 500,
            color: (theme) =>
              theme.palette.mode === 'dark' ? '#c084fc' : '#64748b',
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(192, 132, 252, 0.08)'
                  : 'rgba(100, 116, 139, 0.08)',
            },
          }}
        >
          {previousHabits.length === 0 ? 'Close' : 'Cancel'}
        </Button>
        {previousHabits.length > 0 && (
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={importing || selectedTitles.length === 0}
            startIcon={
              importing ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <FaCheck size={12} />
              )
            }
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2.5,
              py: 1,
              color: '#ffffff !important',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? '#9333ea' : '#4f46e5',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(147, 51, 234, 0.35)'
                  : '0 2px 8px rgba(79, 70, 229, 0.25)',
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#7e22ce' : '#4338ca',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 4px 12px rgba(147, 51, 234, 0.5)'
                    : '0 4px 12px rgba(79, 70, 229, 0.35)',
              },
              '&.Mui-disabled': {
                color: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.4) !important'
                    : 'rgba(255, 255, 255, 0.6) !important',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(147, 51, 234, 0.2)'
                    : 'rgba(79, 70, 229, 0.25)',
                boxShadow: 'none',
              },
            }}
          >
            {importing
              ? 'Importing...'
              : `Import ${selectedTitles.length > 0 ? `(${selectedTitles.length})` : ''}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
