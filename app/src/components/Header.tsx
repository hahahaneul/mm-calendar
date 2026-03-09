/**
 * Header.tsx
 * Top navigation bar: logo, view toggle, global filter hints, share & new-event buttons.
 * Now includes team member navigation and user switcher.
 */

import { useState } from 'react';
import type { ViewType, Member } from '../types';
import { ViewToggle } from './ViewToggle';

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onNewEvent: () => void;
  onCommandPalette: () => void;
  onShare: () => void;
  currentUser: Member;
  members: Member[];
  onSwitchUser: (id: string) => void;
  onOpenMemberView: () => void;
}

export function Header({
  currentView,
  onViewChange,
  onNewEvent,
  onCommandPalette,
  onShare,
  currentUser,
  members,
  onSwitchUser,
  onOpenMemberView,
}: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="header">
      {/* Logo */}
      <div className="header-logo">
        MM<span>CL</span>
      </div>

      {/* Center: view switcher */}
      <div className="header-center">
        <ViewToggle currentView={currentView} onViewChange={onViewChange} />
      </div>

      {/* Right actions */}
      <div className="header-right">
        <button
          className="btn btn-ghost"
          onClick={onCommandPalette}
          title="명령어 팔레트 (⌘K)"
        >
          <span>⌘K</span>
        </button>

        {/* Global filters placeholder */}
        <button className="btn btn-ghost">
          필터
        </button>

        <button className="btn btn-ghost" onClick={onShare}>
          공유
        </button>

        <button
          className={`btn btn-ghost${currentView === 'member' ? ' btn-active' : ''}`}
          onClick={() => onOpenMemberView()}
        >
          팀원
        </button>

        <button className="btn btn-primary" onClick={onNewEvent}>
          + 새 일정
        </button>

        {/* User switcher */}
        <div className="user-switcher">
          <button
            className="user-switcher-btn"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title="사용자 전환"
          >
            <span
              className="user-switcher-avatar"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.name.charAt(0)}
            </span>
            <span className="user-switcher-name">{currentUser.name}</span>
          </button>

          {userMenuOpen && (
            <div className="user-switcher-menu">
              {members.map((m) => (
                <button
                  key={m.id}
                  className={`user-switcher-option${m.id === currentUser.id ? ' active' : ''}`}
                  onClick={() => {
                    onSwitchUser(m.id);
                    setUserMenuOpen(false);
                  }}
                >
                  <span
                    className="user-switcher-option-dot"
                    style={{ backgroundColor: m.color }}
                  />
                  {m.name}
                  {m.role === 'admin' && <span className="user-switcher-badge">관리자</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
