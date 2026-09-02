import { useState, useCallback, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { FaPlus, FaMoon, FaSun, FaClockRotateLeft, FaBell, FaShareNodes } from 'react-icons/fa6';

import { MonthProvider, useMonth } from '../../context/MonthContext';
import { useHabit } from '../../hooks/useHabit';
import { useScore } from '../../hooks/useScore';

import MonthSelector from '../Month/MonthSelector';
import HabitTable from '../Habit/HabitTable';
import AddHabitDialog from '../Habit/AddHabitDialog';
import EditHabitDialog from '../Habit/EditHabitDialog';
import ImportHabitsDialog from '../Habit/ImportHabitsDialog';
import GraphGrid from '../Graph/GraphGrid';
import DateTimeBanner from './DateTimeBanner';
import InstallPwaPrompt, { FooterInstallButton } from '../PWA/InstallPwaPrompt';
import NotificationSettingsDialog from '../Notifications/NotificationSettingsDialog';
import ShareDialog, { FooterShareButtons } from '../Share/ShareDialog';
import { checkAndSendScheduledReminders } from '../../utils/notifications';

import type { Habit } from '../../types/habit';

function AppContent({ themeMode, toggleTheme }: { themeMode: 'light' | 'dark'; toggleTheme: () => void }) {
  const { year, month, setYearMonth } = useMonth();
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    // Check reminders on mount and periodically every 60s
    checkAndSendScheduledReminders();
    const timer = setInterval(() => {
      checkAndSendScheduledReminders();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const { habits, loading: habitsLoading, addHabit, addHabits, renameHabit, deleteHabit, reorderHabits } =
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

  const handleImportHabits = useCallback(
    async (titles: string[]) => {
      const result = await addHabits(titles);
      if (result.success) {
        setSnackbar({
          open: true,
          message: `Imported ${result.count} habit${result.count > 1 ? 's' : ''}!`,
          severity: 'success',
        });
      } else if (result.error) {
        setSnackbar({ open: true, message: result.error, severity: 'error' });
      }
    },
    [addHabits]
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
    <div className="bg-white dark:bg-[#1a0b2e] sm:rounded-2xl border-y sm:border border-slate-100 dark:border-purple-800/50 sm:shadow-sm overflow-hidden">
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
          onAddHabit={() => setAddOpen(true)}
          onImportPrevious={() => setImportOpen(true)}
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
      habits={habits}
    />
  );

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#0f0518] dark:via-[#130722] dark:to-[#1a0b2e]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f0518]/80 backdrop-blur-md border-b border-slate-100 dark:border-purple-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-1 sm:gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1.5 sm:gap-3 shrink-0 hover:opacity-90 transition-opacity">
            <img src="/logo4.webp" alt="HabitTrack Logo" className="h-8 sm:h-11 md:h-12 w-auto object-contain drop-shadow-sm" />
            <span className="font-bold text-slate-800 dark:text-purple-100 text-base sm:text-lg md:text-xl tracking-tight hidden sm:block">
              HabitTrack
            </span>
          </a>

          {/* Month selector */}
          <MonthSelector year={year} month={month} onChange={setYearMonth} />

          {/* Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            {/* Habit Reminders button */}
            <Tooltip title="Funny Habit Reminders">
              <IconButton
                onClick={() => setNotifOpen(true)}
                size="small"
                sx={{ color: 'text.primary', p: { xs: 0.75, sm: 1 } }}
                aria-label="Daily habit reminders"
              >
                <FaBell size={15} className="text-purple-600 dark:text-purple-300" />
              </IconButton>
            </Tooltip>

            {/* Share button */}
            <Tooltip title="Share with Friends">
              <IconButton
                onClick={() => setShareOpen(true)}
                size="small"
                sx={{ color: 'text.primary', p: { xs: 0.75, sm: 1 } }}
                aria-label="Share with friends"
              >
                <FaShareNodes size={15} className="text-indigo-600 dark:text-purple-300" />
              </IconButton>
            </Tooltip>

            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{ color: 'text.primary', p: { xs: 0.75, sm: 1 } }}
              aria-label="Toggle dark mode"
            >
              {themeMode === 'dark' ? <FaSun size={16} color="#c084fc" /> : <FaMoon size={16} />}
            </IconButton>

            {/* Import button (mobile icon) */}
            <div className="flex md:hidden items-center">
              <Tooltip title="Import from previous month">
                <IconButton
                  onClick={() => setImportOpen(true)}
                  size="small"
                  sx={{ color: 'text.primary', p: { xs: 0.75, sm: 1 } }}
                  aria-label="Import habits from previous month"
                >
                  <FaClockRotateLeft size={15} />
                </IconButton>
              </Tooltip>
            </div>

            {/* Import button (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <Tooltip title="Import habits from previous month">
                <span>
                  <button
                    type="button"
                    onClick={() => setImportOpen(true)}
                    className="flex items-center gap-2 bg-white dark:bg-purple-950/60 hover:bg-slate-100 dark:hover:bg-purple-900/60 text-slate-700 dark:text-purple-200 text-sm font-semibold px-3.5 py-2 rounded-xl border border-slate-200 dark:border-purple-800/60 shadow-sm transition-colors cursor-pointer"
                  >
                    <FaClockRotateLeft size={13} className="text-indigo-600 dark:text-purple-300" />
                    <span>Import Previous</span>
                  </button>
                </span>
              </Tooltip>
            </div>

            {/* Add button (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <Tooltip title="Add habit">
                <span>
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-0 sm:px-6 lg:px-8 py-2 sm:py-6 pb-20 md:pb-10">
        <div className="flex flex-col gap-4 sm:gap-6">
          {habitPanel}
          <DateTimeBanner year={year} month={month} />
          {graphPanel}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-purple-900/40 bg-white/70 dark:bg-[#120722]/80 backdrop-blur-sm py-8 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <img src="/logo4.webp" alt="HabitTrack Logo" className="h-8 sm:h-9 w-auto object-contain" />
              <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-purple-200">HabitTrack</span>
              <span className="text-xs text-slate-400 dark:text-purple-400">· 100% Offline & Private</span>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-full">
              <nav className="flex flex-wrap justify-center items-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-purple-300 max-w-full">
                <a href="/tools" className="inline-flex flex-wrap items-center justify-center gap-1.5 hover:text-indigo-600 dark:hover:text-purple-200 transition-colors text-center">
                  <span>Important Tools & Apps for Students & Learners</span>
                  <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold shrink-0">
                    (Click to see)
                  </span>
                </a>
                <a href="/about" className="hover:text-indigo-600 dark:hover:text-purple-200 transition-colors">About</a>
                <a href="/how-to-use" className="hover:text-indigo-600 dark:hover:text-purple-200 transition-colors">How to Use</a>
                <a href="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-purple-200 transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-indigo-600 dark:hover:text-purple-200 transition-colors">Terms & Conditions</a>
              </nav>

              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 max-w-full">
                <FooterShareButtons />
                <FooterInstallButton />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-purple-900/30 text-center text-xs text-slate-400 dark:text-purple-400">
            <p>© {new Date().getFullYear()} HabitTrack. Free, open, client-side monthly habit tracker.</p>
          </div>
        </div>
      </footer>

      {/* FAB (mobile) */}
      <Fab
        color="primary"
        aria-label="Add habit"
        onClick={() => setAddOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 20,
          display: { xs: 'flex', md: 'none' },
          backgroundColor: '#1e293b',
          '&:hover': { backgroundColor: '#334155' },
        }}
      >
        <FaPlus size={18} color="white" />
      </Fab>


      {/* Dialogs */}
      <AddHabitDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />
      <EditHabitDialog
        habit={editingHabit}
        onClose={() => setEditingHabit(null)}
        onRename={handleRename}
      />
      <ImportHabitsDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        year={year}
        month={month}
        currentHabits={habits}
        onImport={handleImportHabits}
      />

      {/* PWA Download / Install Popup */}
      <InstallPwaPrompt />

      {/* Habit Reminders Settings Dialog */}
      <NotificationSettingsDialog
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />

      {/* Share with Friends Dialog */}
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
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
