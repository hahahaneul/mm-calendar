/**
 * useSelection.ts
 * Manages which event is currently selected in the detail panel.
 */

import { useState, useCallback } from 'react';

export function useSelection() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  /** Select an event by id, or deselect if the same id is passed again (toggle). */
  const selectEvent = useCallback((id: string) => {
    setSelectedEventId((prev) => (prev === id ? null : id));
  }, []);

  const clearSelection = useCallback(() => setSelectedEventId(null), []);

  return { selectedEventId, selectEvent, clearSelection };
}
