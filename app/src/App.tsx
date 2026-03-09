/**
 * App.tsx
 * Root component — owns all shared state via useEvents hook plus view/UI state.
 */

import { useState, useEffect, useCallback } from 'react';
import './styles.css';

import type { CalendarEvent, ViewType } from './types';
import { useEvents } from './hooks/useEvents';
import { useProjects } from './hooks/useProjects';
import { useSharing } from './hooks/useSharing';
import { useMembers } from './hooks/useMembers';
import { useTodos } from './hooks/useTodos';
import { getWeekDates, toDateKey } from './utils/weekUtils';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DetailPanel } from './components/DetailPanel';
import { CommandPalette } from './components/CommandPalette';
import { EventEditorModal } from './components/modals/EventEditorModal';
import { ProjectManagerModal } from './components/modals/ProjectManagerModal';
import { ShareLinkModal } from './components/modals/ShareLinkModal';
import { WebhookManagerModal } from './components/modals/WebhookManagerModal';
import { MemberManagerModal } from './components/modals/MemberManagerModal';
import { MonthView } from './components/views/MonthView';
import { WeekView } from './components/views/WeekView';
import { TimelineView } from './components/views/TimelineView';
import { AgendaView } from './components/views/AgendaView';
import { DayEventsModal } from './components/modals/DayEventsModal';
import { MemberPage } from './components/member/MemberPage';
import { MemberSidebar } from './components/member/MemberSidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  // ── State ────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const { projects, updateProject, addProject, deleteProject, addSubcategory, deleteSubcategory } = useProjects();

  const [activeProjectIds, setActiveProjectIds] = useState<Set<string>>(
    () => new Set(projects.map((p) => p.id))
  );
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [projectManagerOpen, setProjectManagerOpen] = useState(false);
  const [dayModal, setDayModal] = useState<{ date: Date; events: CalendarEvent[] } | null>(null);
  const [memberManagerOpen, setMemberManagerOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(true);

  const {
    shareLinks,
    webhooks,
    createShareLink,
    deleteShareLink,
    addWebhook,
    updateWebhookStatus,
    deleteWebhook,
  } = useSharing();

  const {
    events,
    selectedEvent,
    selectEvent,
    openEditor,
    closeEditor,
    upsertEvent,
    removeEvent,
    syncProjectColor,
    removeEventsByProject,
    clearSubcategory,
    editor,
  } = useEvents();

  const { members, currentUser, switchUser, addMember, updateMember, removeMember } = useMembers();
  const { getTodosByMemberDate, addTodo, toggleTodo, removeTodo, getDailyProgress, getWeeklyProgress, removeTodosByMember } = useTodos();

  // ── Member page state ──────────────────────────────────────────
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const isMemberView = currentView === 'member';

  const handleOpenMemberView = useCallback((memberId?: string) => {
    setCurrentView('member');
    if (memberId) {
      setSelectedMemberId(memberId);
      setShowAdminDashboard(false);
    } else {
      setSelectedMemberId(currentUser.id);
      setShowAdminDashboard(false);
    }
  }, [currentUser.id]);

  const handleBackToCalendar = useCallback(() => {
    setCurrentView('month');
    setSelectedMemberId(null);
    setShowAdminDashboard(false);
  }, []);

  const handleSelectMember = useCallback((id: string) => {
    setSelectedMemberId(id);
    setShowAdminDashboard(false);
  }, []);

  const handleAdminDashboard = useCallback(() => {
    setSelectedMemberId(null);
    setShowAdminDashboard(true);
  }, []);

  const handleNewEventForMember = useCallback(() => {
    const member = members.find((m) => m.id === selectedMemberId);
    if (member) {
      openEditor('create', {
        id: '',
        title: '',
        description: '',
        projectId: projects[0]?.id ?? '',
        tags: [],
        owner: member.name,
        ownerId: member.id,
        status: 'planned',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
        allDay: false,
        updatedAt: new Date().toISOString(),
        updatedBy: member.name,
      });
    }
  }, [selectedMemberId, members, openEditor, projects]);

  const getTodoCount = useCallback(
    (memberId: string, weekKey: string) => {
      const dates = getWeekDates(weekKey);
      let total = 0;
      let completed = 0;
      for (const d of dates) {
        const dayTodos = getTodosByMemberDate(memberId, toDateKey(d));
        total += dayTodos.length;
        completed += dayTodos.filter((t) => t.completed).length;
      }
      return { total, completed };
    },
    [getTodosByMemberDate],
  );

  const [activeSubcategories, setActiveSubcategories] = useState<Map<string, Set<string>>>(
    () => new Map()
  );

  // ── Derived data ─────────────────────────────────────────────
  const visibleEvents = events.filter((e) => {
    if (!activeProjectIds.has(e.projectId)) return false;
    const activeSubs = activeSubcategories.get(e.projectId);
    if (activeSubs && activeSubs.size > 0) {
      return e.subcategory != null && activeSubs.has(e.subcategory);
    }
    return true;
  });
  const visibleProjects = projects.filter((p) => activeProjectIds.has(p.id));

  // ── Handlers ─────────────────────────────────────────────────
  const handleToggleProject = useCallback((id: string) => {
    setActiveProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSubcategory = useCallback((projectId: string, subcategory: string) => {
    setActiveSubcategories((prev) => {
      const next = new Map(prev);
      const subs = new Set(next.get(projectId) ?? []);
      if (subs.has(subcategory)) subs.delete(subcategory);
      else subs.add(subcategory);
      next.set(projectId, subs);
      return next;
    });
  }, []);

  const handleDeleteEvent = useCallback((event: CalendarEvent) => {
    const confirmed = window.confirm(`"${event.title}" 일정을 삭제하시겠습니까?`);
    if (confirmed) {
      removeEvent(event.id);
    }
  }, [removeEvent]);

  const handleShowMore = useCallback((date: Date, events: CalendarEvent[]) => {
    setDayModal({ date, events });
  }, []);

  // Keyboard shortcut: Ctrl/Cmd+K → command palette
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── 17:50 daily report notification (admin only) ──────────────
  useEffect(() => {
    if (currentUser.role !== 'admin') return;
    let notifiedToday = false;
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 17 && now.getMinutes() === 50 && !notifiedToday) {
        notifiedToday = true;
        if (Notification.permission === 'granted') {
          new Notification('일일 진행 리포트', {
            body: '오늘의 팀원 진행 상황을 확인하세요. 관리자 대시보드에서 리포트를 복사할 수 있습니다.',
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
      if (now.getHours() !== 17 || now.getMinutes() !== 50) {
        notifiedToday = false;
      }
    };
    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [currentUser.role]);

  // ── Auto-add event to assignee's todo list ────────────────────
  const handleSaveEvent = useCallback((event: CalendarEvent) => {
    const isNew = !events.some((e) => e.id === event.id);
    upsertEvent(event);
    if (isNew && event.ownerId) {
      const startDate = new Date(event.start);
      const dateKey = toDateKey(startDate);
      addTodo(event.ownerId, dateKey, event.title);
    }
  }, [events, upsertEvent, addTodo]);

  // ── Member management ──────────────────────────────────────────
  const handleRemoveMember = useCallback((id: string) => {
    removeMember(id);
    removeTodosByMember(id);
    if (selectedMemberId === id) {
      setSelectedMemberId(currentUser.id);
    }
  }, [removeMember, removeTodosByMember, selectedMemberId, currentUser.id]);

  // Safety: if currentUser was removed, fall back to first member
  useEffect(() => {
    if (!members.find((m) => m.id === currentUser.id) && members.length > 0) {
      switchUser(members[0].id);
    }
  }, [members, currentUser.id, switchUser]);

  // Open detail panel when an event is selected
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      selectEvent(event.id);
      setDetailPanelOpen(true);
    },
    [selectEvent]
  );

  // ── View change handler ────────────────────────────────────────
  const handleViewChange = useCallback((view: ViewType) => {
    if (view === 'member') {
      handleOpenMemberView();
    } else {
      setCurrentView(view);
      setSelectedMemberId(null);
      setShowAdminDashboard(false);
    }
  }, [handleOpenMemberView]);

  // ── Render ───────────────────────────────────────────────────
  const selectedMember = selectedMemberId ? members.find((m) => m.id === selectedMemberId) ?? null : null;

  return (
    <div className="app-shell">
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        onNewEvent={() => openEditor('create')}
        onCommandPalette={() => setCmdPaletteOpen(true)}
        onShare={() => setShareModalOpen(true)}
        currentUser={currentUser}
        members={members}
        onSwitchUser={switchUser}
        onOpenMemberView={handleOpenMemberView}
      />

      <div className="body-layout">
        {isMemberView ? (
          <MemberSidebar
            members={members}
            currentUser={currentUser}
            selectedMemberId={selectedMemberId}
            onSelectMember={handleSelectMember}
            onAdminDashboard={handleAdminDashboard}
            onBackToCalendar={handleBackToCalendar}
            onManageMembers={() => setMemberManagerOpen(true)}
          />
        ) : (
          <Sidebar
            projects={projects}
            activeProjectIds={activeProjectIds}
            onToggleProject={handleToggleProject}
            activeSubcategories={activeSubcategories}
            onToggleSubcategory={handleToggleSubcategory}
            onManageProjects={() => setProjectManagerOpen(true)}
            webhooks={webhooks}
            onManageWebhooks={() => setWebhookModalOpen(true)}
          />
        )}

        <main className="main-view">
          <div className="main-view-inner">
            {isMemberView ? (
              showAdminDashboard && currentUser.role === 'admin' ? (
                <AdminDashboard
                  members={members}
                  getWeeklyProgress={getWeeklyProgress}
                  getDailyProgress={getDailyProgress}
                  getTodoCount={getTodoCount}
                  onSelectMember={handleSelectMember}
                />
              ) : selectedMember ? (
                <MemberPage
                  member={selectedMember}
                  currentUser={currentUser}
                  events={events}
                  selectedEventId={selectedEvent?.id ?? null}
                  onSelectEvent={handleSelectEvent}
                  onNewEvent={handleNewEventForMember}
                  getTodosByMemberDate={getTodosByMemberDate}
                  getDailyProgress={getDailyProgress}
                  onAddTodo={addTodo}
                  onToggleTodo={toggleTodo}
                  onRemoveTodo={removeTodo}
                />
              ) : null
            ) : (
              <>
                {currentView === 'month' && (
                  <MonthView
                    events={visibleEvents}
                    selectedEventId={selectedEvent?.id ?? null}
                    onSelectEvent={handleSelectEvent}
                    onShowMore={handleShowMore}
                  />
                )}
                {currentView === 'week' && (
                  <WeekView
                    events={visibleEvents}
                    selectedEventId={selectedEvent?.id ?? null}
                    onSelectEvent={handleSelectEvent}
                  />
                )}
                {currentView === 'timeline' && (
                  <TimelineView
                    events={visibleEvents}
                    projects={visibleProjects}
                    selectedEventId={selectedEvent?.id ?? null}
                    onSelectEvent={handleSelectEvent}
                  />
                )}
                {currentView === 'agenda' && (
                  <AgendaView
                    events={visibleEvents}
                    selectedEventId={selectedEvent?.id ?? null}
                    onSelectEvent={handleSelectEvent}
                  />
                )}
              </>
            )}
          </div>
        </main>

        {!isMemberView && detailPanelOpen && (
          <DetailPanel
            event={selectedEvent}
            projects={projects}
            onEdit={(event) => openEditor('edit', event)}
            onDelete={handleDeleteEvent}
            onClose={() => setDetailPanelOpen(false)}
          />
        )}
      </div>

      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        onSelectView={handleViewChange}
        onNewEvent={() => {
          setCmdPaletteOpen(false);
          openEditor('create');
        }}
      />

      {editor.isOpen && (
        <EventEditorModal
          mode={editor.mode}
          initialEvent={editor.event}
          projects={projects}
          members={members}
          onSave={handleSaveEvent}
          onClose={closeEditor}
        />
      )}

      {projectManagerOpen && (
        <ProjectManagerModal
          projects={projects}
          onUpdateProject={(id, patch) => {
            updateProject(id, patch);
            if (patch.color) syncProjectColor(id, patch.color);
          }}
          onAddProject={(name) => {
            const newProj = addProject(name);
            setActiveProjectIds((prev) => new Set([...prev, newProj.id]));
          }}
          onDeleteProject={(id) => {
            deleteProject(id);
            removeEventsByProject(id);
            setActiveProjectIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
            setActiveSubcategories((prev) => {
              const next = new Map(prev);
              next.delete(id);
              return next;
            });
          }}
          onAddSubcategory={addSubcategory}
          onDeleteSubcategory={(projectId, label) => {
            deleteSubcategory(projectId, label);
            clearSubcategory(projectId, label);
            setActiveSubcategories((prev) => {
              const next = new Map(prev);
              const subs = new Set(next.get(projectId) ?? []);
              subs.delete(label);
              next.set(projectId, subs);
              return next;
            });
          }}
          onClose={() => setProjectManagerOpen(false)}
        />
      )}

      {shareModalOpen && (
        <ShareLinkModal
          shareLinks={shareLinks}
          onCreateLink={createShareLink}
          onDeleteLink={deleteShareLink}
          onClose={() => setShareModalOpen(false)}
        />
      )}

      {webhookModalOpen && (
        <WebhookManagerModal
          webhooks={webhooks}
          onAddWebhook={addWebhook}
          onUpdateStatus={updateWebhookStatus}
          onDeleteWebhook={deleteWebhook}
          onClose={() => setWebhookModalOpen(false)}
        />
      )}

      {memberManagerOpen && (
        <MemberManagerModal
          members={members}
          currentUser={currentUser}
          onAddMember={addMember}
          onUpdateMember={updateMember}
          onRemoveMember={handleRemoveMember}
          onClose={() => setMemberManagerOpen(false)}
        />
      )}

      {dayModal && (
        <DayEventsModal
          date={dayModal.date}
          events={dayModal.events}
          onSelectEvent={handleSelectEvent}
          onClose={() => setDayModal(null)}
        />
      )}
    </div>
  );
}
