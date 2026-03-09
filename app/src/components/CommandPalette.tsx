/**
 * CommandPalette.tsx
 * Modal command palette triggered by Ctrl/Cmd+K.
 * Displays static suggestions filtered by the typed query.
 * Keyboard navigation: ↑↓ to move, Enter to select, Esc to close.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ViewType } from '../types';

interface Suggestion {
  id: string;
  icon: string;
  label: string;
  hint: string;
  action: string; // discriminator for handling
  payload?: ViewType;
}

const STATIC_SUGGESTIONS: Suggestion[] = [
  { id: 's1', icon: '📅', label: '월간 보기로 전환',    hint: '보기',    action: 'view', payload: 'month'    },
  { id: 's2', icon: '📅', label: '주간 보기로 전환',     hint: '보기',    action: 'view', payload: 'week'     },
  { id: 's3', icon: '📊', label: '타임라인 보기로 전환', hint: '보기',    action: 'view', payload: 'timeline' },
  { id: 's4', icon: '📋', label: '목록 보기로 전환',   hint: '보기',    action: 'view', payload: 'agenda'   },
  { id: 's5', icon: '✏️', label: '새 일정 만들기',       hint: '액션',    action: 'new-event'                },
  { id: 's6', icon: '🔗', label: '캘린더 공유 링크',     hint: '액션',    action: 'share'                    },
  { id: 's7', icon: '🔔', label: '웹훅 관리',            hint: '설정',    action: 'webhooks'                 },
  { id: 's8', icon: '🎨', label: '디자인 시스템 토글',   hint: '필터',    action: 'toggle-project', payload: undefined },
  { id: 's9', icon: '🔍', label: '태그로 필터: launch',  hint: '필터',    action: 'tag', payload: undefined  },
  { id: 's10', icon: '🔍', label: '태그로 필터: QA',     hint: '필터',    action: 'tag', payload: undefined  },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: ViewType) => void;
  onNewEvent: () => void;
}

export function CommandPalette({ isOpen, onClose, onSelectView, onNewEvent }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions by query
  const filtered = query.trim()
    ? STATIC_SUGGESTIONS.filter((s) =>
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        s.hint.toLowerCase().includes(query.toLowerCase())
      )
    : STATIC_SUGGESTIONS;

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFocusedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Clamp focused index when list changes
  useEffect(() => {
    setFocusedIndex((prev) => Math.min(prev, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  const handleSelect = useCallback((s: Suggestion) => {
    if (s.action === 'view' && s.payload) {
      onSelectView(s.payload);
    } else if (s.action === 'new-event') {
      onNewEvent();
    }
    onClose();
  }, [onClose, onSelectView, onNewEvent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[focusedIndex]) {
      handleSelect(filtered[focusedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="command-palette-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="명령어 팔레트"
    >
      <div
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input */}
        <div className="command-palette-input-row">
          <span className="command-palette-icon">⌘</span>
          <input
            ref={inputRef}
            className="command-palette-input"
            placeholder="명령어 검색…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setFocusedIndex(0); }}
            aria-label="명령어 검색"
          />
          {query && (
            <button
              style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}
              onClick={() => setQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Suggestions list */}
        <ul className="command-palette-list" role="listbox">
          {filtered.length === 0 && (
            <li className="command-palette-item" style={{ color: 'var(--color-text-tertiary)' }}>
              "{query}"에 해당하는 명령어가 없습니다
            </li>
          )}
          {filtered.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === focusedIndex}
              className={`command-palette-item${i === focusedIndex ? ' focused' : ''}`}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setFocusedIndex(i)}
            >
              <span className="command-palette-item-icon">{s.icon}</span>
              <span className="command-palette-item-label">{s.label}</span>
              <span className="command-palette-item-hint">{s.hint}</span>
            </li>
          ))}
        </ul>

        {/* Footer hints */}
        <div className="command-palette-footer">
          <span><kbd>↑↓</kbd> 이동</span>
          <span><kbd>↵</kbd> 선택</span>
          <span><kbd>esc</kbd> 닫기</span>
        </div>
      </div>
    </div>
  );
}
