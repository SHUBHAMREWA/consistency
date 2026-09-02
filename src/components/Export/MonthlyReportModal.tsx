import { useState, useRef, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { toPng, toBlob } from 'html-to-image';
import {
  FaDownload,
  FaShareNodes,
  FaCopy,
  FaCheck,
  FaFire,
  FaTrophy,
  FaChartLine,
} from 'react-icons/fa6';
import type { Habit, DailyScore } from '../../types/habit';
import { formatMonthLabel, getDaysInMonth, formatDateKey, todayKey } from '../../utils/date';

interface MonthlyReportModalProps {
  open: boolean;
  onClose: () => void;
  year: number;
  month: number;
  habits: Habit[];
  dailyScores: DailyScore[];
}

export default function MonthlyReportModal({
  open,
  onClose,
  year,
  month,
  habits,
  dailyScores,
}: MonthlyReportModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const monthLabel = useMemo(() => formatMonthLabel(year, month), [year, month]);
  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  // Compute metrics
  const { totalCompleted, completionRate, habitStats } = useMemo(() => {
    const today = todayKey();
    const validScores = dailyScores.filter((d) => formatDateKey(year, month, d.day) <= today);

    const completed = validScores.reduce((sum, d) => sum + d.score, 0);
    const possible = validScores.reduce((sum, d) => sum + d.total, 0);
    const rate = possible > 0 ? Math.round((completed / possible) * 100) : 0;

    // Individual habit stats
    const stats = habits.map((habit) => {
      let habitCompletedDays = 0;
      dailyScores.forEach((score) => {
        if (score.score > 0) habitCompletedDays++;
      });
      const count = Math.min(habitCompletedDays, daysInMonth);
      const pct = Math.round((count / daysInMonth) * 100);
      return {
        id: habit.id,
        name: habit.title,
        count,
        pct,
      };
    });

    return {
      totalCompleted: completed,
      completionRate: rate,
      habitStats: stats,
    };
  }, [dailyScores, habits, year, month, daysInMonth]);

  // Generate image data URL
  const generatePng = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    return await toPng(cardRef.current, {
      quality: 0.95,
      pixelRatio: 2, // High-res retina
      backgroundColor: '#130429',
    });
  };

  // Download PNG file
  const handleDownload = async () => {
    try {
      setLoading(true);
      const dataUrl = await generatePng();
      if (!dataUrl) return;

      const link = document.createElement('a');
      link.download = `habittrack-${monthLabel.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setLoading(false);
    }
  };

  // Share using Web Share API with image file
  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      setLoading(true);
      const blob = await toBlob(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#130429',
      });

      if (!blob) return;

      const fileName = `habittrack-${monthLabel.toLowerCase().replace(/\s+/g, '-')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Check if browser supports sharing files (Mobile Chrome, Safari, Android, iOS)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My ${monthLabel} Habit Progress`,
          text: `🎯 Check out my habit consistency for ${monthLabel}! Completed ${totalCompleted} checkmarks with a ${completionRate}% score on HabitTrack.`,
        });
      } else if (navigator.share) {
        // Fallback: Share text and trigger download
        handleDownload();
        await navigator.share({
          title: `My ${monthLabel} Habit Progress`,
          text: `🎯 Check out my habit consistency for ${monthLabel}! ${completionRate}% completed on HabitTrack: https://habittrack.app`,
          url: window.location.origin,
        });
      } else {
        // Fallback: Just download
        handleDownload();
      }
    } catch (_err) {
      // User cancelled share
    } finally {
      setLoading(false);
    }
  };

  // Copy PNG image to clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      setLoading(true);
      const blob = await toBlob(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#130429',
      });

      if (!blob) return;

      if (typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Failed to copy image to clipboard:', err);
      handleDownload();
    } finally {
      setLoading(false);
    }
  };

  // Build SVG polyline points for the mini graph curve
  const svgGraphPoints = useMemo(() => {
    if (dailyScores.length === 0) return '';
    const width = 460;
    const height = 100;
    const padding = 10;
    const maxScore = Math.max(...dailyScores.map((d) => d.total), 1);

    const stepX = (width - padding * 2) / Math.max(dailyScores.length - 1, 1);

    return dailyScores
      .map((d, index) => {
        const x = padding + index * stepX;
        const normalizedY = d.score / maxScore;
        const y = height - padding - normalizedY * (height - padding * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [dailyScores]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#150628' : '#ffffff'),
            color: (theme) => (theme.palette.mode === 'dark' ? '#f3e8ff' : '#1e293b'),
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '1px solid rgba(147, 51, 234, 0.3)'
                : '1px solid #e2e8f0',
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300">
              <FaChartLine size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-purple-50">
                Download & Share Monthly Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-purple-300">
                Export your graph and habit consistency for {monthLabel}
              </p>
            </div>
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'rgba(147, 51, 234, 0.15)', p: { xs: 2, sm: 3 } }}>
        <div className="flex flex-col items-center">
          {/* THE EXPORTABLE CARD (Captured by html-to-image) */}
          <div
            ref={cardRef}
            style={{ width: '100%', maxWidth: '500px' }}
            className="rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-purple-500/30 font-sans"
            // Using inline styling for robust image capture
            sx-capture="true"
          >
            {/* Direct gradient background applied inline for canvas capture */}
            <div
              style={{
                background: 'linear-gradient(135deg, #130429 0%, #220942 50%, #15062c 100%)',
                margin: '-24px',
                padding: '24px',
                borderRadius: '16px',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-purple-800/40">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/logo4.webp"
                    alt="HabitTrack"
                    className="w-9 h-9 object-contain"
                    crossOrigin="anonymous"
                  />
                  <div>
                    <h4 className="font-extrabold text-base tracking-tight text-white">
                      HabitTrack
                    </h4>
                    <p className="text-[11px] text-purple-300 font-medium">
                      Monthly Consistency Report
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-900/60 border border-purple-600/40 text-purple-200">
                    {monthLabel}
                  </span>
                </div>
              </div>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-3 gap-2.5 my-4">
                {/* Completion Rate */}
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/40 text-center">
                  <p className="text-2xl font-black text-purple-200">
                    {completionRate}%
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mt-0.5">
                    Completion
                  </p>
                </div>

                {/* Total Checkmarks */}
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/40 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FaTrophy size={13} className="text-amber-400" />
                    <span className="text-2xl font-black text-amber-200">
                      {totalCompleted}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mt-0.5">
                    Checkmarks
                  </p>
                </div>

                {/* Active Habits */}
                <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/40 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FaFire size={13} className="text-rose-400" />
                    <span className="text-2xl font-black text-rose-200">
                      {habits.length}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold mt-0.5">
                    Habits
                  </p>
                </div>
              </div>

              {/* Monthly Consistency Graph Curve */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-purple-800/40 my-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-purple-200 flex items-center gap-1.5">
                    <FaChartLine size={12} className="text-purple-400" />
                    Daily Consistency Graph
                  </span>
                  <span className="text-[10px] text-purple-400">
                    Days 1 – {daysInMonth}
                  </span>
                </div>

                {/* SVG Curve Graph */}
                <div className="w-full h-24 relative flex items-end">
                  <svg
                    viewBox="0 0 460 100"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    {svgGraphPoints && (
                      <polygon
                        points={`10,90 ${svgGraphPoints} 450,90`}
                        fill="url(#curveGradient)"
                      />
                    )}

                    {/* Polyline */}
                    {svgGraphPoints && (
                      <polyline
                        fill="none"
                        stroke="#c084fc"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={svgGraphPoints}
                      />
                    )}
                  </svg>
                </div>
              </div>

              {/* Habit Highlights List */}
              {habits.length > 0 && (
                <div className="space-y-2 my-3">
                  <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Tracked Habits
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-hidden">
                    {habitStats.slice(0, 4).map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-purple-950/40 border border-purple-800/30"
                      >
                        <span className="font-semibold text-purple-100 truncate max-w-[200px]">
                          {h.name}
                        </span>
                        <span className="text-[11px] font-mono text-purple-300">
                          {h.count}/{daysInMonth} days
                        </span>
                      </div>
                    ))}
                    {habitStats.length > 4 && (
                      <p className="text-[10px] text-center text-purple-400 font-medium">
                        + {habitStats.length - 4} more habits tracked
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Watermark Footer */}
              <div className="pt-3 mt-3 border-t border-purple-800/30 flex items-center justify-between text-[10px] text-purple-400 font-medium">
                <span>🎯 Track consistency month by month</span>
                <span className="font-semibold text-purple-300">habittrack.app</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? <CircularProgress size={14} color="inherit" /> : <FaDownload size={13} />}
          <span>{downloaded ? 'Downloaded! ✓' : 'Download PNG Image'}</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-purple-700 dark:text-purple-200 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-800/60 border border-purple-300 dark:border-purple-700 transition-all cursor-pointer disabled:opacity-50"
        >
          <FaShareNodes size={13} />
          <span>Share to Anywhere</span>
        </button>

        {/* Copy Image Button */}
        <button
          type="button"
          onClick={handleCopyImage}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 dark:text-purple-300 bg-slate-100 hover:bg-slate-200 dark:bg-[#201038] dark:hover:bg-purple-900/30 border border-slate-200 dark:border-purple-800/60 transition-all cursor-pointer disabled:opacity-50"
        >
          {copied ? <FaCheck size={13} className="text-green-500" /> : <FaCopy size={13} />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Image'}</span>
        </button>

        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'text.secondary',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
