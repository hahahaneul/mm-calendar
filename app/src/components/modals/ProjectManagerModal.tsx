/**
 * ProjectManagerModal.tsx
 * Full project management: rename, recolor, add/delete projects, manage subcategories.
 */

import { useState } from 'react';
import type { Project } from '../../types';

interface ProjectManagerModalProps {
  projects: Project[];
  onUpdateProject: (id: string, patch: Partial<Pick<Project, 'name' | 'color'>>) => void;
  onAddProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
  onAddSubcategory: (projectId: string, label: string) => void;
  onDeleteSubcategory: (projectId: string, label: string) => void;
  onClose: () => void;
}

export function ProjectManagerModal({
  projects,
  onUpdateProject,
  onAddProject,
  onDeleteProject,
  onAddSubcategory,
  onDeleteSubcategory,
  onClose,
}: ProjectManagerModalProps) {
  const [drafts, setDrafts] = useState<Record<string, { name: string; color: string }>>(
    () => Object.fromEntries(projects.map((p) => [p.id, { name: p.name, color: p.color }]))
  );
  const [subcatInputs, setSubcatInputs] = useState<Record<string, string>>({});
  const [newProjectName, setNewProjectName] = useState('');

  function handleNameChange(id: string, name: string) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], name } }));
  }

  function handleNameBlur(id: string) {
    const name = drafts[id]?.name.trim();
    if (name) onUpdateProject(id, { name });
  }

  function handleColorChange(id: string, color: string) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], color } }));
    onUpdateProject(id, { color });
  }

  function handleDelete(proj: Project) {
    const confirmed = window.confirm(`"${proj.name}" 프로젝트를 삭제하시겠습니까?\n해당 프로젝트의 모든 일정도 삭제됩니다.`);
    if (confirmed) onDeleteProject(proj.id);
  }

  function handleSubcatKeyDown(projectId: string, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const val = subcatInputs[projectId] ?? '';
      onAddSubcategory(projectId, val);
      setSubcatInputs((prev) => ({ ...prev, [projectId]: '' }));
    }
  }

  function handleAddSubcat(projectId: string) {
    const val = subcatInputs[projectId] ?? '';
    onAddSubcategory(projectId, val);
    setSubcatInputs((prev) => ({ ...prev, [projectId]: '' }));
  }

  function handleAddProject() {
    const name = newProjectName.trim() || '새 프로젝트';
    onAddProject(name);
    setNewProjectName('');
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">프로젝트 관리</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 20, listStyle: 'none', padding: 0, margin: 0 }}>
            {projects.map((proj) => {
              const draft = drafts[proj.id] ?? { name: proj.name, color: proj.color };
              const subcatInput = subcatInputs[proj.id] ?? '';
              return (
                <li
                  key={proj.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {/* Row 1: color + name + delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Color picker */}
                    <label style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} title="색상 변경">
                      <span
                        style={{
                          display: 'block',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: draft.color,
                          border: '2px solid var(--color-border)',
                        }}
                      />
                      <input
                        type="color"
                        value={draft.color}
                        onChange={(e) => handleColorChange(proj.id, e.target.value)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </label>

                    {/* Name input */}
                    <input
                      className="form-input"
                      type="text"
                      value={draft.name}
                      onChange={(e) => handleNameChange(proj.id, e.target.value)}
                      onBlur={() => handleNameBlur(proj.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNameBlur(proj.id)}
                      style={{ flex: 1 }}
                    />

                    {/* Delete project */}
                    <button
                      className="btn btn-ghost"
                      title="프로젝트 삭제"
                      onClick={() => handleDelete(proj)}
                      style={{ color: 'var(--color-danger, #ef4444)', padding: '4px 8px', flexShrink: 0 }}
                    >
                      삭제
                    </button>
                  </div>

                  {/* Row 2: subcategories */}
                  <div>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                      하위 카테고리
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {proj.subcategories.length === 0 ? (
                        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary, #9ca3af)' }}>
                          없음
                        </span>
                      ) : (
                        proj.subcategories.map((sub) => (
                          <span
                            key={sub}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: `${proj.color}22`,
                              border: `1px solid ${proj.color}55`,
                              borderRadius: 12,
                              padding: '2px 8px',
                              fontSize: 12,
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            {sub}
                            <button
                              onClick={() => onDeleteSubcategory(proj.id, sub)}
                              title="삭제"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                lineHeight: 1,
                                color: 'var(--color-text-secondary)',
                                fontSize: 11,
                              }}
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    {/* Add subcategory */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="카테고리 추가..."
                        value={subcatInput}
                        onChange={(e) =>
                          setSubcatInputs((prev) => ({ ...prev, [proj.id]: e.target.value }))
                        }
                        onKeyDown={(e) => handleSubcatKeyDown(proj.id, e)}
                        style={{ flex: 1, fontSize: 12, padding: '4px 8px' }}
                      />
                      <button
                        className="btn btn-ghost"
                        onClick={() => handleAddSubcat(proj.id)}
                        style={{ fontSize: 12, padding: '4px 10px', flexShrink: 0 }}
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="modal-footer" style={{ flexDirection: 'column', gap: 10, alignItems: 'stretch' }}>
          {/* Add project */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              type="text"
              placeholder="새 프로젝트 이름"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-ghost" onClick={handleAddProject} style={{ flexShrink: 0 }}>
              프로젝트 추가
            </button>
          </div>
          <button className="btn btn-primary" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
}
