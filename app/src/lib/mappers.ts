import type { Database } from './database.types';
import type { CalendarEvent, Member, Project, TodoItem, WebhookSubscription } from '../types';

type DbEvent = Database['public']['Tables']['events']['Row'];
type DbProfile = Database['public']['Tables']['profiles']['Row'];
type DbProject = Database['public']['Tables']['projects']['Row'];
type DbTodo = Database['public']['Tables']['todos']['Row'];
type DbWebhook = Database['public']['Tables']['webhooks']['Row'];

// ── Events ──────────────────────────────────────────────

export function dbEventToCalendarEvent(row: DbEvent): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    projectId: row.project_id,
    tags: row.tags,
    owner: row.owner_name,
    ownerId: row.owner_id ?? '',
    status: row.status as CalendarEvent['status'],
    start: row.start_at,
    end: row.end_at,
    allDay: row.all_day,
    color: row.color ?? undefined,
    subcategory: row.subcategory ?? undefined,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export function calendarEventToDbRow(event: CalendarEvent) {
  return {
    id: event.id || undefined,
    title: event.title,
    description: event.description,
    project_id: event.projectId,
    tags: event.tags,
    owner_name: event.owner,
    owner_id: event.ownerId || null,
    status: event.status,
    start_at: event.start,
    end_at: event.end,
    all_day: event.allDay,
    color: event.color ?? null,
    subcategory: event.subcategory ?? null,
    updated_at: event.updatedAt,
    updated_by: event.updatedBy,
  };
}

// ── Profiles / Members ──────────────────────────────────

export function dbProfileToMember(row: DbProfile): Member {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as Member['role'],
    color: row.color,
  };
}

// ── Projects ────────────────────────────────────────────

export function dbProjectToProject(row: DbProject): Project {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    order: row.order,
    subcategories: row.subcategories,
  };
}

export function projectToDbRow(project: Project) {
  return {
    id: project.id || undefined,
    name: project.name,
    color: project.color,
    order: project.order,
    subcategories: project.subcategories,
  };
}

// ── Todos ───────────────────────────────────────────────

export function dbTodoToTodoItem(row: DbTodo): TodoItem {
  return {
    id: row.id,
    memberId: row.member_id,
    dateKey: row.date_key,
    title: row.title,
    completed: row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    order: row.order,
  };
}

// ── Webhooks ────────────────────────────────────────────

export function dbWebhookToWebhook(row: DbWebhook): WebhookSubscription {
  return {
    id: row.id,
    endpoint: row.endpoint,
    events: row.events,
    status: row.status as WebhookSubscription['status'],
    lastDeliveredAt: row.last_delivered_at ?? undefined,
    createdAt: row.created_at,
  };
}
