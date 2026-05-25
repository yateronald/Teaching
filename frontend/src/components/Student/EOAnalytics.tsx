// EO Analytics — per-partie performance history modal
// Shows all of the student's completed simulations for a given partie,
// with score breakdown, criteria averages, and a list of past attempts.

import React, { useState, useEffect } from 'react';
import { Modal, Spin, Empty, Tag, Progress } from 'antd';
import { LoadingOutlined, TrophyOutlined, BarChartOutlined, ClockCircleOutlined, AudioOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

interface HistoryItem {
  id: number;
  partie_id: number | null;
  overall_score: number | null;
  tache1_score: number | null;
  tache2_score: number | null;
  tache3_score: number | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  criteria_scores: Record<string, number> | string | null;
  partie_name?: string | null;
  month_name?: string | null;
  year?: number | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  partieId: number;
  partieName: string;
}

const fmtDate = (s: string) => new Date(s).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const fmtDur = (s: number) => `${Math.floor(s / 60)}m${(s % 60).toString().padStart(2, '0')}s`;
const scoreColor = (s: number | null | undefined) => {
  const v = Number(s) || 0;
  if (v >= 14) return '#22c55e';
  if (v >= 10) return '#f59e0b';
  return '#ef4444';
};

const parseCriteria = (raw: HistoryItem['criteria_scores']): Record<string, number> => {
  if (!raw) return {};
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return {}; } }
  return raw;
};

