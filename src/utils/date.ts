export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getUserLocale(): string {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'default';
}

export function formatMonthLabel(year: number, month: number, locale?: string): string {
  const userLocale = locale || getUserLocale();
  return new Intl.DateTimeFormat(userLocale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

export function getLocalizedDateTime(date: Date = new Date(), locale?: string) {
  const userLocale = locale || getUserLocale();
  const dateFormatted = new Intl.DateTimeFormat(userLocale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);

  const timeFormatted = new Intl.DateTimeFormat(userLocale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  const timeZone =
    new Intl.DateTimeFormat(userLocale, { timeZoneName: 'short' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value || '';

  return { dateFormatted, timeFormatted, timeZone };
}

export function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function todayKey(): string {
  const now = new Date();
  return formatDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function prevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

export function nextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}
