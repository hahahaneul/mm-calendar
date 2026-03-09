import { useState, useEffect, useCallback } from 'react';
import type { TodoItem } from '../types';
import { supabase } from '../lib/supabase';
import { dbTodoToTodoItem } from '../lib/mappers';
import { getWeekDates, toDateKey } from '../utils/weekUtils';

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  // Fetch on mount
  useEffect(() => {
    supabase.from('todos').select('*').then(({ data }) => {
      if (data) setTodos(data.map(dbTodoToTodoItem));
    });
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-todos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTodos((prev) => {
            if (prev.some((t) => t.id === (payload.new as any).id)) return prev;
            return [...prev, dbTodoToTodoItem(payload.new as any)];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updated = dbTodoToTodoItem(payload.new as any);
          setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        } else if (payload.eventType === 'DELETE') {
          setTodos((prev) => prev.filter((t) => t.id !== (payload.old as any).id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getTodosByMemberDate = useCallback(
    (memberId: string, dateKey: string) =>
      todos
        .filter((t) => t.memberId === memberId && t.dateKey === dateKey)
        .sort((a, b) => a.order - b.order),
    [todos],
  );

  const addTodo = useCallback(async (memberId: string, dateKey: string, title: string) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const existing = todos.filter((t) => t.memberId === memberId && t.dateKey === dateKey);
    const newTodo: TodoItem = {
      id,
      memberId,
      dateKey,
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
      order: existing.length,
    };
    setTodos((prev) => [...prev, newTodo]);
    await supabase.from('todos').insert({
      id,
      member_id: memberId,
      date_key: dateKey,
      title,
      completed: false,
      order: existing.length,
    });
  }, [todos]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const newCompleted = !todo.completed;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted, updatedAt: new Date().toISOString() } : t)),
    );
    await supabase.from('todos').update({ completed: newCompleted }).eq('id', id);
  }, [todos]);

  const updateTodo = useCallback(async (id: string, patch: Partial<Pick<TodoItem, 'title' | 'order'>>) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)),
    );
    await supabase.from('todos').update(patch).eq('id', id);
  }, []);

  const removeTodo = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('todos').delete().eq('id', id);
  }, []);

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

  const removeTodosByMember = useCallback(async (memberId: string) => {
    setTodos((prev) => prev.filter((t) => t.memberId !== memberId));
    await supabase.from('todos').delete().eq('member_id', memberId);
  }, []);

  return { todos, getTodosByMemberDate, addTodo, toggleTodo, updateTodo, removeTodo, getDailyProgress, getWeeklyProgress, removeTodosByMember };
}
