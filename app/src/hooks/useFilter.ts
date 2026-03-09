/**
 * useFilter.ts
 * Manages the set of active project IDs used by the sidebar toggles.
 * By default every project is active (show all).
 */

import { useState, useCallback } from 'react';
import type { Project } from '../types';

export function useFilter(projects: Project[]) {
  // Start with all projects visible
  const [activeProjectIds, setActiveProjectIds] = useState<Set<string>>(
    () => new Set(projects.map((p) => p.id)),
  );

  /** Toggle a single project on/off. */
  const toggleProject = useCallback((id: string) => {
    setActiveProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /** Re-enable all projects at once. */
  const showAll = useCallback(() => {
    setActiveProjectIds(new Set(projects.map((p) => p.id)));
  }, [projects]);

  return { activeProjectIds, toggleProject, showAll };
}
