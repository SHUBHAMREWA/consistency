import { useState, useEffect, useMemo } from 'react';
import { formatMonthLabel, getLocalizedDateTime } from '../../utils/date';
import { FaCalendarDay, FaClock } from 'react-icons/fa6';

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
    <div className="mx-2 sm:mx-0 px-3 sm:px-4 py-2 rounded-xl bg-white/80 dark:bg-[#1a0b2e]/80 backdrop-blur-md border border-slate-200/70 dark:border-purple-800/50 shadow-xs flex items-center justify-between gap-2 text-xs sm:text-sm whitespace-nowrap overflow-hidden">
      {/* Date & Active Month in single row */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <span className="p-1 sm:p-1.5 rounded-lg bg-indigo-50 dark:bg-purple-950/70 text-indigo-600 dark:text-purple-300 shrink-0">
          <FaCalendarDay size={12} />
        </span>
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-slate-900 dark:text-purple-100 text-[11px] sm:text-xs md:text-sm truncate">
            {dateTime.dateFormatted}
          </span>
          {!isCurrentMonth && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold shrink-0">
              {formatMonthLabel(year, month)}
            </span>
          )}
        </div>
      </div>

      {/* Local Time & Country Timezone */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 text-slate-600 dark:text-purple-300">
        <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-purple-100 text-[11px] sm:text-xs md:text-sm">
          <FaClock size={11} className="text-indigo-500 dark:text-purple-400 shrink-0" />
          <span>{dateTime.timeFormatted}</span>
        </div>

        {dateTime.timeZone && (
          <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-purple-950/60 text-indigo-700 dark:text-purple-300 border border-indigo-100 dark:border-purple-800/50 font-medium">
            {dateTime.timeZone}
          </span>
        )}
      </div>
    </div>
  );
}
