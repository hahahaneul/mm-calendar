/**
 * useMembers.ts
 * Manages the team member list and current user (for demo user-switching).
 */

import { useState, useCallback } from 'react';
import type { Member } from '../types';
import { MEMBERS } from '../data/sampleEvents';

const DEFAULT_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

let memberCounter = 0;

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(MEMBERS);
  const [currentUser, setCurrentUser] = useState<Member>(MEMBERS[0]);

  const getMember = useCallback(
    (id: string) => members.find((m) => m.id === id) ?? null,
    [members],
  );

  const switchUser = useCallback(
    (id: string) => {
      const member = members.find((m) => m.id === id);
      if (member) setCurrentUser(member);
    },
    [members],
  );

  const addMember = useCallback((name: string, email: string, role: 'admin' | 'member'): Member => {
    memberCounter += 1;
    const id = `member_custom_${Date.now()}_${memberCounter}`;
    const color = DEFAULT_COLORS[(members.length + memberCounter) % DEFAULT_COLORS.length];
    const newMember: Member = { id, name: name.trim(), email: email.trim(), role, color };
    setMembers((prev) => [...prev, newMember]);
    return newMember;
  }, [members.length]);

  const updateMember = useCallback((id: string, patch: Partial<Pick<Member, 'name' | 'email' | 'role' | 'color'>>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    setCurrentUser((prev) => (prev.id === id ? { ...prev, ...patch } : prev));
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { members, currentUser, getMember, switchUser, addMember, updateMember, removeMember };
}
