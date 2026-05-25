// EOGlobalAnalytics — overall Expression Orale performance across all parties
// Displays: aggregate stats, per-partie breakdown, score timeline, criteria averages.

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Spin, Empty, Progress, Tag } from 'antd';
import {
  LoadingOutlined, BarChartOutlined, TrophyOutlined, ClockCircleOutlined,
  FireOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

interface PerPartie {
  partie_id: number | null;
  partie_name: string;
  month_name: string | null;
  year: number | null;
  attempts: number;
  avg_score: number | null;
  best_score: number | null;
  last_attempt: string | null;
}

interface TimelineEntry {
  id: number;
  overall_score: number | null;
  tache1_score: number | null;
  tache2_score: number | null;
  tache3_score: number | null;
  completed_at: string;
}

interface AnalyticsData {
  global: {
    total_sessions: number;
    avg_overall: number | null;
    avg_tache1: number | null;
    avg_tache2: number | null;
    avg_tache3: number | null;
    best_overall: number | null;
    worst_overall: number | null;
    total_duration_seconds: number | null;
  };
  perPartie: PerPartie[];
  timeline: TimelineEntry[];
  avgCriteria: Record<string, number> | null;
}

interface Props { open: boolean; onClose: () => void; }

const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDur = (s: number | null) => {
  if (!s) return '0m';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
const scoreColor = (s: number | null | undefined) => {
  const v = Number(s) || 0;
  if (v >= 14) return '#22c55e';
  if (v >= 10) return '#f59e0b';
  return '#ef4444';
};
const scoreLevel = (s: number | null | undefined): string => {
  const v = Number(s) || 0;
  if (v >= 16) return 'Excellent';
  if (v >= 14) return 'Très bien';
  if (v >= 12) return 'Bien';
  if (v >= 10) return 'Satisfaisant';
  return 'À améliorer';
};

const EOGlobalAnalytics: React.FC<Props> = ({ open, onClose }) => {
  const { apiCall } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const r = await apiCall('/eo-simulation/analytics');
        if (r.ok) setData(await r.json());
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [open, apiCall]);

  // Insights
  const insights = useMemo(() => {
    if (!data || data.global.total_sessions === 0) return [];
    const list: string[] = [];
    const avg = Number(data.global.avg_overall) || 0;
    list.push(`Vous avez complété ${data.global.total_sessions} simulation${data.global.total_sessions > 1 ? 's' : ''} d'expression orale.`);
    list.push(`Score moyen global: ${avg.toFixed(1)}/20 (${scoreLevel(avg)}).`);

    if (data.perPartie.length > 0) {
      const completed = data.perPartie.filter(p => p.partie_id !== null);
      if (completed.length > 1) {
        const sorted = [...completed].sort((a, b) => Number(b.best_score || 0) - Number(a.best_score || 0));
        const best = sorted[0];
        const worst = sorted[sorted.length - 1];
        if (best.best_score) list.push(`Meilleure partie: "${best.partie_name}" (${best.month_name || ''} ${best.year || ''}) avec ${Number(best.best_score).toFixed(1)}/20.`);
        if (worst.best_score && worst.partie_id !== best.partie_id) {
          list.push(`Partie à retravailler: "${worst.partie_name}" — ${Number(worst.best_score).toFixed(1)}/20. Continuez à pratiquer !`);
        }
      }
    }

    if (data.timeline.length >= 2) {
      const first = Number(data.timeline[0].overall_score) || 0;
      const last = Number(data.timeline[data.timeline.length - 1].overall_score) || 0;
      const diff = last - first;
      if (diff > 0.5) list.push(`📈 Vous avez progressé de ${diff.toFixed(1)} points depuis votre première simulation.`);
      else if (diff < -0.5) list.push(`📉 Vos derniers scores sont inférieurs de ${Math.abs(diff).toFixed(1)} points à votre première simulation. Restez constant.`);
      else list.push(`📊 Votre niveau reste stable.`);
    }

    if (data.global.total_duration_seconds) {
      list.push(`Temps total de pratique: ${fmtDur(data.global.total_duration_seconds)}.`);
    }
    return list;
  }, [data]);

  // Compute timeline width steps for the SVG chart
  const chart = useMemo(() => {
    if (!data?.timeline || data.timeline.length === 0) return null;
    const maxY = 20;
    const width = 100;
    const height = 100;
    const points = data.timeline.map((t, i) => {
      const x = data.timeline.length === 1 ? width / 2 : (i / (data.timeline.length - 1)) * width;
      const y = height - ((Number(t.overall_score) || 0) / maxY) * height;
      return { x, y, score: Number(t.overall_score) || 0, date: t.completed_at };
    });
    return { points, width, height };
  }, [data?.timeline]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={960}
      destroyOnClose
      title={null}
      className="exam-modal exam-modal-analytics"
      styles={{ body: { padding: 0 }, content: { padding: 0, borderRadius: 16, overflow: 'hidden' } }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
        padding: '28px 28px 20px', color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: '40%', width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <BarChartOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1.2 }}>Analyse globale</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>Performance Expression Orale</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Vue d'ensemble de toutes vos simulations TCF/TEF</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 22, maxHeight: 'calc(90vh - 160px)', overflowY: 'auto', background: '#f8fafc' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: '#10b981' }} spin />} />
            <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 13 }}>Chargement des analyses...</div>
          </div>
        ) : !data || data.global.total_sessions === 0 ? (
          <Empty description="Aucune simulation terminée. Lancez votre première pratique pour voir votre analyse !" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 80 }} />
        ) : (
          <>
            {/* Global stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
              <BigStatCard
                label="Score moyen"
                value={Number(data.global.avg_overall || 0).toFixed(1)}
                unit="/20"
                color={scoreColor(data.global.avg_overall)}
                icon={<BarChartOutlined />}
                sub={scoreLevel(data.global.avg_overall)}
              />
              <BigStatCard
                label="Meilleur score"
                value={Number(data.global.best_overall || 0).toFixed(1)}
                unit="/20"
                color="#22c55e"
                icon={<TrophyOutlined />}
                sub="record personnel"
              />
              <BigStatCard
                label="Tentatives"
                value={String(data.global.total_sessions)}
                unit=""
                color="#10b981"
                icon={<CheckCircleOutlined />}
                sub="simulations"
              />
              <BigStatCard
                label="Pratique"
                value={fmtDur(data.global.total_duration_seconds)}
                unit=""
                color="#0ea5e9"
                icon={<ClockCircleOutlined />}
                sub="temps total"
              />
            </div>

            {/* Per-tâche averages */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 18, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Performance par tâche</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { num: 1, label: 'Présentation', score: data.global.avg_tache1, icon: '👋' },
                  { num: 2, label: 'Interaction', score: data.global.avg_tache2, icon: '💬' },
                  { num: 3, label: 'Argumentation', score: data.global.avg_tache3, icon: '⚖️' },
                ].map(t => {
                  const v = Number(t.score) || 0;
                  return (
                    <div key={t.num} style={{ padding: 12, borderRadius: 10, background: scoreColor(v) + '08', border: `1px solid ${scoreColor(v)}30` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 16 }}>{t.icon}</span>
                        <div>
                          <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>TÂCHE {t.num}</div>
                          <div style={{ fontSize: 11, color: '#0f172a', fontWeight: 600 }}>{t.label}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor(v) }}>
                        {v.toFixed(1)}<span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 2 }}>/20</span>
                      </div>
                      <Progress percent={Math.round((v / 20) * 100)} showInfo={false} size="small" strokeColor={scoreColor(v)} trailColor="#e2e8f0" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score timeline */}
            {chart && data.timeline.length >= 2 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 18, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Progression dans le temps</div>
                <svg viewBox={`0 0 ${chart.width} ${chart.height}`} preserveAspectRatio="none" style={{ width: '100%', height: 140, background: 'linear-gradient(to bottom, #ecfdf5, #f8fafc)', borderRadius: 8 }}>
                  {/* Grid lines */}
                  {[0, 5, 10, 15, 20].map(score => {
                    const y = chart.height - (score / 20) * chart.height;
                    return (
                      <g key={score}>
                        <line x1="0" y1={y} x2={chart.width} y2={y} stroke="#e2e8f0" strokeWidth="0.3" />
                        <text x="1" y={y - 1} fontSize="3" fill="#94a3b8">{score}</text>
                      </g>
                    );
                  })}
                  {/* Polyline */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.8"
                    strokeLinejoin="round"
                    points={chart.points.map(p => `${p.x},${p.y}`).join(' ')}
                  />
                  {/* Points */}
                  {chart.points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="#047857" stroke="#fff" strokeWidth="0.3" />
                  ))}
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#94a3b8' }}>
                  <span>{fmtDate(data.timeline[0].completed_at)}</span>
                  <span>{fmtDate(data.timeline[data.timeline.length - 1].completed_at)}</span>
                </div>
              </div>
            )}

            {/* Criteria averages */}
            {data.avgCriteria && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 18, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Critères d'évaluation (moyennes)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                  {[
                    { key: 'coherence', label: 'Cohérence', icon: '🧩' },
                    { key: 'vocabulary', label: 'Vocabulaire', icon: '📚' },
                    { key: 'grammar', label: 'Grammaire', icon: '📝' },
                    { key: 'fluency', label: 'Fluidité', icon: '🎤' },
                    { key: 'task_completion', label: 'Tâche', icon: '✅' },
                  ].map(c => {
                    const v = Number(data.avgCriteria?.[c.key] ?? 0);
                    return (
                      <div key={c.key} style={{ padding: 10, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                          <span style={{ fontSize: 13 }}>{c.icon}</span>
                          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{c.label}</span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: scoreColor(v) }}>
                          {v.toFixed(1)}<span style={{ fontSize: 10, color: '#94a3b8' }}>/20</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Per-partie breakdown */}
            {data.perPartie.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 18, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Performance par partie</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.perPartie.map(p => {
                    const avg = Number(p.avg_score) || 0;
                    const best = Number(p.best_score) || 0;
                    return (
                      <div key={`${p.partie_id}-${p.last_attempt}`} style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: scoreColor(avg) + '15', border: `2px solid ${scoreColor(avg)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: scoreColor(avg), lineHeight: 1 }}>{avg.toFixed(1)}</div>
                          <div style={{ fontSize: 7, color: scoreColor(avg), opacity: 0.7 }}>moy.</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{p.partie_name}</div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 2, fontSize: 10, color: '#94a3b8', flexWrap: 'wrap' }}>
                            {p.month_name && p.year && <span>{p.month_name} {p.year}</span>}
                            <Tag style={{ fontSize: 9, padding: '0 4px', background: '#10b98115', color: '#047857', border: 'none', margin: 0 }}>{p.attempts} tentative{p.attempts > 1 ? 's' : ''}</Tag>
                            <Tag style={{ fontSize: 9, padding: '0 4px', background: '#fef3c7', color: '#a16207', border: 'none', margin: 0 }}>Meilleur: {best.toFixed(1)}/20</Tag>
                            {p.last_attempt && <span>· {fmtDate(p.last_attempt)}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Insights */}
            {insights.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)', borderRadius: 12, padding: 16, border: '1px solid #6ee7b7' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FireOutlined /> Analyse personnalisée
                </div>
                {insights.map((line, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#0f172a', lineHeight: 1.7, marginBottom: 4 }}>
                    • {line}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

const BigStatCard: React.FC<{ label: string; value: string; unit: string; color: string; icon: React.ReactNode; sub?: string }> = ({ label, value, unit, color, icon, sub }) => (
  <div style={{
    padding: 14, borderRadius: 12, background: '#fff',
    border: `1px solid ${color}33`, boxShadow: `0 1px 4px ${color}10`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <span style={{ color, fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>
      {value}<span style={{ fontSize: 12, opacity: 0.7, marginLeft: 2 }}>{unit}</span>
    </div>
    {sub && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
  </div>
);

export default EOGlobalAnalytics;
