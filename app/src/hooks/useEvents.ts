/**
 * useEvents.ts
 * Central state hook for calendar events.
 * Owns the events array, selection, and editor open/close state.
 */

import { useState, useCallback } from 'react';
import type { CalendarEvent } from '../types';
import { SAMPLE_EVENTS } from '../data/sampleEvents';

export type EditorMode = 'create' | 'edit';

export interface EditorState {
  isOpen: boolean;
  mode: EditorMode;
  event?: CalendarEvent;
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(SAMPLE_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    SAMPLE_EVENTS[0] ?? null
  );
  const [editor, setEditor] = useState<EditorState>({ isOpen: false, mode: 'create' });

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

  const upsertEvent = useCallback((event: CalendarEvent) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === event.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = event;
        return next;
      }
      return [...prev, event];
    });
    setSelectedEvent(event);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEvent((prev) => (prev?.id === id ? null : prev));
    setEditor((prev) => ({ ...prev, isOpen: false }));
  }, []);

  /** Bulk-update the color of all events belonging to a project. */
  const syncProjectColor = useCallback((projectId: string, color: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.projectId === projectId ? { ...e, color } : e))
    );
    setSelectedEvent((prev) =>
      prev?.projectId === projectId ? { ...prev, color } : prev
    );
  }, []);

  /** Remove all events belonging to a project (called when deleting a project). */
  const removeEventsByProject = useCallback((projectId: string) => {
    setEvents((prev) => prev.filter((e) => e.projectId !== projectId));
    setSelectedEvent((prev) => (prev?.projectId === projectId ? null : prev));
  }, []);

  /** Clear a subcategory value from all events in a project (called when deleting a subcategory). */
  const clearSubcategory = useCallback((projectId: string, subcategory: string) => {
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
