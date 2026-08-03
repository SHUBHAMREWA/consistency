import { createContext, useContext, useState, type ReactNode } from 'react';
import { getCurrentYearMonth } from '../utils/date';

interface MonthContextValue {
  year: number;
  month: number;
  setYearMonth: (year: number, month: number) => void;
}

const MonthContext = createContext<MonthContextValue | null>(null);

export function MonthProvider({ children }: { children: ReactNode }) {
  const { year, month } = getCurrentYearMonth();
  const [selected, setSelected] = useState({ year, month });

  const setYearMonth = (y: number, m: number) => setSelected({ year: y, month: m });

  return (
    <MonthContext.Provider value={{ year: selected.year, month: selected.month, setYearMonth }}>
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth(): MonthContextValue {
  const ctx = useContext(MonthContext);
  if (!ctx) throw new Error('useMonth must be used inside MonthProvider');
  return ctx;
}
