/**
 * MemberCalendar.tsx
 * Personal calendar showing only this member's events.
 * Reuses MonthView with filtered events.
 */

import type { CalendarEvent } from '../../types';
import { MonthView } from '../views/MonthView';

interface MemberCalendarProps {
  memberId: string;
  events: CalendarEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: CalendarEvent) => void;
  onNewEvent: () => void;
}

export function MemberCalendar({
  memberId,
  events,
  selectedEventId,
  onSelectEvent,
  onNewEvent,
}: MemberCalendarProps) {
  const memberEvents = events.filter((e) => e.ownerId === memberId);

  return (
    <div className="member-calendar">
      <div className="member-calendar-header">
        <span className="member-calendar-count">일정 {memberEvents.length}건</span>
        <button className="btn btn-primary" onClick={onNewEvent}>
          + 새 일정
        </button>
      </div>
      <MonthView
        events={memberEvents}
        selectedEventId={selectedEventId}
        onSelectEvent={onSelectEvent}
      />
    </div>
  );
}
