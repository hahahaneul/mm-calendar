/**
 * TodoSection.tsx
 * Daily todo grid: 7 columns (Mon–Sun) within a week, each with its own todo list and progress.
 */

import { useState } from 'react';
import type { TodoItem } from '../../types';
import { getWeekKey, getWeekDates, toDateKey, formatDayHeader } from '../../utils/weekUtils';
import { TodoWeekNav } from './TodoWeekNav';
import { TodoItemRow } from './TodoItemRow';

interface TodoSectionProps {
  memberId: string;
  getTodosByMemberDate: (memberId: string, dateKey: string) => TodoItem[];
  getDailyProgress: (memberId: string, dateKey: string) => { total: number; completed: number; percent: number };
  onAdd: (memberId: string, dateKey: string, title: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}

export function TodoSection({
  memberId,
  getTodosByMemberDate,
  getDailyProgress,
  onAdd,
  onToggle,
  onRemove,
  readOnly,
}: TodoSectionProps) {
  const [weekKey, setWeekKey] = useState(() => getWeekKey(new Date()));
  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const weekDates = getWeekDates(weekKey);

  const handleAdd = (dateKey: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAdd(memberId, dateKey, trimmed);
    setNewTitle('');
    setAddingDay(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, dateKey: string) => {
    if (e.key === 'Enter') handleAdd(dateKey);
    if (e.key === 'Escape') { setAddingDay(null); setNewTitle(''); }
  };

  return (
    <div className="todo-section">
      <h3 className="todo-section-title">DAILY TO DO LIST</h3>
      <TodoWeekNav weekKey={weekKey} onChangeWeek={setWeekKey} />

      <div className="todo-daily-grid">
        {weekDates.map((date) => {
          const dateKey = toDateKey(date);
          const todos = getTodosByMemberDate(memberId, dateKey);
          const progress = getDailyProgress(memberId, dateKey);
          const isToday = toDateKey(new Date()) === dateKey;

          return (
            <div key={dateKey} className={`todo-day-column${isToday ? ' today' : ''}`}>
              {/* Day header */}
              <div className="todo-day-header">
                <span className="todo-day-date">{formatDayHeader(dateKey)}</span>
                {progress.total > 0 ? (
                  <span className={`todo-day-progress${progress.percent === 100 ? ' complete' : ''}`}>
                    {progress.percent}% ({progress.completed}/{progress.total})
                  </span>
                ) : (
                  <span className="todo-day-progress empty">-</span>
                )}
              </div>

              {/* Progress bar */}
              {progress.total > 0 && (
                <div className="todo-day-progress-bar">
                  <div
                    className="todo-day-progress-fill"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              )}

              {/* Todo items */}
              <div className="todo-day-list">
                {todos.map((todo) => (
                  <TodoItemRow
                    key={todo.id}
                    todo={todo}
                    readOnly={readOnly}
                    onToggle={onToggle}
                    onRemove={onRemove}
                  />
                ))}
              </div>

              {/* Add todo */}
              {!readOnly && (
                <div className="todo-day-add">
                  {addingDay === dateKey ? (
                    <div className="todo-day-add-input-wrap">
                      <input
                        className="form-input todo-day-add-input"
                        placeholder="할 일 입력…"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, dateKey)}
                        autoFocus
                        onBlur={() => {
                          if (!newTitle.trim()) {
                            setAddingDay(null);
                            setNewTitle('');
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      className="todo-day-add-btn"
                      onClick={() => { setAddingDay(dateKey); setNewTitle(''); }}
                    >
                      + 추가
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
