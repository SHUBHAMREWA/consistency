import { Suspense, lazy } from 'react';
import type { DailyScore } from '../../types/habit';
import { formatMonthLabel } from '../../utils/date';

const ScoreGraph = lazy(() => import('./ScoreGraph'));

interface GraphGridProps {
  dailyScores: DailyScore[];
  year: number;
  month: number;
  habitCount: number;
}

export default function GraphGrid({ dailyScores, year, month, habitCount }: GraphGridProps) {
  const totalCompleted = dailyScores.reduce((sum, d) => sum + d.score, 0);
  const maxPossible = dailyScores.reduce((sum, d) => sum + d.total, 0);
  const rate = maxPossible > 0 ? Math.round((totalCompleted / maxPossible) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-800">Daily Score</h2>
          <p className="text-xs text-slate-400 mt-0.5">{formatMonthLabel(year, month)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">{rate}%</p>
          <p className="text-xs text-slate-400">completion rate</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 bg-indigo-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-indigo-700">{totalCompleted}</p>
          <p className="text-xs text-indigo-400 mt-0.5">total ✔</p>
        </div>
        <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-slate-700">{maxPossible - totalCompleted}</p>
          <p className="text-xs text-slate-400 mt-0.5">missed</p>
        </div>
        <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-700">{habitCount}</p>
          <p className="text-xs text-green-400 mt-0.5">habits</p>
        </div>
      </div>

      {/* Chart */}
      <Suspense
        fallback={
          <div className="h-64 flex items-center justify-center text-slate-300 text-sm">
            Loading chart…
          </div>
        }
      >
        <ScoreGraph dailyScores={dailyScores} year={year} month={month} />
      </Suspense>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-center">
        <div className="w-4 h-0.5 bg-indigo-500 rounded" />
        <span className="text-xs text-slate-400">Daily completed habits</span>
        <div className="w-4 h-0.5 bg-indigo-500/40 rounded border-dashed ml-2" />
        <span className="text-xs text-slate-400">Today</span>
      </div>
    </div>
  );
}
