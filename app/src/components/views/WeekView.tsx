/**
 * WeekView.tsx
 * 7-day grid with hourly rows (0–23). All-day events render in a sticky header row.
 * Timed events are placed absolutely within their time slot columns.
 */

import React from 'react';
import type { CalendarEvent } from '../../types';

interface WeekViewProps {
  events: CalendarEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Get the 7 dates for the week containing `now` (Sun–Sat). */
function getWeekDays(now: Date): Date[] {
  const day = now.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - day + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

/** Return all-day events covering `date`. */
function allDayOnDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter((e) => {
    if (!e.allDay) return false;
    const s = new Date(e.start); s.setHours(0,0,0,0);
    const en = new Date(e.end);  en.setHours(23,59,59,999);
    return date >= s && date <= en;
  });
}

/** Return timed events that start on `date`. */
function timedOnDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter((e) => {
    if (e.allDay) return false;
    const s = new Date(e.start);
    return sameDay(s, date);
  });
}

const DAY_SHORT = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_SHORT = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

export function WeekView({ events, selectedEventId, onSelectEvent }: WeekViewProps) {
  const now = new Date();
  const days = getWeekDays(now);

  return (
    <div className="week-view">
      {/* Day header row */}
      <div className="week-grid-header">
        <div className="week-time-gutter" />
        {days.map((d) => {
          const isToday = sameDay(d, now);
          return (
            <div key={d.toISOString()} className={`week-day-col-header${isToday ? ' today' : ''}`}>
              <span className="day-num">{d.getDate()}</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {MONTH_SHORT[d.getMonth()]} {DAY_SHORT[d.getDay()]}
              </span>
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      <div className="week-allday-row">
        <div className="week-allday-label">종일</div>
        {days.map((d) => (
          <div key={d.toISOString()} className="week-allday-cell">
            {allDayOnDay(events, d).map((evt) => (
              <div
                key={evt.id}
                className={`event-card${selectedEventId === evt.id ? ' selected' : ''}`}
                style={{ background: `${evt.color}22`, color: evt.color, borderLeftColor: evt.color }}
                onClick={() => onSelectEvent(evt)}
                title={evt.title}
              >
                {evt.title}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Hourly grid body */}
      <div className="week-body">
        {HOURS.map((hour) => (
          // React.Fragment with key avoids missing-key warning for sibling elements
          <React.Fragment key={hour}>
            <div className="week-hour-label">
              {hour === 0 ? '' : `${String(hour).padStart(2, '0')}:00`}
            </div>
            {days.map((d) => {
              const cellEvents = timedOnDay(events, d).filter((e) => {
                const startH = new Date(e.start).getHours();
                return startH === hour;
              });
              return (
                <div key={`${d.toISOString()}-${hour}`} className="week-day-cell">
                  {cellEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`event-card${selectedEventId === evt.id ? ' selected' : ''}`}
                      style={{
                        background: `${evt.color}22`,
                        color: evt.color,
                        borderLeftColor: evt.color,
                        marginBottom: 2,
                      }}
                      onClick={() => onSelectEvent(evt)}
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
