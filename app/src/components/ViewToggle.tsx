/**
 * ViewToggle.tsx
 * Segmented control for switching between Month / Week / Timeline / Agenda views.
 */

import type { ViewType } from '../types';

const VIEWS: { value: ViewType; label: string }[] = [
  { value: 'month',    label: '월간'     },
  { value: 'week',     label: '주간'     },
  { value: 'timeline', label: '타임라인' },
  { value: 'agenda',   label: '목록'     },
];

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="view-toggle" role="tablist" aria-label="캘린더 보기">
      {VIEWS.map(({ value, label }) => (
        <button
          key={value}
          role="tab"
          aria-selected={currentView === value}
          className={`view-toggle-btn${currentView === value ? ' active' : ''}`}
          onClick={() => onViewChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
