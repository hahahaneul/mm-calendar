/**
 * DetailPanel.tsx
 * Right floating panel showing selected event details, tags, owner, status,
 * and action buttons. Shows a placeholder when no event is selected.
 */

import type { CalendarEvent, Project } from '../types';

interface DetailPanelProps {
  event: CalendarEvent | null;
  projects: Project[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onClose: () => void;
}

const STATUS_KO: Record<string, string> = {
  planned: '예정',
  'in-progress': '진행 중',
  blocked: '차단됨',
  done: '완료',
};

/** Format ISO datetime to human-readable Korean string. */
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function DetailPanel({ event, projects, onEdit, onDelete, onClose }: DetailPanelProps) {
  if (!event) {
    return (
      <aside className="detail-panel">
        <button className="detail-panel-close" onClick={onClose} aria-label="패널 닫기" title="패널 닫기">✕</button>
        <div className="empty-state" style={{ flex: 1, justifyContent: 'center' }}>
          <span className="empty-state-icon">📋</span>
          <span className="empty-state-text">일정을 선택하면 상세 정보가 표시됩니다</span>
        </div>
      </aside>
    );
  }

  const project = projects.find((p) => p.id === event.projectId);

  return (
    <aside className="detail-panel">
      <button className="detail-panel-close" onClick={onClose} aria-label="패널 닫기" title="패널 닫기">✕</button>
      {/* Title + color strip */}
      <div
        className="detail-panel-header"
        style={{ borderTop: `4px solid ${event.color ?? project?.color ?? '#6366f1'}` }}
      >
        <h2 className="detail-panel-title">{event.title}</h2>
        <span className={`status-badge ${event.status}`}>
          {STATUS_KO[event.status] ?? event.status}
        </span>
      </div>

      <div className="detail-panel-body">
        {/* Description */}
        {event.description && (
          <div>
            <p className="detail-field-label">설명</p>
            <p className="detail-field-value">{event.description}</p>
          </div>
        )}

        {/* Project */}
        {project && (
          <div>
            <p className="detail-field-label">프로젝트</p>
            <p className="detail-field-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: project.color,
                }}
              />
              {project.name}
            </p>
          </div>
        )}

        {/* Date range */}
        <div>
          <p className="detail-field-label">일시</p>
          <p className="detail-field-value">
            {fmtDate(event.start)}
            {event.start !== event.end && (
              <>
                {' '}–<br />
                {fmtDate(event.end)}
              </>
            )}
          </p>
        </div>

        {/* Owner */}
        <div>
          <p className="detail-field-label">담당자</p>
          <p className="detail-field-value">{event.owner}</p>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div>
            <p className="detail-field-label">태그</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {event.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Last updated */}
        <div>
          <p className="detail-field-label">마지막 수정</p>
          <p className="detail-field-value" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {fmtDate(event.updatedAt)} · {event.updatedBy}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="detail-panel-actions">
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onEdit(event)}>
          편집
        </button>
        <button
          className="btn btn-ghost"
          style={{ flex: 1, color: 'var(--status-blocked-text)', borderColor: 'var(--status-blocked)' }}
          onClick={() => onDelete(event)}
        >
          삭제
        </button>
      </div>
    </aside>
  );
}
