/**
 * Sidebar.tsx
 * Left panel: project filter toggles + webhook status card.
 */

import type { Project, WebhookSubscription } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProjectIds: Set<string>;
  onToggleProject: (id: string) => void;
  activeSubcategories: Map<string, Set<string>>;
  onToggleSubcategory: (projectId: string, subcategory: string) => void;
  onManageProjects: () => void;
  webhooks: WebhookSubscription[];
  onManageWebhooks: () => void;
}

const WEBHOOK_STATUS_KO: Record<string, string> = {
  active: '활성',
  paused: '일시정지',
  failed: '실패',
};

export function Sidebar({ projects, activeProjectIds, onToggleProject, activeSubcategories, onToggleSubcategory, onManageProjects, webhooks, onManageWebhooks }: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Project filters */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">프로젝트</p>
        <ul>
          {projects.map((proj) => {
            const active = activeProjectIds.has(proj.id);
            return (
              <li key={proj.id}>
                <div
                  className="project-filter-item"
                  onClick={() => onToggleProject(proj.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onToggleProject(proj.id)}
                  aria-pressed={active}
                >
                  <span
                    className="project-color-dot"
                    style={{ background: proj.color, opacity: active ? 1 : 0.35 }}
                  />
                  <span
                    className="project-filter-name"
                    style={{ opacity: active ? 1 : 0.45 }}
                  >
                    {proj.name}
                  </span>
                  {/* Toggle switch */}
                  <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => onToggleProject(proj.id)}
                    />
                    <span className="toggle-track" />
                  </label>
                </div>
                {/* Subcategory toggle chips */}
                {proj.subcategories.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '4px 8px 6px 28px' }}>
                    {proj.subcategories.map((sub) => {
                      const activeSubs = activeSubcategories.get(proj.id);
                      const subActive = activeSubs ? activeSubs.has(sub) : false;
                      return (
                        <button
                          key={sub}
                          onClick={() => onToggleSubcategory(proj.id, sub)}
                          aria-pressed={subActive}
                          style={{
                            fontSize: 11,
                            background: subActive ? `${proj.color}33` : 'transparent',
                            border: `1px solid ${subActive ? proj.color : proj.color + '55'}`,
                            borderRadius: 10,
                            padding: '1px 7px',
                            color: subActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                            opacity: active ? 1 : 0.4,
                            cursor: 'pointer',
                            fontWeight: subActive ? 600 : 400,
                            transition: 'background 0.15s, color 0.15s',
                          }}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 11, color: 'var(--color-text-tertiary, #9ca3af)', padding: '2px 8px 4px 28px', margin: 0 }}>
                    하위 카테고리 없음
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Manage projects button */}
      <button
        className="btn btn-ghost"
        style={{ width: '100%', fontSize: 12, padding: '4px 8px', marginTop: 8 }}
        onClick={onManageProjects}
      >
        프로젝트 관리
      </button>

      {/* Webhook status */}
      <div className="webhook-card">
        <p className="webhook-card-title">웹훅</p>
        {webhooks.map((wh) => (
          <div key={wh.id} style={{ marginBottom: 6 }}>
            <span className={`webhook-status-dot ${wh.status}`} />
            <span style={{ fontSize: 12 }}>{WEBHOOK_STATUS_KO[wh.status] ?? wh.status}</span>
            <div className="webhook-endpoint">{wh.endpoint}</div>
          </div>
        ))}
        <button
          className="btn btn-ghost"
          style={{ marginTop: 8, width: '100%', fontSize: 12, padding: '4px 8px' }}
          onClick={onManageWebhooks}
        >
          웹훅 관리
        </button>
      </div>
    </aside>
  );
}
