/**
 * MonthView.tsx
 * Classic 7-column calendar grid showing the current month.
 * Events spanning multiple days show on each day they cover.
 */

import type { CalendarEvent } from '../../types';

interface MonthViewProps {
  events: CalendarEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: CalendarEvent) => void;
  onShowMore?: (date: Date, events: CalendarEvent[]) => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** Build a 6-row × 7-col grid of dates for the given year/month (0-indexed). */
function buildMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0 = Sunday
  const grid: Date[] = [];
  const start = new Date(year, month, 1 - startOffset);
  for (let i = 0; i < 42; i++) {
    grid.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return grid;
}

/** Returns true if `date` falls within [start, end] (day-level). */
function eventOnDay(event: CalendarEvent, date: Date): boolean {
  const d = date.getTime();
  const s = new Date(event.start).setHours(0, 0, 0, 0);
  const e = new Date(event.end).setHours(23, 59, 59, 999);
  return d >= s && d <= e;
}

export function MonthView({ events, selectedEventId, onSelectEvent, onShowMore }: MonthViewProps) {
  // Display current month relative to today
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const grid = buildMonthGrid(year, month);
  const todayStr = now.toDateString();

  return (
    <div className="month-view">
      {/* Day-of-week headers */}
      <div className="month-header-row">
        {DAY_LABELS.map((d) => (
          <div key={d} className="month-day-header">{d}</div>
        ))}
      </div>

      <div className="month-grid">
        {grid.map((date) => {
          const isToday = date.toDateString() === todayStr;
          const isOtherMonth = date.getMonth() !== month;
          const dayEvents = events.filter((e) => eventOnDay(e, date));
          const overflow = dayEvents.length - 3;

          return (
            <div
              key={date.toISOString()}
              className={[
                'month-cell',
                isOtherMonth ? 'other-month' : '',
                isToday ? 'today' : '',
              ].join(' ')}
            >
              <span className="month-cell-date">{date.getDate()}</span>
              {dayEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={`event-card${selectedEventId === event.id ? ' selected' : ''}`}
                  style={{
                    background: `${event.color}22`,
                    color: event.color,
                    borderLeftColor: event.color,
                  }}
                  onClick={() => onSelectEvent(event)}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {overflow > 0 && (
                <button
                  className="month-show-more-btn"
                  onClick={() => onShowMore?.(date, dayEvents)}
                >
                  +{overflow}개 더보기
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
