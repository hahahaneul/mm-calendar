/**
 * TodoWeekNav.tsx
 * Week navigation: ← previous | week label | next → | today button.
 */

import { formatWeekLabel, offsetWeek, getWeekKey } from '../../utils/weekUtils';

interface TodoWeekNavProps {
  weekKey: string;
  onChangeWeek: (weekKey: string) => void;
}

export function TodoWeekNav({ weekKey, onChangeWeek }: TodoWeekNavProps) {
  const todayWeek = getWeekKey(new Date());

  return (
    <div className="todo-week-nav">
      <button
        className="btn btn-ghost todo-week-btn"
        onClick={() => onChangeWeek(offsetWeek(weekKey, -1))}
        aria-label="이전 주"
      >
        ←
      </button>
      <span className="todo-week-label">{formatWeekLabel(weekKey)}</span>
      <button
        className="btn btn-ghost todo-week-btn"
        onClick={() => onChangeWeek(offsetWeek(weekKey, 1))}
        aria-label="다음 주"
      >
        →
      </button>
      {weekKey !== todayWeek && (
        <button
          className="btn btn-ghost todo-week-btn todo-week-today"
          onClick={() => onChangeWeek(todayWeek)}
        >
          오늘
        </button>
      )}
    </div>
  );
}
