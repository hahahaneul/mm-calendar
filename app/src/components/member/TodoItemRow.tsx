/**
 * TodoItemRow.tsx
 * Single todo row: checkbox + title + delete button.
 */

import type { TodoItem } from '../../types';

interface TodoItemRowProps {
  todo: TodoItem;
  readOnly?: boolean;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TodoItemRow({ todo, readOnly, onToggle, onRemove }: TodoItemRowProps) {
  return (
    <div className={`todo-item${todo.completed ? ' completed' : ''}`}>
      <button
        className={`todo-checkbox${todo.completed ? ' checked' : ''}`}
        onClick={() => !readOnly && onToggle(todo.id)}
        disabled={readOnly}
        aria-label={todo.completed ? '완료 취소' : '완료 처리'}
      >
        {todo.completed && '✓'}
      </button>
      <span className={`todo-title${todo.completed ? ' completed' : ''}`}>
        {todo.title}
      </span>
      {!readOnly && (
        <button
          className="todo-delete-btn"
          onClick={() => onRemove(todo.id)}
          aria-label="삭제"
        >
          ✕
        </button>
      )}
    </div>
  );
}
