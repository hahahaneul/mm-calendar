/**
 * MemberSidebar.tsx
 * Sidebar showing member list for navigation + admin dashboard button.
 */

import type { Member } from '../../types';

interface MemberSidebarProps {
  members: Member[];
  currentUser: Member;
  selectedMemberId: string | null;
  onSelectMember: (id: string) => void;
  onAdminDashboard: () => void;
  onBackToCalendar: () => void;
  onManageMembers: () => void;
}

export function MemberSidebar({
  members,
  currentUser,
  selectedMemberId,
  onSelectMember,
  onAdminDashboard,
  onBackToCalendar,
  onManageMembers,
}: MemberSidebarProps) {
  const isAdmin = currentUser.role === 'admin';
  const visibleMembers = isAdmin ? members : members.filter((m) => m.id === currentUser.id);

  return (
    <aside className="sidebar member-sidebar">
      {/* Back to calendar */}
      <button className="btn btn-ghost member-sidebar-back" onClick={onBackToCalendar}>
        ← 팀 캘린더
      </button>

      <div className="sidebar-section">
        <p className="sidebar-section-title">팀원</p>
        <ul className="member-list">
          {visibleMembers.map((member) => (
            <li key={member.id}>
              <button
                className={`member-list-item${selectedMemberId === member.id ? ' active' : ''}`}
                onClick={() => onSelectMember(member.id)}
              >
                <span className="member-avatar-dot" style={{ backgroundColor: member.color }} />
                <span className="member-list-name">{member.name}</span>
                {member.role === 'admin' && <span className="member-list-badge">관리자</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {isAdmin && (
        <div className="sidebar-section">
          <button
            className={`btn btn-ghost member-admin-btn${selectedMemberId === null ? ' active' : ''}`}
            onClick={onAdminDashboard}
          >
            관리자 대시보드
          </button>
          <button
            className="btn btn-ghost member-admin-btn"
            onClick={onManageMembers}
          >
            팀원 관리
          </button>
        </div>
      )}
    </aside>
  );
}
