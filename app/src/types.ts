// Core domain types for the Calendar / Project Timeline app
// Mirrors the data schema described in spec.md §3

export type EventStatus = 'planned' | 'in-progress' | 'blocked' | 'done';

export type ViewType = 'month' | 'week' | 'timeline' | 'agenda' | 'member';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  projectId: string;
  tags: string[];
  owner: string;
  ownerId: string;
  status: EventStatus;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  allDay: boolean;
  color?: string;
  subcategory?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  color: string;
}

export interface TodoItem {
  id: string;
  memberId: string;
  dateKey: string;       // YYYY-MM-DD, e.g. '2026-03-09'
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  order: number;
  subcategories: string[];
}

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface WebhookSubscription {
  id: string;
  endpoint: string;
  events: string[];
  status: 'active' | 'failed' | 'paused';
  lastDeliveredAt?: string;
  createdAt: string;
}

