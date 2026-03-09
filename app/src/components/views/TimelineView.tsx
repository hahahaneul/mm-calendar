/**
 * TimelineView.tsx
 * Horizontal Gantt-style view. Each project gets its own row with
 * coloured bars proportional to event duration. Scrollable horizontally.
 * A vertical "today" line is drawn over the grid.
 */

import type { CalendarEvent, Project } from '../../types';

interface TimelineViewProps {
  events: CalendarEvent[];
  projects: Project[];
  selectedEventId: string | null;
  onSelectEvent: (event: CalendarEvent) => void;
}

const DAY_WIDTH = 40; // px per day
const VISIBLE_DAYS = 35; // ~5 weeks centred on today

/** Format a Date to short "3월 9일" style label. */
function fmtTick(d: Date): string {
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

/** Generate an array of Date objects starting from `start` for `count` days. */
function buildDayRange(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function TimelineView({ events, projects, selectedEventId, onSelectEvent }: TimelineViewProps) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Start timeline 7 days before today
  const rangeStart = new Date(now);
  rangeStart.setDate(now.getDate() - 7);
  const days = buildDayRange(rangeStart, VISIBLE_DAYS);

  const totalWidth = days.length * DAY_WIDTH;

  /** Return left offset (px) for a given date. */
  function dateToX(date: Date): number {
    const d = new Date(date); d.setHours(0,0,0,0);
    const diff = (d.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
    return diff * DAY_WIDTH;
  }

  /** Return bar width (px) for an event. Minimum 1 day width. */
  function eventWidth(event: CalendarEvent): number {
    const s = new Date(event.start); s.setHours(0,0,0,0);
    const e = new Date(event.end);   e.setHours(0,0,0,0);
    const days = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return days * DAY_WIDTH - 4; // 4px gap
  }

  const todayX = dateToX(now);

  return (
    <div className="timeline-view" style={{ minWidth: totalWidth + 160 }}>
      {/* Header: row label column + day ticks */}
      <div className="timeline-header">
        <div className="timeline-row-label">프로젝트</div>
        <div className="timeline-days-header" style={{ position: 'relative', width: totalWidth }}>
          {days.map((d, i) => {
            const isToday = d.toDateString() === now.toDateString();
            // Only label every 3 days to avoid crowding
            const showLabel = i % 3 === 0;
            return (
              <div
                key={d.toISOString()}
                className={`timeline-day-tick${isToday ? ' today' : ''}`}
                style={{ position: 'absolute', left: i * DAY_WIDTH, width: DAY_WIDTH }}
              >
                {showLabel ? fmtTick(d) : ''}
              </div>
            );
          })}
          {/* Today vertical marker */}
          <div
            className="timeline-today-line"
            style={{ left: todayX + DAY_WIDTH / 2 }}
          />
        </div>
      </div>

      {/* One row per project */}
      {projects.map((proj) => {
        const projEvents = events.filter((e) => e.projectId === proj.id);
        return (
          <div key={proj.id} className="timeline-row">
            <div className="timeline-project-label">
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', background: proj.color, flexShrink: 0 }}
              />
              {proj.name}
            </div>

            <div className="timeline-bars-area" style={{ width: totalWidth, position: 'relative' }}>
              {/* Grid lines */}
              {days.map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: i * DAY_WIDTH,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: 'var(--color-border)',
                    opacity: 0.5,
                  }}
                />
              ))}

              {/* Today line */}
              <div
                style={{
                  position: 'absolute',
                  left: todayX + DAY_WIDTH / 2,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: 'var(--color-primary)',
                  opacity: 0.25,
                  zIndex: 1,
                }}
              />

              {projEvents.map((evt) => {
                const left = Math.max(0, dateToX(new Date(evt.start)));
                const width = eventWidth(evt);
                // Skip if entirely out of view
                if (left > totalWidth || left + width < 0) return null;
                return (
                  <div
                    key={evt.id}
                    className={`timeline-bar${selectedEventId === evt.id ? ' selected' : ''}`}
                    style={{
                      left,
                      width: Math.min(width, totalWidth - left),
                      background: evt.color ?? proj.color,
                      zIndex: 2,
                    }}
                    onClick={() => onSelectEvent(evt)}
                    title={`${evt.title}\n${evt.start} – ${evt.end}`}
                  >
                    {evt.title}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {projects.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">🗂</span>
          <span className="empty-state-text">표시할 프로젝트가 없습니다. 사이드바에서 프로젝트를 활성화하세요.</span>
        </div>
      )}
    </div>
  );
}