const EOAnalytics: React.FC<Props> = ({ open, onClose, partieId, partieName }) => {
  const { apiCall } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const r = await apiCall(`/eo-simulation/history?partieId=${partieId}`);
        if (r.ok) setHistory(await r.json());
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [open, partieId, apiCall]);

  const loadDetail = async (id: number) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const r = await apiCall(`/eo-simulation/${id}`);
      if (r.ok) setDetail(await r.json());
    } catch { /* ignore */ }
    finally { setDetailLoading(false); }
  };

  // Aggregate stats
  const stats = (() => {
    const completed = history.filter(h => h.overall_score !== null);
    if (completed.length === 0) return null;
    const avg = (key: keyof HistoryItem) => {
      const vals = completed.map(h => Number(h[key]) || 0);
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    };
    const best = Math.max(...completed.map(h => Number(h.overall_score) || 0));
    return {
      attempts: completed.length,
      avgOverall: avg('overall_score'),
      avgT1: avg('tache1_score'),
      avgT2: avg('tache2_score'),
      avgT3: avg('tache3_score'),
      best,
    };
  })();

  // Aggregate criteria
  const avgCriteria = (() => {
    const totals: Record<string, number> = { coherence: 0, vocabulary: 0, grammar: 0, fluency: 0, task_completion: 0 };
    let count = 0;
    history.forEach(h => {
      const c = parseCriteria(h.criteria_scores);
      if (c && Object.keys(c).length > 0) {
        count++;
        Object.keys(totals).forEach(k => { totals[k] += Number(c[k]) || 0; });
      }
    });
    if (count === 0) return null;
    return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, v / count]));
  })();

  return (
    <Modal
      open={open}
      onCancel={() => { onClose(); setSelectedId(null); setDetail(null); }}
      footer={null}
      width={920}
      destroyOnClose
      title={null}
      className="exam-modal exam-modal-analytics"
      styles={{ body: { padding: 0 }, content: { padding: 0, borderRadius: 16, overflow: 'hidden' } }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
        padding: '20px 24px', color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChartOutlined style={{ fontSize: 20, color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1 }}>Analyse — Expression Orale</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{partieName}</div>
          </div>
          {stats && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, opacity: 0.85, letterSpacing: 0.5, textTransform: 'uppercase' }}>Tentatives</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{stats.attempts}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: 22, maxHeight: 'calc(90vh - 140px)', overflowY: 'auto', background: '#f8fafc' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#10b981' }} spin />} />
          </div>
        ) : history.length === 0 ? (
          <Empty description="Aucune simulation terminée pour cette partie. Lancez votre première pratique !" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 60 }} />
        ) : (
          <>
            {/* Summary cards */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 18 }}>
                <StatCard label="Score moyen" value={stats.avgOverall.toFixed(1)} unit="/20" color={scoreColor(stats.avgOverall)} icon={<BarChartOutlined />} />
                <StatCard label="Meilleur score" value={stats.best.toFixed(1)} unit="/20" color="#22c55e" icon={<TrophyOutlined />} />
                <StatCard label="Tâche 1 (moy.)" value={stats.avgT1.toFixed(1)} unit="/20" color={scoreColor(stats.avgT1)} icon={<AudioOutlined />} />
                <StatCard label="Tâche 2 (moy.)" value={stats.avgT2.toFixed(1)} unit="/20" color={scoreColor(stats.avgT2)} icon={<AudioOutlined />} />
                <StatCard label="Tâche 3 (moy.)" value={stats.avgT3.toFixed(1)} unit="/20" color={scoreColor(stats.avgT3)} icon={<AudioOutlined />} />
              </div>
            )}

            {/* Criteria averages */}
            {avgCriteria && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 18, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Critères d'évaluation (moyennes)</div>
                {[
                  { key: 'coherence', label: 'Cohérence et organisation' },
                  { key: 'vocabulary', label: 'Vocabulaire' },
                  { key: 'grammar', label: 'Grammaire' },
                  { key: 'fluency', label: 'Fluidité' },
                  { key: 'task_completion', label: 'Réalisation de la tâche' },
                ].map(c => {
                  const v = avgCriteria[c.key] || 0;
                  return (
                    <div key={c.key} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: '#475569' }}>{c.label}</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{v.toFixed(1)}/20</span>
                      </div>
                      <Progress percent={Math.round((v / 20) * 100)} showInfo={false} size="small" strokeColor={{ '0%': '#10b981', '100%': '#059669' }} trailColor="#f1f5f9" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Past attempts list */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Historique des tentatives</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.map(h => (
                  <AttemptRow key={h.id} item={h} onClick={() => loadDetail(h.id)} active={selectedId === h.id} />
                ))}
              </div>
            </div>

            {/* Detail panel */}
            {selectedId && (
              <div style={{ marginTop: 16, background: '#fff', borderRadius: 12, padding: 16, border: '2px solid #10b981' }}>
                {detailLoading ? (
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#10b981' }} spin />} />
                ) : detail ? (
                  <DetailPanel detail={detail} />
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>Aucun détail disponible</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

const StatCard: React.FC<{ label: string; value: string; unit: string; color: string; icon: React.ReactNode }> = ({ label, value, unit, color, icon }) => (
  <div style={{
    padding: 14, borderRadius: 12, background: '#fff',
    border: `1px solid ${color}33`, boxShadow: `0 1px 3px ${color}10`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <span style={{ color }}>{icon}</span>
      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>
      {value}<span style={{ fontSize: 11, opacity: 0.7, marginLeft: 2 }}>{unit}</span>
    </div>
  </div>
);

const AttemptRow: React.FC<{ item: HistoryItem; onClick: () => void; active: boolean }> = ({ item, onClick, active }) => {
  const overall = Number(item.overall_score) || 0;
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 14px', borderRadius: 10,
        background: active ? '#ecfdf5' : '#f8fafc',
        border: `1px solid ${active ? '#10b981' : '#e2e8f0'}`,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 12,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f1f5f9'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
    >
      <div style={{ width: 50, height: 50, borderRadius: 12, background: scoreColor(overall) + '15', border: `2px solid ${scoreColor(overall)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: scoreColor(overall), lineHeight: 1 }}>{overall.toFixed(1)}</div>
        <div style={{ fontSize: 9, color: scoreColor(overall), opacity: 0.7 }}>/20</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag style={{ fontSize: 10, padding: '0 6px', background: '#10b98115', color: '#047857', border: 'none' }}>T1: {Number(item.tache1_score || 0).toFixed(1)}</Tag>
          <Tag style={{ fontSize: 10, padding: '0 6px', background: '#10b98115', color: '#047857', border: 'none' }}>T2: {Number(item.tache2_score || 0).toFixed(1)}</Tag>
          <Tag style={{ fontSize: 10, padding: '0 6px', background: '#10b98115', color: '#047857', border: 'none' }}>T3: {Number(item.tache3_score || 0).toFixed(1)}</Tag>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 11, color: '#94a3b8' }}>
          {item.completed_at && (
            <span><CalendarOutlined /> {fmtDate(item.completed_at)}</span>
          )}
          {item.duration_seconds != null && (
            <span><ClockCircleOutlined /> {fmtDur(item.duration_seconds)}</span>
          )}
        </div>
      </div>
      <div style={{ fontSize: 11, color: active ? '#10b981' : '#94a3b8', fontWeight: 600 }}>
        {active ? '✓ Détails ci-dessous' : 'Voir les détails'}
      </div>
    </div>
  );
};

const DetailPanel: React.FC<{ detail: any }> = ({ detail }) => {
  const criteria = parseCriteria(detail.criteria_scores);
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
        Détails de la simulation #{detail.id}
      </div>

      {/* Per-tâche scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {[
          { num: 1, score: detail.tache1_score, label: 'Présentation', feedback: detail.tache1_feedback, prompt: detail.tache1_prompt, transcript: detail.tache1_transcript, points: detail.tache1_points },
          { num: 2, score: detail.tache2_score, label: 'Interaction', feedback: detail.tache2_feedback, prompt: detail.tache2_prompt, transcript: detail.tache2_transcript },
          { num: 3, score: detail.tache3_score, label: 'Argumentation', feedback: detail.tache3_feedback, prompt: detail.tache3_prompt, transcript: detail.tache3_transcript },
        ].map(t => (
          <div key={t.num} style={{ padding: 10, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, letterSpacing: 0.3 }}>TÂCHE {t.num}</div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: scoreColor(Number(t.score)) }}>
              {Number(t.score || 0).toFixed(1)}<span style={{ fontSize: 10, color: '#94a3b8' }}>/20</span>
            </div>
          </div>
        ))}
      </div>

      {/* Criteria */}
      {criteria && Object.keys(criteria).length > 0 && (
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Critères</div>
          {[
            { key: 'coherence', label: 'Cohérence' },
            { key: 'vocabulary', label: 'Vocabulaire' },
            { key: 'grammar', label: 'Grammaire' },
            { key: 'fluency', label: 'Fluidité' },
            { key: 'task_completion', label: 'Tâche' },
          ].map(c => {
            const v = Number(criteria[c.key]) || 0;
            return (
              <div key={c.key} style={{ marginBottom: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: '#475569' }}>{c.label}</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{v.toFixed(0)}/20</span>
                </div>
                <Progress percent={Math.round((v / 20) * 100)} showInfo={false} size="small" strokeColor="#10b981" trailColor="#e2e8f0" />
              </div>
            );
          })}
        </div>
      )}

      {/* Per-tâche feedback + transcript */}
      {[
        { num: 1, label: 'Présentation', feedback: detail.tache1_feedback, prompt: detail.tache1_prompt, transcript: detail.tache1_transcript, points: detail.tache1_points },
        { num: 2, label: 'Interaction', feedback: detail.tache2_feedback, prompt: detail.tache2_prompt, transcript: detail.tache2_transcript },
        { num: 3, label: 'Argumentation', feedback: detail.tache3_feedback, prompt: detail.tache3_prompt, transcript: detail.tache3_transcript },
      ].map(t => (
        <div key={t.num} style={{ marginBottom: 10, background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>Tâche {t.num} — {t.label}</div>
          {t.prompt && (
            <div style={{ background: '#ecfdf5', padding: 8, borderRadius: 6, marginBottom: 6, fontSize: 11, color: '#065f46', lineHeight: 1.5 }}>
              <strong>Sujet:</strong> {t.prompt}
            </div>
          )}
          {t.points && Array.isArray(t.points) && t.points.length > 0 && (
            <div style={{ marginBottom: 6, fontSize: 11, color: '#475569' }}>
              <strong>Points à aborder:</strong> {t.points.map((p: any) => p.title).join(' · ')}
            </div>
          )}
          {t.transcript && (
            <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, marginBottom: 6, fontSize: 11, color: '#64748b', lineHeight: 1.5, fontStyle: 'italic', maxHeight: 80, overflowY: 'auto' }}>
              <strong style={{ fontStyle: 'normal' }}>Votre réponse:</strong> {t.transcript}
            </div>
          )}
          {t.feedback && (
            <div style={{ fontSize: 11, color: '#0f172a', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              <strong>Retour:</strong> {t.feedback}
            </div>
          )}
        </div>
      ))}

      {detail.overall_feedback && (
        <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #f0fdfa)', borderRadius: 10, padding: 12, border: '1px solid #6ee7b7' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#047857', marginBottom: 4 }}>Message de l'examinateur</div>
          <p style={{ fontSize: 12, color: '#0f172a', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{detail.overall_feedback}</p>
        </div>
      )}
    </div>
  );
};

export default EOAnalytics;
