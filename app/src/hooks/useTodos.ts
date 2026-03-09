/**
 * useTodos.ts
 * State hook for daily todo items: CRUD, filtering by member+date, progress calculation.
 */

import { useState, useCallback } from 'react';
import type { TodoItem } from '../types';
import { SAMPLE_TODOS } from '../data/sampleEvents';
import { getWeekDates, toDateKey } from '../utils/weekUtils';

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>(SAMPLE_TODOS);

  const getTodosByMemberDate = useCallback(
    (memberId: string, dateKey: string) =>
      todos
        .filter((t) => t.memberId === memberId && t.dateKey === dateKey)
        .sort((a, b) => a.order - b.order),
    [todos],
  );

  const addTodo = useCallback((memberId: string, dateKey: string, title: string) => {
    const now = new Date().toISOString();
    setTodos((prev) => {
      const existing = prev.filter((t) => t.memberId === memberId && t.dateKey === dateKey);
      const newTodo: TodoItem = {
        id: `todo_${Date.now().toString(36)}`,
        memberId,
        dateKey,
        title,
        completed: false,
        createdAt: now,
        updatedAt: now,
        order: existing.length,
      };
      return [...prev, newTodo];
    });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    const now = new Date().toISOString();
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed, updatedAt: now } : t)),
    );
  }, []);

  const updateTodo = useCallback((id: string, patch: Partial<Pick<TodoItem, 'title' | 'order'>>) => {
    const now = new Date().toISOString();
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now } : t)),
    );
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** Daily progress for a single date */
  const getDailyProgress = useCallback(
    (memberId: string, dateKey: string) => {
      const dayTodos = todos.filter((t) => t.memberId === memberId && t.dateKey === dateKey);
      if (dayTodos.length === 0) return { total: 0, completed: 0, percent: 0 };
      const completed = dayTodos.filter((t) => t.completed).length;
      return {
        total: dayTodos.length,
        completed,
        percent: Math.round((completed / dayTodos.length) * 100),
      };
    },
    [todos],
  );

  /** Weekly progress: aggregates all days in the week (for admin dashboard) */
  const getWeeklyProgress = useCallback(
    (memberId: string, weekKey: string) => {
      const dates = getWeekDates(weekKey);
      const dateKeys = dates.map(toDateKey);
      const weekTodos = todos.filter(
        (t) => t.memberId === memberId && dateKeys.includes(t.dateKey),
      );
      if (weekTodos.length === 0) return 0;
      return Math.round(
        (weekTodos.filter((t) => t.completed).length / weekTodos.length) * 100,
      );
    },
    [todos],
  );

  const removeTodosByMember = useCallback((memberId: string) => {
    setTodos((prev) => prev.filter((t) => t.memberId !== memberId));
  }, []);

  return { todos, getTodosByMemberDate, addTodo, toggleTodo, updateTodo, removeTodo, getDailyProgress, getWeeklyProgress, removeTodosByMember };
}
