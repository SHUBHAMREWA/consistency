import { useState, useEffect, useMemo } from 'react';
import { formatMonthLabel, getLocalizedDateTime } from '../../utils/date';
import { FaCalendarDay, FaClock, FaEarthAmericas } from 'react-icons/fa6';

interface DateTimeBannerProps {
  year: number;
  month: number;
}

export default function DateTimeBanner({ year, month }: DateTimeBannerProps) {
  const [dateTime, setDateTime] = useState(() => getLocalizedDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(getLocalizedDateTime());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() + 1 === month;
  }, [year, month]);

  return (
    <div className="mx-2 sm:mx-0 px-3 sm:px-5 py-2.5 rounded-xl bg-white/75 dark:bg-[#1a0b2e]/80 backdrop-blur-md border border-slate-200/70 dark:border-purple-800/50 shadow-xs flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm">
      {/* Date & Month */}
      <div className="flex items-center gap-2 text-slate-700 dark:text-purple-200">
        <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-purple-950/70 text-indigo-600 dark:text-purple-300">
          <FaCalendarDay size={13} />
        </span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-semibold text-slate-900 dark:text-purple-100">
            {dateTime.dateFormatted}
          </span>
          <span className="text-slate-400 dark:text-purple-400">·</span>
          <span className="text-slate-500 dark:text-purple-300">
            {formatMonthLabel(year, month)}
          </span>
          {!isCurrentMonth && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-purple-900/50 text-slate-600 dark:text-purple-300 font-medium">
              Viewing History
            </span>
          )}
        </div>
      </div>

      {/* Country Time & Timezone */}
      <div className="flex items-center gap-3 text-slate-600 dark:text-purple-300">
        <div className="flex items-center gap-1.5 font-medium">
          <FaClock size={12} className="text-indigo-500 dark:text-purple-400" />
          <span className="text-slate-800 dark:text-purple-100 font-semibold">{dateTime.timeFormatted}</span>
        </div>

        {dateTime.timeZone && (
          <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-purple-950/60 text-indigo-700 dark:text-purple-300 border border-indigo-100 dark:border-purple-800/50 font-medium">
            <FaEarthAmericas size={10} />
            <span>{dateTime.timeZone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
