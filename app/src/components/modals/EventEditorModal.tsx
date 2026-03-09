/**
 * EventEditorModal.tsx
 * Create / edit a CalendarEvent in a slide-up modal form.
 * Supports create and edit modes, field validation, and keyboard handling.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CalendarEvent, EventStatus, Project, Member } from '../../types';

interface EventEditorModalProps {
  mode: 'create' | 'edit';
  initialEvent?: CalendarEvent;
  projects: Project[];
  members: Member[];
  onSave: (event: CalendarEvent) => void;
  onClose: () => void;
}

// ── Datetime helpers ──────────────────────────────────────────────────────────

/** Convert ISO string to the value expected by <input type="datetime-local"> */
function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/** Convert <input type="datetime-local"> value back to ISO string */
function fromDateTimeLocal(local: string): string {
  return local ? new Date(local).toISOString() : new Date().toISOString();
}

/** Convert ISO string to <input type="date"> value (YYYY-MM-DD) */
function toDateOnly(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

/** Build initial form state from an existing event or sensible defaults */
function buildInitial(event?: CalendarEvent, projects?: Project[]) {
  if (event) {
    return {
      title: event.title,
      description: event.description,
      projectId: event.projectId,
      subcategory: event.subcategory ?? '',
      ownerId: event.ownerId ?? '',
      status: event.status as EventStatus,
      allDay: event.allDay,
      start: event.allDay ? toDateOnly(event.start) : toDateTimeLocal(event.start),
      end: event.allDay ? toDateOnly(event.end) : toDateTimeLocal(event.end),
      tags: event.tags.join(', '),
    };
  }
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    title: '',
    description: '',
    projectId: projects?.[0]?.id ?? '',
    subcategory: '',
    ownerId: '',
    status: 'planned' as EventStatus,
    allDay: false,
    start: toDateTimeLocal(now.toISOString()),
    end: toDateTimeLocal(later.toISOString()),
    tags: '',
  };
}

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'planned',     label: '예정'    },
  { value: 'in-progress', label: '진행 중' },
  { value: 'blocked',     label: '차단됨'  },
  { value: 'done',        label: '완료'    },
];

