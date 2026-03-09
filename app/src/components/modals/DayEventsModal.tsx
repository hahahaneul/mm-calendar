/**
 * DayEventsModal.tsx
 * Shows all events for a specific date. Clicking an event selects it and closes the modal.
 */

import type { CalendarEvent } from '../../types';

interface DayEventsModalProps {
  date: Date;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onClose: () => void;
}

const STATUS_KO: Record<string, string> = {
  planned: '예정',
  'in-progress': '진행 중',
  blocked: '차단됨',
  done: '완료',
};

function fmtTime(iso: string, allDay: boolean): string {
  if (allDay) return '하루 종일';
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function DayEventsModal({ date, events, onSelectEvent, onClose }: DayEventsModalProps) {
  const dateLabel = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${dateLabel} 일정 목록`}
    >
      <div
        className="modal-sheet"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{dateLabel}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* Event list */}
        <div className="modal-body" style={{ padding: '8px 0' }}>
          {events.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <span className="empty-state-icon">📋</span>
              <span className="empty-state-text">일정이 없습니다</span>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {events.map((event) => (
                <li
                  key={event.id}
                  className="day-events-modal-item"
                  onClick={() => { onSelectEvent(event); onClose(); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && (onSelectEvent(event), onClose())}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Color badge */}
                  <span
                    className="day-events-modal-color"
                    style={{ background: event.color ?? '#6366f1' }}
                  />
                  <div className="day-events-modal-info">
                    <span className="day-events-modal-title">{event.title}</span>
                    <span className="day-events-modal-time">
                      {event.allDay
                        ? '하루 종일'
                        : `${fmtTime(event.start, false)} ~ ${fmtTime(event.end, false)}`}
                    </span>
                  </div>
                  <span className={`status-badge ${event.status}`}>
                    {STATUS_KO[event.status] ?? event.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
