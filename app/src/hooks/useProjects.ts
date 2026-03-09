import { useState, useEffect, useCallback } from 'react';
import type { Project } from '../types';
import { supabase } from '../lib/supabase';
import { dbProjectToProject, projectToDbRow } from '../lib/mappers';

const DEFAULT_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch on mount
  useEffect(() => {
    supabase.from('projects').select('*').order('order').then(({ data }) => {
      if (data) setProjects(data.map(dbProjectToProject));
    });
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProjects((prev) => {
            if (prev.some((p) => p.id === (payload.new as any).id)) return prev;
            return [...prev, dbProjectToProject(payload.new as any)];
          });
        } else if (payload.eventType === 'UPDATE') {
          setProjects((prev) =>
            prev.map((p) => (p.id === (payload.new as any).id ? dbProjectToProject(payload.new as any) : p))
          );
        } else if (payload.eventType === 'DELETE') {
          setProjects((prev) => prev.filter((p) => p.id !== (payload.old as any).id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateProject = useCallback(
    async (id: string, patch: Partial<Pick<Project, 'name' | 'color'>>) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      await supabase.from('projects').update(patch).eq('id', id);
    },
    []
  );

  const addProject = useCallback(async (name: string): Promise<Project> => {
    const color = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: name.trim() || '새 프로젝트',
      color,
      order: Date.now(),
      subcategories: [],
    };
    setProjects((prev) => [...prev, newProject]);
    await supabase.from('projects').insert(projectToDbRow(newProject));
    return newProject;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await supabase.from('projects').delete().eq('id', id);
  }, []);

  const addSubcategory = useCallback(async (projectId: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId && !p.subcategories.includes(trimmed)
          ? { ...p, subcategories: [...p.subcategories, trimmed] }
          : p
      )
    );
    const { data } = await supabase.from('projects').select('subcategories').eq('id', projectId).single();
    if (data && !data.subcategories.includes(trimmed)) {
      await supabase.from('projects').update({ subcategories: [...data.subcategories, trimmed] }).eq('id', projectId);
    }
  }, []);

  const deleteSubcategory = useCallback(async (projectId: string, label: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, subcategories: p.subcategories.filter((s) => s !== label) }
          : p
      )
    );
    const { data } = await supabase.from('projects').select('subcategories').eq('id', projectId).single();
    if (data) {
      await supabase.from('projects').update({ subcategories: data.subcategories.filter((s: string) => s !== label) }).eq('id', projectId);
    }
  }, []);

  return { projects, updateProject, addProject, deleteProject, addSubcategory, deleteSubcategory };
}
