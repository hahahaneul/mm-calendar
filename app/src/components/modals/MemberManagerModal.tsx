/**
 * MemberManagerModal.tsx
 * Admin-only modal for managing team members: add, edit, remove.
 */

import { useState } from 'react';
import type { Member } from '../../types';

interface MemberManagerModalProps {
  members: Member[];
  currentUser: Member;
  onAddMember: (name: string, email: string, role: 'admin' | 'member') => Member | Promise<Member>;
  onUpdateMember: (id: string, patch: Partial<Pick<Member, 'name' | 'email' | 'role' | 'color'>>) => void;
  onRemoveMember: (id: string) => void;
  onClose: () => void;
}

export function MemberManagerModal({
  members,
  currentUser,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onClose,
}: MemberManagerModalProps) {
  const [drafts, setDrafts] = useState<Record<string, { name: string; email: string; role: string; color: string }>>(
    () =>
      Object.fromEntries(
        members.map((m) => [m.id, { name: m.name, email: m.email, role: m.role, color: m.color }]),
      ),
  );
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');

  function handleFieldChange(id: string, field: 'name' | 'email', value: string) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function handleFieldBlur(id: string, field: 'name' | 'email') {
    const value = drafts[id]?.[field]?.trim();
    if (value) onUpdateMember(id, { [field]: value });
  }

  function handleRoleChange(id: string, role: string) {
    // Prevent removing the last admin
    if (role === 'member') {
      const adminCount = members.filter((m) => m.role === 'admin').length;
      const member = members.find((m) => m.id === id);
      if (member?.role === 'admin' && adminCount <= 1) {
        window.alert('최소 1명의 관리자가 필요합니다.');
        return;
      }
    }
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], role } }));
    onUpdateMember(id, { role: role as 'admin' | 'member' });
  }

  function handleColorChange(id: string, color: string) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], color } }));
    onUpdateMember(id, { color });
  }

  function handleDelete(member: Member) {
    // Cannot delete yourself
    if (member.id === currentUser.id) {
      window.alert('본인 계정은 삭제할 수 없습니다.');
      return;
    }
    // Cannot delete the last admin
    if (member.role === 'admin') {
      const adminCount = members.filter((m) => m.role === 'admin').length;
      if (adminCount <= 1) {
        window.alert('최소 1명의 관리자가 필요합니다.');
        return;
      }
    }
    const confirmed = window.confirm(
      `"${member.name}" 팀원을 삭제하시겠습니까?\n해당 팀원의 할 일이 삭제됩니다. 일정은 유지됩니다.`,
    );
    if (confirmed) {
      onRemoveMember(member.id);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[member.id];
        return next;
      });
    }
  }

  async function handleAdd() {
    const name = newName.trim() || '새 팀원';
    const email = newEmail.trim();
    const added = await onAddMember(name, email, newRole);
    setDrafts((prev) => ({
      ...prev,
      [added.id]: { name: added.name, email: added.email, role: added.role, color: added.color },
    }));
    setNewName('');
    setNewEmail('');
    setNewRole('member');
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 580 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">팀원 관리</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 16, listStyle: 'none', padding: 0, margin: 0 }}>
            {members.map((m) => {
              const draft = drafts[m.id] ?? { name: m.name, email: m.email, role: m.role, color: m.color };
              const isSelf = m.id === currentUser.id;
              return (
                <li
                  key={m.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {/* Row 1: color + name + role + delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Color picker */}
                    <label style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} title="색상 변경">
                      <span
                        style={{
                          display: 'block',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: draft.color,
                          border: '2px solid var(--color-border)',
                        }}
                      />
                      <input
                        type="color"
                        value={draft.color}
                        onChange={(e) => handleColorChange(m.id, e.target.value)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </label>

                    {/* Name input */}
                    <input
                      className="form-input"
                      type="text"
                      value={draft.name}
                      onChange={(e) => handleFieldChange(m.id, 'name', e.target.value)}
                      onBlur={() => handleFieldBlur(m.id, 'name')}
                      onKeyDown={(e) => e.key === 'Enter' && handleFieldBlur(m.id, 'name')}
                      style={{ flex: 1 }}
                      placeholder="이름"
                    />

                    {/* Role select */}
                    <select
                      className="form-input"
                      value={draft.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      style={{ width: 90, flexShrink: 0 }}
                    >
                      <option value="admin">관리자</option>
                      <option value="member">팀원</option>
                    </select>

                    {/* Delete button */}
                    <button
                      className="btn btn-ghost"
                      title={isSelf ? '본인 계정은 삭제 불가' : '팀원 삭제'}
                      onClick={() => handleDelete(m)}
                      disabled={isSelf}
                      style={{
                        color: isSelf ? 'var(--color-text-tertiary)' : 'var(--color-danger, #ef4444)',
                        padding: '4px 8px',
                        flexShrink: 0,
                      }}
                    >
                      삭제
                    </button>
                  </div>

                  {/* Row 2: email */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 38 }}>
                    <input
                      className="form-input"
                      type="email"
                      value={draft.email}
                      onChange={(e) => handleFieldChange(m.id, 'email', e.target.value)}
                      onBlur={() => handleFieldBlur(m.id, 'email')}
                      onKeyDown={(e) => e.key === 'Enter' && handleFieldBlur(m.id, 'email')}
                      style={{ flex: 1, fontSize: 12 }}
                      placeholder="이메일"
                    />
                    {isSelf && (
                      <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, flexShrink: 0 }}>
                        내 계정
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="modal-footer" style={{ flexDirection: 'column', gap: 10, alignItems: 'stretch' }}>
          {/* Add member form */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="form-input"
              type="text"
              placeholder="이름"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              style={{ flex: 1 }}
            />
            <input
              className="form-input"
              type="email"
              placeholder="이메일"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              style={{ flex: 1 }}
            />
            <select
              className="form-input"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'member')}
              style={{ width: 90, flexShrink: 0 }}
            >
              <option value="member">팀원</option>
              <option value="admin">관리자</option>
            </select>
            <button className="btn btn-ghost" onClick={handleAdd} style={{ flexShrink: 0 }}>
              팀원 추가
            </button>
          </div>
          <button className="btn btn-primary" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
}
