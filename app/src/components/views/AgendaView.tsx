/**
 * AgendaView.tsx
 * Chronological list of events grouped by date. Shows title, time range,
 * owner, tags, and status badge. Visually distinct coloured left-border strip.
 */

import type { CalendarEvent } from '../../types';

interface AgendaViewProps {
  events: CalendarEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: CalendarEvent) => void;
}

/** Format ISO string to "09:00" style (24h Korean). */
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Format ISO date to a readable Korean day label. */
function fmtDayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d); target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  const formatted = d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  if (diff === 0) return `오늘 — ${formatted}`;
  if (diff === 1) return `내일 — ${formatted}`;
  if (diff === -1) return `어제 — ${formatted}`;
  return formatted;
}

const STATUS_KO: Record<string, string> = {
  planned: '예정',
  'in-progress': '진행 중',
  blocked: '차단됨',
  done: '완료',
};

/** Group events by their date (YYYY-MM-DD). */
function groupByDate(events: CalendarEvent[]): { dateKey: string; events: CalendarEvent[] }[] {
  const map = new Map<string, CalendarEvent[]>();
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  for (const evt of sorted) {
    const key = evt.start.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(evt);
  }
  return Array.from(map.entries()).map(([dateKey, events]) => ({ dateKey, events }));
}

export function AgendaView({ events, selectedEventId, onSelectEvent }: AgendaViewProps) {
  const groups = groupByDate(events);
  const todayKey = new Date().toISOString().slice(0, 10);

  if (groups.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '64px 0' }}>
        <span className="empty-state-icon">📅</span>
        <span className="empty-state-text">표시할 일정이 없습니다. 프로젝트를 활성화하거나 새 일정을 추가하세요.</span>
      </div>
    );
  }

  return (
    <div className="agenda-view">
      {groups.map(({ dateKey, events: dayEvents }) => (
        <div key={dateKey} className="agenda-day-group">
          <p className={`agenda-day-label${dateKey === todayKey ? ' today' : ''}`}>
            {fmtDayLabel(dayEvents[0].start)}
          </p>
          {dayEvents.map((evt) => (
            <div
              key={evt.id}
              className={`agenda-event-row${selectedEventId === evt.id ? ' selected' : ''}`}
              onClick={() => onSelectEvent(evt)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectEvent(evt)}
            >
              {/* Color strip */}
              <div
                className="agenda-event-color"
                style={{ background: evt.color ?? 'var(--color-primary)' }}
              />

              <div className="agenda-event-info">
                <p className="agenda-event-title">{evt.title}</p>
                <div className="agenda-event-meta">
                  {!evt.allDay && (
                    <span>{fmtTime(evt.start)} – {fmtTime(evt.end)}</span>
                  )}
                  {evt.allDay && <span>종일</span>}
                  <span>{evt.owner}</span>
                  {evt.tags.length > 0 && (
                    <span>{evt.tags.map((t) => `#${t}`).join(' ')}</span>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <span className={`status-badge ${evt.status}`}>{STATUS_KO[evt.status] ?? evt.status}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