export function EventEditorModal({
  mode,
  initialEvent,
  projects,
  members,
  onSave,
  onClose,
}: EventEditorModalProps) {
  const [form, setForm] = useState(() => buildInitial(initialEvent, projects));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const titleRef = useRef<HTMLInputElement>(null);

  // Focus title on open
  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 50);
  }, []);

  // Rebuild form if the initial event changes (switching between events)
  useEffect(() => {
    setForm(buildInitial(initialEvent, projects));
    setErrors({});
  }, [initialEvent?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // When allDay toggles, convert datetime ↔ date-only
  const handleAllDayToggle = () => {
    const nextAllDay = !form.allDay;
    setForm((prev) => ({
      ...prev,
      allDay: nextAllDay,
      start: nextAllDay ? prev.start.slice(0, 10) : prev.start + 'T00:00',
      end: nextAllDay ? prev.end.slice(0, 10) : prev.end + 'T00:00',
    }));
  };

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = '제목을 입력해 주세요.';
    if (form.start && form.end) {
      const s = new Date(form.allDay ? form.start : fromDateTimeLocal(form.start));
      const e = new Date(form.allDay ? form.end : fromDateTimeLocal(form.end));
      if (e < s) errs.end = '종료 일시는 시작 일시 이후여야 합니다.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSave = () => {
    if (!validate()) return;

    const now = new Date().toISOString();
    const toISO = (val: string) =>
      form.allDay ? new Date(val).toISOString() : fromDateTimeLocal(val);

    const selectedMember = members.find((m) => m.id === form.ownerId);

    const saved: CalendarEvent = {
      id: initialEvent?.id ?? `evt_${Date.now().toString(36)}`,
      title: form.title.trim(),
      description: form.description.trim(),
      projectId: form.projectId,
      subcategory: form.subcategory || undefined,
      owner: selectedMember?.name ?? '',
      ownerId: form.ownerId,
      status: form.status,
      allDay: form.allDay,
      start: toISO(form.start),
      end: toISO(form.end),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      color: projects.find((p) => p.id === form.projectId)?.color,
      updatedAt: now,
      updatedBy: selectedMember?.name ?? '나',
    };

    onSave(saved);
    onClose();
  };

  // Keyboard: Escape → close, Ctrl/Cmd+Enter → save
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { handleSave(); }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'create' ? '일정 만들기' : '일정 편집'}
    >
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? '새 일정' : '일정 편집'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Title */}
          <div className="form-field">
            <label className="form-label" htmlFor="ef-title">
              제목 <span className="form-required">*</span>
            </label>
            <input
              id="ef-title"
              ref={titleRef}
              className={`form-input${errors.title ? ' form-input-error' : ''}`}
              placeholder="일정 제목"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="form-field">
            <label className="form-label" htmlFor="ef-desc">설명</label>
            <textarea
              id="ef-desc"
              className="form-textarea"
              placeholder="선택 사항…"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {/* Project + Status row */}
          <div className="form-row">
            <div className="form-field form-field-grow">
              <label className="form-label" htmlFor="ef-project">프로젝트</label>
              <select
                id="ef-project"
                className="form-select"
                value={form.projectId}
                onChange={(e) => {
                  const newProjectId = e.target.value;
                  const newProject = projects.find((p) => p.id === newProjectId);
                  setForm((prev) => ({
                    ...prev,
                    projectId: newProjectId,
                    subcategory: newProject?.subcategories.includes(prev.subcategory) ? prev.subcategory : '',
                  }));
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-field form-field-grow">
              <label className="form-label" htmlFor="ef-status">상태</label>
              <select
                id="ef-status"
                className="form-select"
                value={form.status}
                onChange={(e) => set('status', e.target.value as EventStatus)}
              >
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategory */}
          {(() => {
            const proj = projects.find((p) => p.id === form.projectId);
            const subs = proj?.subcategories ?? [];
            return (
              <div className="form-field">
                <label className="form-label" htmlFor="ef-subcat">하위 카테고리</label>
                <select
                  id="ef-subcat"
                  className="form-select"
                  value={form.subcategory}
                  onChange={(e) => set('subcategory', e.target.value)}
                  disabled={subs.length === 0}
                >
                  <option value="">없음</option>
                  {subs.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            );
          })()}

          {/* Owner (member dropdown) */}
          <div className="form-field">
            <label className="form-label" htmlFor="ef-owner">담당자</label>
            <select
              id="ef-owner"
              className="form-select"
              value={form.ownerId}
              onChange={(e) => set('ownerId', e.target.value)}
            >
              <option value="">선택하세요</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* All-day toggle */}
          <div className="form-field form-field-inline">
            <label className="form-label" htmlFor="ef-allday">하루 종일</label>
            <button
              id="ef-allday"
              role="switch"
              aria-checked={form.allDay}
              className={`toggle-btn${form.allDay ? ' on' : ''}`}
              onClick={handleAllDayToggle}
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          {/* Start / End row */}
          <div className="form-row">
            <div className="form-field form-field-grow">
              <label className="form-label" htmlFor="ef-start">시작</label>
              <input
                id="ef-start"
                type={form.allDay ? 'date' : 'datetime-local'}
                className="form-input"
                value={form.start}
                onChange={(e) => set('start', e.target.value)}
              />
            </div>

            <div className="form-field form-field-grow">
              <label className="form-label" htmlFor="ef-end">종료</label>
              <input
                id="ef-end"
                type={form.allDay ? 'date' : 'datetime-local'}
                className={`form-input${errors.end ? ' form-input-error' : ''}`}
                value={form.end}
                onChange={(e) => set('end', e.target.value)}
              />
              {errors.end && <p className="form-error">{errors.end}</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="form-field">
            <label className="form-label" htmlFor="ef-tags">태그</label>
            <input
              id="ef-tags"
              className="form-input"
              placeholder="launch, QA, critical (쉼표로 구분)"
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span className="modal-footer-hint">
            <kbd>⌘↵</kbd> 저장 · <kbd>Esc</kbd> 취소
          </span>
          <div className="modal-footer-actions">
            <button className="btn btn-ghost" onClick={onClose}>취소</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {mode === 'create' ? '일정 만들기' : '변경 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
