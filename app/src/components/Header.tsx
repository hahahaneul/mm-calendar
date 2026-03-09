/**
 * Header.tsx
 * Top navigation bar: logo, view toggle, new-event button, user display + logout.
 */

import type { ViewType, Member } from '../types';
import { ViewToggle } from './ViewToggle';

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onNewEvent: () => void;
  onCommandPalette: () => void;
  currentUser: Member;
  onOpenMemberView: () => void;
  onSignOut: () => Promise<void>;
}

export function Header({
  currentView,
  onViewChange,
  onNewEvent,
  onCommandPalette,
  currentUser,
  onOpenMemberView,
  onSignOut,
}: HeaderProps) {
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

        <button className="btn btn-ghost">
          필터
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

        {/* Current user + logout */}
        <div className="user-switcher">
          <div className="user-switcher-btn" style={{ cursor: 'default' }}>
            <span
              className="user-switcher-avatar"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.name.charAt(0)}
            </span>
            <span className="user-switcher-name">{currentUser.name}</span>
          </div>
          <button
            className="btn btn-ghost"
            onClick={onSignOut}
            style={{ fontSize: '12px', padding: '4px 8px' }}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
