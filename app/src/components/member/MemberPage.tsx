/**
 * MemberPage.tsx
 * Personal page layout: member header, tab toggle (daily todos / personal calendar).
 */

import { useState } from 'react';
import type { CalendarEvent, Member, TodoItem } from '../../types';
import { TodoSection } from './TodoSection';
import { MemberCalendar } from './MemberCalendar';

type MemberTab = 'todos' | 'calendar';

interface MemberPageProps {
  member: Member;
  currentUser: Member;
  events: CalendarEvent[];
  selectedEventId: string | null;
  onSelectEvent: (event: CalendarEvent) => void;
  onNewEvent: () => void;
  // todo callbacks
  getTodosByMemberDate: (memberId: string, dateKey: string) => TodoItem[];
  getDailyProgress: (memberId: string, dateKey: string) => { total: number; completed: number; percent: number };
  onAddTodo: (memberId: string, dateKey: string, title: string) => void;
  onToggleTodo: (id: string) => void;
  onRemoveTodo: (id: string) => void;
}

export function MemberPage({
  member,
  currentUser,
  events,
  selectedEventId,
  onSelectEvent,
  onNewEvent,
  getTodosByMemberDate,
  getDailyProgress,
  onAddTodo,
  onToggleTodo,
  onRemoveTodo,
}: MemberPageProps) {
  const [activeTab, setActiveTab] = useState<MemberTab>('todos');

  // Admin can view others' todos but in read-only mode
  const isOwnPage = currentUser.id === member.id;
  const isAdmin = currentUser.role === 'admin';
  const todosReadOnly = !isOwnPage && !isAdmin ? true : !isOwnPage;

  return (
    <div className="member-page">
      {/* Member header */}
      <div className="member-page-header">
        <div className="member-page-avatar" style={{ backgroundColor: member.color }}>
          {member.name.charAt(0)}
        </div>
        <div className="member-page-info">
          <h2 className="member-page-name">{member.name}</h2>
          <span className="member-page-role">
            {member.role === 'admin' ? '관리자' : '팀원'}
          </span>
          <span className="member-page-email">{member.email}</span>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="member-page-tabs">
        <button
          className={`member-page-tab${activeTab === 'todos' ? ' active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          주간 할 일
        </button>
        <button
          className={`member-page-tab${activeTab === 'calendar' ? ' active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          개인 일정
        </button>
      </div>

      {/* Tab content */}
      <div className="member-page-content">
        {activeTab === 'todos' && (
          <TodoSection
            memberId={member.id}
            getTodosByMemberDate={getTodosByMemberDate}
            getDailyProgress={getDailyProgress}
            onAdd={onAddTodo}
            onToggle={onToggleTodo}
            onRemove={onRemoveTodo}
            readOnly={todosReadOnly}
          />
        )}
        {activeTab === 'calendar' && (
          <MemberCalendar
            memberId={member.id}
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={onSelectEvent}
            onNewEvent={onNewEvent}
          />
        )}
      </div>
    </div>
  );
}
