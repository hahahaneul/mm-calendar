/**
 * WebhookManagerModal.tsx
 * View/manage webhooks: list with status control, add new webhook.
 */

import { useState } from 'react';
import type { WebhookSubscription } from '../../types';

const ALL_EVENTS = [
  'event.created',
  'event.updated',
  'event.deleted',
  'project.created',
  'project.updated',
];

interface WebhookManagerModalProps {
  webhooks: WebhookSubscription[];
  onAddWebhook: (endpoint: string, events: string[]) => void;
  onUpdateStatus: (id: string, status: WebhookSubscription['status']) => void;
  onDeleteWebhook: (id: string) => void;
  onClose: () => void;
}

export function WebhookManagerModal({
  webhooks,
  onAddWebhook,
  onUpdateStatus,
  onDeleteWebhook,
  onClose,
}: WebhookManagerModalProps) {
  const [endpoint, setEndpoint] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set(['event.created']));
  const [endpointError, setEndpointError] = useState('');

  function toggleEvent(evt: string) {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(evt)) next.delete(evt);
      else next.add(evt);
      return next;
    });
  }

  function handleAdd() {
    if (!endpoint.trim()) {
      setEndpointError('엔드포인트 URL을 입력해 주세요.');
      return;
    }
    if (selectedEvents.size === 0) {
      setEndpointError('이벤트를 하나 이상 선택해 주세요.');
      return;
    }
    setEndpointError('');
    onAddWebhook(endpoint.trim(), Array.from(selectedEvents));
    setEndpoint('');
    setSelectedEvents(new Set(['event.created']));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">웹훅 관리</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Webhook list */}
          <div>
            <p className="share-section-label">활성 웹훅</p>
            {webhooks.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <span className="empty-state-icon">📡</span>
                <span className="empty-state-text">등록된 웹훅이 없습니다</span>
              </div>
            ) : (
              <div className="webhook-manager-list">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="webhook-manager-row">
                    <div className="webhook-manager-left">
                      <span className={`webhook-status-dot ${wh.status}`} />
                      <div className="webhook-manager-endpoint">{wh.endpoint}</div>
                      <div className="webhook-manager-events">
                        {wh.events.map((ev) => (
                          <span key={ev} className="webhook-event-tag">{ev}</span>
                        ))}
                      </div>
                    </div>
                    <div className="webhook-manager-controls">
                      <select
                        className="form-select webhook-status-select"
                        value={wh.status}
                        onChange={(e) =>
                          onUpdateStatus(wh.id, e.target.value as WebhookSubscription['status'])
                        }
                      >
                        <option value="active">활성</option>
                        <option value="paused">일시정지</option>
                        <option value="failed">실패</option>
                      </select>
                      <button
                        className="btn share-link-delete-btn"
                        onClick={() => onDeleteWebhook(wh.id)}
                        aria-label="웹훅 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new webhook */}
          <div className="share-create-section">
            <p className="share-section-label">웹훅 추가</p>
            <div className="form-field">
              <label className="form-label">엔드포인트 URL <span className="form-required">*</span></label>
              <input
                type="url"
                className={`form-input${endpointError ? ' form-input-error' : ''}`}
                placeholder="https://example.com/webhook"
                value={endpoint}
                onChange={(e) => { setEndpoint(e.target.value); setEndpointError(''); }}
              />
              {endpointError && <span className="form-error">{endpointError}</span>}
            </div>
            <div className="form-field">
              <label className="form-label">이벤트</label>
              <div className="webhook-event-checkboxes">
                {ALL_EVENTS.map((ev) => (
                  <label key={ev} className="webhook-event-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedEvents.has(ev)}
                      onChange={() => toggleEvent(ev)}
                    />
                    {ev}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span className="modal-footer-hint">페이로드는 HMAC-SHA256으로 서명됩니다.</span>
          <div className="modal-footer-actions">
            <button className="btn btn-ghost" onClick={onClose}>
              닫기
            </button>
            <button className="btn btn-primary" onClick={handleAdd}>
              + 웹훅 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
