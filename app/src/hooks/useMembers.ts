import { useState, useEffect, useCallback } from 'react';
import type { Member } from '../types';
import { supabase } from '../lib/supabase';
import { dbProfileToMember } from '../lib/mappers';
import { useAuth } from '../contexts/AuthContext';

export function useMembers() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);

  // Fetch on mount
  useEffect(() => {
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) setMembers(data.map(dbProfileToMember));
    });
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMembers((prev) => {
            if (prev.some((m) => m.id === (payload.new as any).id)) return prev;
            return [...prev, dbProfileToMember(payload.new as any)];
          });
        } else if (payload.eventType === 'UPDATE') {
          setMembers((prev) =>
            prev.map((m) => (m.id === (payload.new as any).id ? dbProfileToMember(payload.new as any) : m))
          );
        } else if (payload.eventType === 'DELETE') {
          setMembers((prev) => prev.filter((m) => m.id !== (payload.old as any).id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const currentUser: Member = profile ?? { id: '', name: '', email: '', role: 'member', color: '#3B82F6' };

  const getMember = useCallback(
    (id: string) => members.find((m) => m.id === id) ?? null,
    [members],
  );

  // switchUser is a no-op now (real auth handles this)
  const switchUser = useCallback((_id: string) => {}, []);

  const addMember = useCallback(async (name: string, email: string, role: 'admin' | 'member'): Promise<Member> => {
    // For now, just add to local state. In production, this would call an Edge Function to invite.
    const tempMember: Member = { id: crypto.randomUUID(), name, email, role, color: '#3B82F6' };
    setMembers((prev) => [...prev, tempMember]);
    return tempMember;
  }, []);

  const updateMember = useCallback(async (id: string, patch: Partial<Pick<Member, 'name' | 'email' | 'role' | 'color'>>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    await supabase.from('profiles').update(patch).eq('id', id);
  }, []);

  const removeMember = useCallback(async (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    // In production, this would call an Edge Function to delete the auth user
  }, []);

  return { members, currentUser, getMember, switchUser, addMember, updateMember, removeMember };
}
