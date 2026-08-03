import { useState, useCallback, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { FaPlus, FaMoon, FaSun } from 'react-icons/fa6';

import { MonthProvider, useMonth } from '../../context/MonthContext';
import { useHabit } from '../../hooks/useHabit';
import { useScore } from '../../hooks/useScore';

import MonthSelector from '../Month/MonthSelector';
import HabitTable from '../Habit/HabitTable';
import AddHabitDialog from '../Habit/AddHabitDialog';
import EditHabitDialog from '../Habit/EditHabitDialog';
import GraphGrid from '../Graph/GraphGrid';

import type { Habit } from '../../types/habit';

function AppContent({ themeMode, toggleTheme }: { themeMode: 'light' | 'dark'; toggleTheme: () => void }) {
  const { year, month, setYearMonth } = useMonth();
  const [addOpen, setAddOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { habits, loading: habitsLoading, addHabit, renameHabit, deleteHabit, reorderHabits, maxHabits } =
    useHabit(year, month);

  const { getCellState, toggleLog, dailyScores } = useScore(habits, year, month);

  const handleToggle = useCallback(
    async (habitId: number, date: string) => {
      await toggleLog(habitId, date);
    },
    [toggleLog]
  );

  const handleAdd = useCallback(
    async (title: string) => {
      const result = await addHabit(title);
      if (result.success) {
        setSnackbar({ open: true, message: 'Habit added!', severity: 'success' });
      }
      return result;
    },
    [addHabit]
  );

  const handleRename = useCallback(
    async (id: number, title: string) => {
      await renameHabit(id, title);
      setSnackbar({ open: true, message: 'Habit renamed!', severity: 'success' });
    },
    [renameHabit]
  );

  const handleDelete = useCallback(
    async (habit: Habit) => {
      await deleteHabit(habit.id!);
      setSnackbar({ open: true, message: `"${habit.title}" deleted.`, severity: 'success' });
    },
    [deleteHabit]
  );

  const habitPanel = (
    <div className="bg-white dark:bg-[#1a0b2e] sm:rounded-2xl border-y sm:border border-slate-100 dark:border-purple-800/50 sm:shadow-sm p-1 sm:p-5 min-h-[300px]">
      {habitsLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-indigo-500" />
        </div>
      ) : (
        <HabitTable
          habits={habits}
          year={year}
          month={month}
          getCellState={getCellState}
          onToggle={handleToggle}
          onRename={(h) => setEditingHabit(h)}
          onDelete={handleDelete}
          onReorder={reorderHabits}
        />
      )}
    </div>
  );

  const graphPanel = (
    <GraphGrid
      dailyScores={dailyScores}
      year={year}
      month={month}
      habitCount={habits.length}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#0f0518] dark:via-[#130722] dark:to-[#1a0b2e]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f0518]/80 backdrop-blur-md border-b border-slate-100 dark:border-purple-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🎯</span>
            <span className="font-bold text-slate-800 dark:text-purple-100 text-sm sm:text-base hidden xs:block">
              HabitTrack
            </span>
          </div>

          {/* Month selector */}
          <MonthSelector year={year} month={month} onChange={setYearMonth} />

          {/* Controls */}
          <div className="flex items-center gap-2">
            <IconButton onClick={toggleTheme} sx={{ color: 'text.primary' }} aria-label="Toggle dark mode">
              {themeMode === 'dark' ? <FaSun size={18} color="#c084fc" /> : <FaMoon size={18} />}
            </IconButton>

            {/* Add button (desktop) */}
            <div className="hidden md:flex items-center gap-2">
            <Tooltip title={habits.length >= maxHabits ? `Max ${maxHabits} habits reached` : 'Add habit'}>
              <span>
                <button
                  onClick={() => setAddOpen(true)}
                  disabled={habits.length >= maxHabits}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  <FaPlus size={12} />
                  Add Habit
                </button>
              </span>
            </Tooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-2 sm:py-6 pb-20 md:pb-10">
        <div className="flex flex-col gap-6">
          {habitPanel}
          {graphPanel}
        </div>
      </main>

      {/* FAB (mobile) */}
      <Fab
        color="primary"
        aria-label="Add habit"
        onClick={() => setAddOpen(true)}
        disabled={habits.length >= maxHabits}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 20,
          display: { xs: 'flex', md: 'none' },
          backgroundColor: '#1e293b',
          '&:hover': { backgroundColor: '#334155' },
          '&:disabled': { backgroundColor: '#cbd5e1' },
        }}
      >
        <FaPlus size={18} color="white" />
      </Fab>


      {/* Dialogs */}
      <AddHabitDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
        currentCount={habits.length}
        maxHabits={maxHabits}
      />
      <EditHabitDialog
        habit={editingHabit}
        onClose={() => setEditingHabit(null)}
        onRename={handleRename}
      />

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default function AppLayout() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setThemeMode(isDark ? 'dark' : 'light');

    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains('dark');
      setThemeMode(isDarkNow ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', nextTheme);
      return nextTheme;
    });
  }, []);

  const muiTheme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        palette: {
          mode: themeMode,
          primary: { main: themeMode === 'dark' ? '#c084fc' : '#1e293b' },
          secondary: { main: '#6366f1' },
          background: {
            default: themeMode === 'dark' ? '#0f0518' : '#f8fafc',
            paper: themeMode === 'dark' ? '#1a0b2e' : '#ffffff',
          },
        },
      }),
    [themeMode]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <MonthProvider>
        <AppContent themeMode={themeMode} toggleTheme={toggleTheme} />
      </MonthProvider>
    </ThemeProvider>
  );
}
