/**
 * weekUtils.ts
 * ISO 8601 week calculation utilities (Monday-start weeks).
 */

/** Get the ISO week number for a date */
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Get the ISO week year (may differ from calendar year at year boundaries) */
function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
}

/** Get ISO week key for a date, e.g. '2026-W11' */
export function getWeekKey(date: Date): string {
  const year = getISOWeekYear(date);
  const week = getISOWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** Get start (Monday) and end (Sunday) dates for a week key */
export function getWeekRange(weekKey: string): { start: Date; end: Date } {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  // Jan 4 is always in ISO week 1
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // Monday=1 ... Sunday=7
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { start: monday, end: sunday };
}

/** Get previous or next week key by offset */
export function offsetWeek(weekKey: string, offset: number): string {
  const { start } = getWeekRange(weekKey);
  const target = new Date(start);
  target.setDate(target.getDate() + offset * 7);
  return getWeekKey(target);
}

/** Format week key to Korean display, e.g. '3월 2주차 (3/9 ~ 3/15)' */
export function formatWeekLabel(weekKey: string): string {
  const { start, end } = getWeekRange(weekKey);
  const month = start.getMonth() + 1;
  const weekInMonth = Math.ceil(start.getDate() / 7);
  const pad = (n: number) => String(n);
  return `${month}월 ${weekInMonth}주차 (${pad(start.getMonth() + 1)}/${pad(start.getDate())} ~ ${pad(end.getMonth() + 1)}/${pad(end.getDate())})`;
}

/** Get all 7 dates (Mon–Sun) for a given week key */
export function getWeekDates(weekKey: string): Date[] {
  const { start } = getWeekRange(weekKey);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** Convert a Date to 'YYYY-MM-DD' dateKey string */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format dateKey '2026-03-09' to Korean display '3월 9일 (월)' */
export function formatDayHeader(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00');
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`;
}
