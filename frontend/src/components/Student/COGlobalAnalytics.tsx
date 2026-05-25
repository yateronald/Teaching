import React, { useState, useEffect } from 'react';
import { Modal, Spin, Tooltip } from 'antd';
import { LoadingOutlined, CloseOutlined, SoundOutlined, TrophyOutlined, BarChartOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

interface SeriesBreakdown {
  series_id: number; series_name: string; attempts: number;
  best_earned: number; best_total: number;
  latest_earned: number; latest_total: number; latest_date: string;
}
interface RecentAttempt {
  id: number; series_name: string; earned_points: number; total_points: number;
  correct_count: number; total_questions: number; level: string;
  completed_at: string; time_spent_seconds: number;
}
interface Progression { date: string; earned: number; total: number; series: string; level: string; }
interface GlobalData {
  total_attempts: number; series_count: number;
  overall_level: string | null; overall_earned: number; overall_total: number;
  series_breakdown: SeriesBreakdown[]; cefr_distribution: Record<string, number>;
  recent_attempts: RecentAttempt[]; score_progression: Progression[];
}
interface Props { open: boolean; onClose: () => void; }

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LC: Record<string, string> = { A1: '#10b981', A2: '#22d3ee', B1: '#a78bfa', B2: '#f472b6', C1: '#fb923c', C2: '#ef4444' };
const LB: Record<string, string> = { A1: '#ecfdf5', A2: '#ecfeff', B1: '#f5f3ff', B2: '#fdf2f8', C1: '#fff7ed', C2: '#fef2f2' };
const LEVEL_NAMES: Record<string, string> = {
  A1: 'Elementary', A2: 'Lower Intermediate', B1: 'Intermediate',
  B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Superior / Mastery',
};
const getCefrFromPoints = (pts: number): string => {
  if (pts >= 600) return 'C2'; if (pts >= 500) return 'C1'; if (pts >= 400) return 'B2';
  if (pts >= 300) return 'B1'; if (pts >= 200) return 'A2'; return 'A1';
};
const fmt = (s: number) => `${Math.floor(s / 60)}m${(s % 60).toString().padStart(2, '0')}s`;

const COGlobalAnalytics: React.FC<Props> = ({ open, onClose }) => {
  const { apiCall } = useAuth();
  const [data, setData] = useState<GlobalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const r = await apiCall('/tcf/student/co/global-analytics');
        if (r.ok) setData(await r.json());
      } catch {} finally { setLoading(false); }
    })();
  }, [open, apiCall]);

  // Compute insights
  const insights: string[] = [];
  if (data && data.total_attempts > 0) {
    const lv = data.overall_level || 'A1';
    insights.push(`Your current overall CO level is ${lv} (${LEVEL_NAMES[lv]}), based on your best scores across ${data.series_count} series.`);

    if (data.series_breakdown.length > 1) {
      const best = data.series_breakdown.reduce((a, b) => a.best_earned > b.best_earned ? a : b);
      const worst = data.series_breakdown.reduce((a, b) => a.best_earned < b.best_earned ? a : b);
      insights.push(`Strongest series: "${best.series_name}" (${best.best_earned}/${best.best_total} pts — ${getCefrFromPoints(best.best_earned)})`);
      if (worst.series_id !== best.series_id) {
        insights.push(`Weakest series: "${worst.series_name}" (${worst.best_earned}/${worst.best_total} pts — ${getCefrFromPoints(worst.best_earned)}). Focus practice here.`);
      }
    }
    if (data.score_progression.length >= 2) {
      const first = data.score_progression[0];
      const last = data.score_progression[data.score_progression.length - 1];
      const diff = last.earned - first.earned;
      if (diff > 0) insights.push(`📈 You've improved by ${diff} points since your first attempt!`);
      else if (diff < 0) insights.push(`📉 Your recent scores are ${Math.abs(diff)} points below your first attempt. Keep practicing!`);
    }
    const totalTime = data.recent_attempts.reduce((s, a) => s + a.time_spent_seconds, 0);
    if (totalTime > 0) {
      const hrs = Math.floor(totalTime / 3600);
      const mins = Math.floor((totalTime % 3600) / 60);
      insights.push(`Total practice time: ${hrs > 0 ? `${hrs}h ` : ''}${mins}m across ${data.total_attempts} attempts.`);
    }
  }

  return (
    <Modal open={open} onCancel={onClose} centered width={740} footer={null} title={null}
      closeIcon={null}
      className="exam-modal exam-modal-analytics"
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(90vh - 40px)', overflow: 'hidden' }, content: { padding: 0, borderRadius: 16, overflow: 'hidden' } }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        padding: '24px 28px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(139,92,246,0.1)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '50%', width: 80, height: 80, borderRadius: '50%', background: 'rgba(59,130,246,0.08)' }} />
        <div onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 8,
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          transition: 'all 0.15s', zIndex: 2,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
        >
          <CloseOutlined style={{ color: '#f87171', fontSize: 12, fontWeight: 700 }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SoundOutlined style={{ fontSize: 20, color: '#a78bfa' }} />
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Global Performance
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', margin: '2px 0 0' }}>
              Compréhension Orale
            </h2>
          </div>
        </div>
      </div>

      {loading || !data ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: '#8b5cf6' }} spin />} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Loading analytics...</span>
        </div>
      ) : data.total_attempts === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8', fontSize: 13 }}>
          No attempts recorded yet. Complete a series to see your global analytics.
        </div>
      ) : (
        <div style={{ padding: '20px 28px 28px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { v: String(data.total_attempts), l: 'Total Attempts', c: '#3b82f6' },
              { v: String(data.series_count), l: 'Series Practiced', c: '#8b5cf6' },
              { v: `${data.overall_earned}/${data.overall_total}`, l: 'Avg Best Score', c: '#10b981' },
              { v: data.overall_level || '—', l: 'Overall Level', c: LC[data.overall_level || ''] || '#64748b' },
            ].map(k => (
              <div key={k.l} style={{ textAlign: 'center', padding: '14px 8px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: k.l === 'Overall Level' ? 22 : 18, fontWeight: 800, color: k.c }}>{k.v}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* CEFR Distribution */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChartOutlined style={{ color: '#8b5cf6' }} /> CEFR Level Distribution
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>(across all attempts)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
              {LEVELS.map(lv => {
                const count = data.cefr_distribution[lv] || 0;
                const maxCount = Math.max(...Object.values(data.cefr_distribution), 1);
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <Tooltip key={lv} title={`${count} attempt${count !== 1 ? 's' : ''} at ${lv} (${LEVEL_NAMES[lv]})`}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        height: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                        alignItems: 'center', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9',
                        marginBottom: 4, position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: '100%', height: `${pct}%`, minHeight: count > 0 ? 4 : 0,
                          background: `linear-gradient(180deg, ${LC[lv]}, ${LC[lv]}cc)`,
                          borderRadius: '0 0 6px 6px', transition: 'height 0.5s ease',
                        }} />
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                          fontSize: 13, fontWeight: 800, color: pct > 50 ? '#fff' : '#475569',
                        }}>{count}</div>
                      </div>
                      <div style={{ padding: '3px 0', borderRadius: 5, background: LB[lv], fontSize: 11, fontWeight: 700, color: LC[lv] }}>{lv}</div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Score Progression */}
          {data.score_progression.length >= 2 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>
                Score Progression <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>(last {data.score_progression.length} attempts)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 70, padding: '0 4px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                {data.score_progression.map((p, i) => {
                  const maxPts = Math.max(...data.score_progression.map(x => x.total), 1);
                  const h = Math.max(4, (p.earned / maxPts) * 60);
                  const isLast = i === data.score_progression.length - 1;
                  return (
                    <Tooltip key={i} title={`${p.series}: ${p.earned}/${p.total} pts (${p.level})`}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '4px 0' }}>
                        <div style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600 }}>{p.earned}</div>
                        <div style={{
                          width: '100%', maxWidth: 20, height: h, borderRadius: 3,
                          background: isLast ? `linear-gradient(180deg, ${LC[p.level]}, ${LC[p.level]}cc)` : 'linear-gradient(180deg, #e2e8f0, #cbd5e1)',
                          transition: 'height 0.3s ease',
                        }} />
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}

          {/* Series Breakdown */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrophyOutlined style={{ color: '#f59e0b' }} /> Series Breakdown
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.series_breakdown.map((s, i) => {
                const lv = getCefrFromPoints(s.best_earned);
                return (
                  <div key={s.series_id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 60px',
                    gap: 8, padding: '10px 14px', borderRadius: 8,
                    background: i === 0 ? '#f0f2ff' : '#f8fafc',
                    border: `1px solid ${i === 0 ? '#e0e4f8' : '#f1f5f9'}`,
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{s.series_name}</div>
                      <div style={{ fontSize: 9, color: '#94a3b8' }}>{s.attempts} attempt{s.attempts !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{s.best_earned}/{s.best_total}</div>
                      <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase' }}>Best</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{s.latest_earned}/{s.latest_total}</div>
                      <div style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase' }}>Latest</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        background: LB[lv], color: LC[lv],
                      }}>{lv}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: 'linear-gradient(135deg, #faf5ff, #f0f9ff)', border: '1px solid #e9d5ff' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>Insights & Recommendations</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {insights.map((t, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#6b21a8', lineHeight: 1.5, paddingLeft: 8, borderLeft: '2px solid #c4b5fd' }}>{t}</div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Attempts */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
              Recent Attempts <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>({data.total_attempts} total)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {data.recent_attempts.slice(0, 5).map((a, i) => (
                <div key={a.id} style={{
                  padding: '8px 12px', borderRadius: 8,
                  background: i === 0 ? '#f0f2ff' : '#f8fafc',
                  border: `1px solid ${i === 0 ? '#e0e4f8' : '#f1f5f9'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i === 0 ? '#8b5cf6' : '#e2e8f0',
                      color: i === 0 ? '#fff' : '#94a3b8', fontSize: 9, fontWeight: 700,
                    }}>
                      {i === 0 ? '★' : i + 1}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.series_name} — {a.earned_points}/{a.total_points} pts
                      </div>
                      <div style={{ fontSize: 9, color: '#94a3b8' }}>
                        {new Date(a.completed_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} · {fmt(a.time_spent_seconds)}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '2px 8px', borderRadius: 5, background: LB[a.level] || '#f5f3ff', color: LC[a.level] || '#8b5cf6', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {a.level}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default COGlobalAnalytics;
