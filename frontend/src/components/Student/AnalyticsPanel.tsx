import type { ReactNode } from 'react';
import { Button, ConfigProvider, Drawer, Segmented, Skeleton } from 'antd';
import { AudioOutlined, BarChartOutlined, CloseOutlined, ReloadOutlined, SoundOutlined } from '@ant-design/icons';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CRITERIA, LEVELS, LEVEL_NAMES, percent, scoreText, dateText } from './analyticsModel';
import './ExamAnalytics.css';

interface PanelProps {
  open: boolean; onClose: () => void; title: string; subtitle: string; tone?: 'co' | 'eo';
  tab: string; onTab: (value: string) => void; tabs: { label: string; value: string }[];
  loading: boolean; error: string | null; retry: () => void; empty: boolean; children: ReactNode;
}
export function AnalyticsPanel({ open, onClose, title, subtitle, tone = 'co', tab, onTab, tabs, loading, error, retry, empty, children }: PanelProps) {
  return <ConfigProvider theme={{ token: { colorPrimary: tone === 'co' ? '#6d28d9' : '#047857', borderRadius: 8 } }}>
    <Drawer open={open} onClose={onClose} placement="right" width="min(780px, 100vw)" rootClassName={`exam-analytics is-${tone}`}
      destroyOnHidden closable={false} styles={{ body: { padding: 0 } }}
      title={<div className="ea-panel-heading"><span className="ea-panel-icon" aria-hidden>{tone === 'co' ? <SoundOutlined /> : <AudioOutlined />}</span><div><span className="ea-eyebrow">{subtitle}</span><h2>{title}</h2></div></div>}
      extra={<Button className="ea-close" type="text" icon={<CloseOutlined />} onClick={onClose} aria-label="Fermer les résultats" />}>
      <div className="ea-nav"><Segmented value={tab} onChange={onTab} options={tabs} block aria-label="Vues des résultats" /></div>
      <div className="ea-body">
        {loading ? <div className="ea-loading" role="status" aria-label="Chargement des résultats"><Skeleton active paragraph={{ rows: 3 }} /><Skeleton active paragraph={{ rows: 6 }} /></div>
          : error ? <div className="ea-state" role="alert"><BarChartOutlined /><h3>Résultats indisponibles</h3><p>{error}</p><Button icon={<ReloadOutlined />} onClick={retry}>Réessayer</Button></div>
          : empty ? <div className="ea-state"><BarChartOutlined /><h3>Votre progression commence ici</h3><p>Terminez un entraînement pour découvrir vos scores, vos points forts et vos prochains objectifs.</p></div>
          : children}
      </div>
    </Drawer>
  </ConfigProvider>;
}

export function AnalyticsSection({ title, note, extra, children }: { title: string; note?: string; extra?: ReactNode; children: ReactNode }) {
  return <section className="ea-section"><header className="ea-section-head"><div><h3>{title}</h3>{note && <p>{note}</p>}</div>{extra}</header>{children}</section>;
}
export function ScoreHero({ score, total, label, level, note, children }: { score: number | null; total: number; label: string; level?: string | null; note: string; children?: ReactNode }) {
  return <section className="ea-hero"><div className="ea-hero-top"><div><span className="ea-eyebrow">{label}</span><div className="ea-score">{scoreText(score, total === 20 ? 1 : 0)}<small>/ {total || '—'}</small></div><p>{note}</p></div>
    {level && <div className="ea-level-seal"><span>Niveau</span><strong>{level}</strong><span>{LEVEL_NAMES[LEVELS.indexOf(level)] || 'Estimé'}</span></div>}</div>
    {level && <div className="ea-level-scale" aria-label={`Niveau estimé ${level}`}>{LEVELS.map(l => <span key={l} className={l === level ? 'is-current' : ''}>{l}<i /></span>)}</div>}
    {children && <div className="ea-hero-stats">{children}</div>}
  </section>;
}
export function Metric({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return <div className="ea-metric"><span>{icon}{label}</span><strong>{value}</strong></div>;
}
export function Meter({ value, max = 100, label }: { value: number; max?: number; label: string }) {
  return <div className="ea-meter" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(max, Math.max(0, value))}><i style={{ width: `${percent(value, max)}%` }} /></div>;
}

export interface TrendPoint { date: string; score: number; label: string }
export function ScoreTrend({ points, max, note }: { points: TrendPoint[]; max: number; note: string }) {
  const rows = [...points].filter(p => Number.isFinite(Number(p.score))).sort((a, b) => Date.parse(a.date) - Date.parse(b.date)).map((p, i) => ({ ...p, score: Number(p.score), index: i + 1 }));
  return <AnalyticsSection title="Évolution des scores" note={note} extra={<span className="ea-count">{rows.length} résultats</span>}>
    {rows.length ? <>
      <div className="ea-chart" aria-label={`Évolution de ${rows.length} scores sur ${max}`}><ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 12, right: 18, bottom: 0, left: -22 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="#e9edf3" strokeDasharray="3 4" />
          <XAxis dataKey="index" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} minTickGap={24} tickFormatter={i => `#${i}`} />
          <YAxis domain={[0, max]} ticks={[0, Math.round(max / 2), max]} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={({ active, payload }) => { const p = payload?.[0]?.payload as (TrendPoint | undefined); return active && p ? <div className="ea-chart-tip"><strong>{p.label}</strong><span>{dateText(p.date)}</span><b>{scoreText(p.score, max === 20 ? 1 : 0)} / {max}</b></div> : null; }} />
          <Line type="linear" dataKey="score" stroke="var(--ea-accent)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--ea-accent)', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer></div>
      <div className="ea-chart-caption"><span>{dateText(rows[0].date)}</span><span>{rows.length === 1 ? 'Une première référence pour la suite' : dateText(rows[rows.length - 1].date)}</span></div>
      <details className="ea-chart-data"><summary>Voir les valeurs</summary><ol>{rows.map((p, i) => <li key={i}><span>{p.label} · {dateText(p.date)}</span><strong>{scoreText(p.score, max === 20 ? 1 : 0)} / {max}</strong></li>)}</ol></details>
    </> : <p className="ea-muted">Aucun score disponible.</p>}
  </AnalyticsSection>;
}
export function TaskScores({ scores }: { scores: (number | null)[] }) {
  return <div className="ea-task-grid">{['Présentation', 'Interaction', 'Argumentation'].map((label, i) => <div className="ea-task" key={label}><span>Tâche {i + 1}</span><h4>{label}</h4><strong>{scoreText(scores[i])}<small>/ 20</small></strong>{scores[i] != null && <Meter value={Number(scores[i])} max={20} label={label} />}</div>)}</div>;
}
export function CriteriaScores({ criteria }: { criteria: Record<string, number> }) {
  return <div className="ea-criteria">{CRITERIA.map(([key, label]) => <div key={key}><div><span>{label}</span><strong>{scoreText(criteria[key])}<small> / 20</small></strong></div>{criteria[key] != null && <Meter value={Number(criteria[key])} max={20} label={label} />}</div>)}</div>;
}

