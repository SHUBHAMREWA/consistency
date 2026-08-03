import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { DailyScore } from '../../types/habit';
import { buildGraphData, getMaxScore } from '../../utils/graph';

interface ScoreGraphProps {
  dailyScores: DailyScore[];
  year: number;
  month: number;
}

interface TooltipPayloadEntry {
  value: number;
  payload: { total: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const score = payload[0]?.value ?? 0;
  const total = payload[0]?.payload?.total ?? 0;

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-slate-700 mb-1">Day {label}</p>
      <p className="text-indigo-600 font-semibold">
        {score} / {total} completed
      </p>
      {total > 0 && (
        <p className="text-slate-400 text-xs mt-0.5">
          {Math.round((score / total) * 100)}% success rate
        </p>
      )}
    </div>
  );
}

export default function ScoreGraph({ dailyScores, year, month }: ScoreGraphProps) {
  const data = useMemo(() => buildGraphData(dailyScores), [dailyScores]);
  const maxScore = useMemo(() => getMaxScore(dailyScores), [dailyScores]);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDay = isCurrentMonth ? today.getDate() : null;

  if (maxScore === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-300">
        <div className="text-4xl mb-3">📈</div>
        <p className="text-sm font-medium text-slate-400">No data yet</p>
        <p className="text-xs text-slate-300 mt-1">Add habits and start tracking</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: Math.max(600, data.length * 28) }}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, maxScore]}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
            {todayDay && (
              <ReferenceLine
                x={String(todayDay)}
                stroke="#6366f1"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
            )}
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#scoreGradient)"
              dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#4f46e5' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
