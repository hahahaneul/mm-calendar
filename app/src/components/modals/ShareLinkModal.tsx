/**
 * ShareLinkModal.tsx
 * Lists existing share links and lets the user create new ones.
 */

import { useState } from 'react';
import type { ShareLink, SharePermission } from '../../types';

interface ShareLinkModalProps {
  shareLinks: ShareLink[];
  onCreateLink: (permission: SharePermission, expiresAt?: string) => ShareLink;
  onDeleteLink: (id: string) => void;
  onClose: () => void;
}

function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => alert(text));
  } else {
    alert(text);
  }
}

function PermissionBadge({ permission }: { permission: SharePermission }) {
  return (
    <span className={`share-permission-badge share-permission-badge--${permission}`}>
      {permission === 'edit' ? '편집 가능' : '보기 전용'}
    </span>
  );
}

export function ShareLinkModal({
  shareLinks,
  onCreateLink,
  onDeleteLink,
  onClose,
}: ShareLinkModalProps) {
  const [permission, setPermission] = useState<SharePermission>('view');
  const [expiresAt, setExpiresAt] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopy(link: ShareLink) {
    copyToClipboard(link.url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleCreate() {
    onCreateLink(permission, expiresAt || undefined);
    setExpiresAt('');
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">캘린더 공유</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Existing links */}
          <div className="share-links-section">
            <p className="share-section-label">활성 링크</p>
            {shareLinks.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <span className="empty-state-icon">🔗</span>
                <span className="empty-state-text">공유 링크가 없습니다</span>
              </div>
            ) : (
              <ul className="share-link-list">
                {shareLinks.map((link) => (
                  <li key={link.id} className="share-link-row">
                    <div className="share-link-left">
                      <PermissionBadge permission={link.permission} />
                      <div className="share-link-url">{link.url}</div>
                      {link.expiresAt && (
                        <div className="share-link-meta">
                          만료: {new Date(link.expiresAt).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                    </div>
                    <div className="share-link-actions">
                      <button
                        className="btn btn-ghost share-link-copy-btn"
                        onClick={() => handleCopy(link)}
                        title="URL 복사"
                      >
                        {copiedId === link.id ? '복사됨!' : '복사'}
                      </button>
                      <button
                        className="btn share-link-delete-btn"
                        onClick={() => onDeleteLink(link.id)}
                        title="링크 삭제"
                        aria-label="링크 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Create new link */}
          <div className="share-create-section">
            <p className="share-section-label">새 링크 만들기</p>
            <div className="form-row" style={{ alignItems: 'flex-end' }}>
              <div className="form-field form-field-grow">
                <label className="form-label">권한</label>
                <select
                  className="form-select"
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as SharePermission)}
                >
                  <option value="view">보기 전용</option>
                  <option value="edit">편집 가능</option>
                </select>
              </div>
              <div className="form-field form-field-grow">
                <label className="form-label">만료일 (선택)</label>
                <input
                  type="date"
                  className="form-input"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span className="modal-footer-hint">링크는 언제든지 취소할 수 있습니다.</span>
          <div className="modal-footer-actions">
            <button className="btn btn-ghost" onClick={onClose}>
              취소
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              + 링크 만들기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
