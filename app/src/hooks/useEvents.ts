import { useState, useEffect, useCallback } from 'react';
import type { CalendarEvent } from '../types';
import { supabase } from '../lib/supabase';
import { dbEventToCalendarEvent, calendarEventToDbRow } from '../lib/mappers';

export type EditorMode = 'create' | 'edit';

export interface EditorState {
  isOpen: boolean;
  mode: EditorMode;
  event?: CalendarEvent;
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editor, setEditor] = useState<EditorState>({ isOpen: false, mode: 'create' });

  // Fetch on mount
  useEffect(() => {
    supabase.from('events').select('*').then(({ data }) => {
      if (data) {
        const mapped = data.map(dbEventToCalendarEvent);
        setEvents(mapped);
        if (mapped.length > 0) setSelectedEvent(mapped[0]);
      }
    });
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEvents((prev) => {
            if (prev.some((e) => e.id === (payload.new as any).id)) return prev;
            return [...prev, dbEventToCalendarEvent(payload.new as any)];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updated = dbEventToCalendarEvent(payload.new as any);
          setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
          setSelectedEvent((prev) => (prev?.id === updated.id ? updated : prev));
        } else if (payload.eventType === 'DELETE') {
          const deletedId = (payload.old as any).id;
          setEvents((prev) => prev.filter((e) => e.id !== deletedId));
          setSelectedEvent((prev) => (prev?.id === deletedId ? null : prev));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const selectEvent = useCallback((id: string) => {
    setSelectedEvent((prev) => {
      if (prev?.id === id) return prev;
      return events.find((e) => e.id === id) ?? null;
    });
  }, [events]);

  const openEditor = useCallback((mode: EditorMode, existingEvent?: CalendarEvent) => {
    setEditor({ isOpen: true, mode, event: existingEvent });
  }, []);

  const closeEditor = useCallback(() => {
    setEditor((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const upsertEvent = useCallback(async (event: CalendarEvent) => {
    const isNew = !event.id || event.id === '';
    const eventWithId = isNew ? { ...event, id: crypto.randomUUID() } : event;

    // Optimistic update
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === eventWithId.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = eventWithId;
        return next;
      }
      return [...prev, eventWithId];
    });
    setSelectedEvent(eventWithId);

    const row = calendarEventToDbRow(eventWithId);
    await supabase.from('events').upsert(row);
  }, []);

  const removeEvent = useCallback(async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEvent((prev) => (prev?.id === id ? null : prev));
    setEditor((prev) => ({ ...prev, isOpen: false }));
    await supabase.from('events').delete().eq('id', id);
  }, []);

  const syncProjectColor = useCallback(async (projectId: string, color: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.projectId === projectId ? { ...e, color } : e))
    );
    setSelectedEvent((prev) =>
      prev?.projectId === projectId ? { ...prev, color } : prev
    );
    await supabase.from('events').update({ color }).eq('project_id', projectId);
  }, []);

  const removeEventsByProject = useCallback(async (projectId: string) => {
    setEvents((prev) => prev.filter((e) => e.projectId !== projectId));
    setSelectedEvent((prev) => (prev?.projectId === projectId ? null : prev));
    // CASCADE handles this in DB, but we clear local state too
  }, []);

  const clearSubcategory = useCallback(async (projectId: string, subcategory: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.projectId === projectId && e.subcategory === subcategory
          ? { ...e, subcategory: undefined }
          : e
      )
    );
    setSelectedEvent((prev) =>
      prev?.projectId === projectId && prev.subcategory === subcategory
        ? { ...prev, subcategory: undefined }
        : prev
    );
    await supabase.from('events').update({ subcategory: null }).eq('project_id', projectId).eq('subcategory', subcategory);
  }, []);

  return {
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
  };
}
