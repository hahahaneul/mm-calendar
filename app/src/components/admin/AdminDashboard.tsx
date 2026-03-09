/**
 * AdminDashboard.tsx
 * Admin view: progress overview with daily + weekly stats per member.
 */

import { useState } from 'react';
import type { Member } from '../../types';
import { getWeekKey, formatWeekLabel, toDateKey } from '../../utils/weekUtils';

interface AdminDashboardProps {
  members: Member[];
  getWeeklyProgress: (memberId: string, weekKey: string) => number;
  getDailyProgress: (memberId: string, dateKey: string) => { total: number; completed: number; percent: number };
  getTodoCount: (memberId: string, weekKey: string) => { total: number; completed: number };
  onSelectMember: (id: string) => void;
}

export function AdminDashboard({
  members,
  getWeeklyProgress,
  getDailyProgress,
  getTodoCount,
  onSelectMember,
}: AdminDashboardProps) {
  const weekKey = getWeekKey(new Date());
  const todayKey = toDateKey(new Date());
  const [copied, setCopied] = useState(false);

  const reportData = members.map((m) => {
    const { total, completed } = getTodoCount(m.id, weekKey);
    const weekly = getWeeklyProgress(m.id, weekKey);
    const daily = getDailyProgress(m.id, todayKey);
    return { member: m, total, completed, weekly, daily };
  });

  const avgWeekly = reportData.length > 0
    ? Math.round(reportData.reduce((s, r) => s + r.weekly, 0) / reportData.length)
    : 0;
  const avgDaily = reportData.length > 0
    ? Math.round(reportData.reduce((s, r) => s + r.daily.percent, 0) / reportData.length)
    : 0;

  const handleCopyReport = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lines = [
      `[일일 진행 리포트] ${dateStr} 17:50`,
      `${formatWeekLabel(weekKey)}`,
      '',
      ...reportData.map(
        (r) => `${r.member.name} (${r.member.email}): 오늘 ${r.daily.completed}/${r.daily.total} (${r.daily.percent}%) | 주간 ${r.completed}/${r.total} (${r.weekly}%)`,
      ),
      '',
      `평균 진행률: 오늘 ${avgDaily}% | 주간 ${avgWeekly}%`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const barColor = (pct: number) =>
    pct === 100 ? '#10b981' : pct >= 50 ? '#3b82f6' : '#f59e0b';

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h2 className="admin-dashboard-title">관리자 대시보드</h2>
        <span className="admin-dashboard-week">{formatWeekLabel(weekKey)}</span>
      </div>

      {/* Summary row */}
      <div className="admin-summary">
        <div className="admin-summary-card">
          <span className="admin-summary-label">오늘 평균</span>
          <div className="admin-summary-bar-wrap">
            <div className="admin-summary-bar">
              <div className="admin-summary-fill" style={{ width: `${avgDaily}%`, backgroundColor: barColor(avgDaily) }} />
            </div>
            <span className="admin-summary-pct">{avgDaily}%</span>
          </div>
        </div>
        <div className="admin-summary-card">
          <span className="admin-summary-label">주간 평균</span>
          <div className="admin-summary-bar-wrap">
            <div className="admin-summary-bar">
              <div className="admin-summary-fill" style={{ width: `${avgWeekly}%`, backgroundColor: barColor(avgWeekly) }} />
            </div>
            <span className="admin-summary-pct">{avgWeekly}%</span>
          </div>
        </div>
      </div>

      {/* Report copy button */}
      <div className="admin-report-actions">
        <button className="btn btn-primary" onClick={handleCopyReport}>
          {copied ? '복사됨!' : '일일 리포트 복사'}
        </button>
        <p className="admin-report-hint">
          매일 오후 5:50 이메일 리포트는 백엔드 연동 시 자동 발송됩니다.
        </p>
      </div>

      {/* Member progress cards */}
      <div className="admin-member-grid">
        {reportData.map((r) => (
          <button
            key={r.member.id}
            className="admin-member-card"
            onClick={() => onSelectMember(r.member.id)}
          >
            <div className="admin-member-card-header">
              <span className="member-avatar-dot" style={{ backgroundColor: r.member.color }} />
              <span className="admin-member-name">{r.member.name}</span>
              <span className="admin-member-role">
                {r.member.role === 'admin' ? '관리자' : '팀원'}
              </span>
            </div>

            {/* Daily */}
            <div className="admin-progress-row">
              <span className="admin-progress-label">오늘</span>
              <div className="admin-progress-bar">
                <div className="admin-progress-fill" style={{ width: `${r.daily.percent}%`, backgroundColor: barColor(r.daily.percent) }} />
              </div>
              <span className="admin-progress-pct">{r.daily.percent}%</span>
            </div>
            <div className="admin-member-stats">
              <span>{r.daily.completed}/{r.daily.total} 완료</span>
            </div>

            {/* Weekly */}
            <div className="admin-progress-row">
              <span className="admin-progress-label">주간</span>
              <div className="admin-progress-bar">
                <div className="admin-progress-fill" style={{ width: `${r.weekly}%`, backgroundColor: barColor(r.weekly) }} />
              </div>
              <span className="admin-progress-pct">{r.weekly}%</span>
            </div>
            <div className="admin-member-stats">
              <span>{r.completed}/{r.total} 완료</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
