import { useState, useCallback, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { FaPlus } from 'react-icons/fa6';

import { MonthProvider, useMonth } from '../../context/MonthContext';
import { useHabit } from '../../hooks/useHabit';
import { useScore } from '../../hooks/useScore';

import MonthSelector from '../Month/MonthSelector';
import HabitTable from '../Habit/HabitTable';
import AddHabitDialog from '../Habit/AddHabitDialog';
import EditHabitDialog from '../Habit/EditHabitDialog';
import GraphGrid from '../Graph/GraphGrid';
import MobileTabs from '../Mobile/MobileTabs';

import type { Habit } from '../../types/habit';

function AppContent() {
  const { year, month, setYearMonth } = useMonth();
  const [addOpen, setAddOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [mobileTab, setMobileTab] = useState<'habits' | 'graph'>('habits');
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
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-2 sm:py-6 pb-24 md:pb-10">
        {/* Desktop: stacked layout — habits on top, graph below */}
        <div className="hidden md:flex flex-col gap-6">
          {habitPanel}
          {graphPanel}
        </div>

        {/* Mobile: tabs */}
        <div className="md:hidden">
          {mobileTab === 'habits' ? habitPanel : graphPanel}
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
          bottom: 84,
          right: 20,
          display: { xs: 'flex', md: 'none' },
          backgroundColor: '#1e293b',
          '&:hover': { backgroundColor: '#334155' },
          '&:disabled': { backgroundColor: '#cbd5e1' },
        }}
      >
        <FaPlus size={18} color="white" />
      </Fab>

      {/* Mobile tabs */}
      <MobileTabs activeTab={mobileTab} onChange={setMobileTab} />

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
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const muiTheme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: { main: prefersDarkMode ? '#c084fc' : '#1e293b' },
          secondary: { main: '#6366f1' },
          background: {
            default: prefersDarkMode ? '#0f0518' : '#f8fafc',
            paper: prefersDarkMode ? '#1a0b2e' : '#ffffff',
          },
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <MonthProvider>
        <AppContent />
      </MonthProvider>
    </ThemeProvider>
  );
}
