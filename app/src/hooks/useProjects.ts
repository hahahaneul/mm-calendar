/**
 * useProjects.ts
 * Manages project list state. Initialized from static PROJECTS sample data.
 * Exposes updateProject, addProject, deleteProject, addSubcategory, deleteSubcategory.
 */

import { useState, useCallback } from 'react';
import type { Project } from '../types';
import { PROJECTS } from '../data/sampleEvents';

const DEFAULT_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
];

let customCounter = 0;

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(PROJECTS);

  const updateProject = useCallback(
    (id: string, patch: Partial<Pick<Project, 'name' | 'color'>>) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    },
    []
  );

  const addProject = useCallback((name: string): Project => {
    customCounter += 1;
    const id = `proj_custom_${customCounter}`;
    const color = DEFAULT_COLORS[(customCounter - 1) % DEFAULT_COLORS.length];
    const newProject: Project = {
      id,
      name: name.trim() || '새 프로젝트',
      color,
      order: Date.now(),
      subcategories: [],
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addSubcategory = useCallback((projectId: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId && !p.subcategories.includes(trimmed)
          ? { ...p, subcategories: [...p.subcategories, trimmed] }
          : p
      )
    );
  }, []);

  const deleteSubcategory = useCallback((projectId: string, label: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, subcategories: p.subcategories.filter((s) => s !== label) }
          : p
      )
    );
  }, []);

  return { projects, updateProject, addProject, deleteProject, addSubcategory, deleteSubcategory };
}
