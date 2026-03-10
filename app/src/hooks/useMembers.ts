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
    const { data, error } = await supabase.functions.invoke('invite-member', {
      body: { name, email, role },
    });

    if (error) throw new Error(error.message || '팀원 초대에 실패했습니다.');
    if (data?.error) throw new Error(data.error);

    const newMember: Member = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      color: data.color,
    };

    // Optimistically add (realtime will also fire INSERT)
    setMembers((prev) => {
      if (prev.some((m) => m.id === newMember.id)) return prev;
      return [...prev, newMember];
    });

    return newMember;
  }, []);

  const updateMember = useCallback(async (id: string, patch: Partial<Pick<Member, 'name' | 'email' | 'role' | 'color'>>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    await supabase.from('profiles').update(patch).eq('id', id);
  }, []);

  const removeMember = useCallback(async (id: string) => {
    // Optimistic removal
    setMembers((prev) => prev.filter((m) => m.id !== id));

    const { data, error } = await supabase.functions.invoke('remove-member', {
      body: { memberId: id },
    });

    if (error || data?.error) {
      // Revert: refetch all members on failure
      const { data: refreshed } = await supabase.from('profiles').select('*');
      if (refreshed) setMembers(refreshed.map(dbProfileToMember));
      throw new Error(error?.message || data?.error || '팀원 삭제에 실패했습니다.');
    }
  }, []);

  return { members, currentUser, getMember, switchUser, addMember, updateMember, removeMember };
}
