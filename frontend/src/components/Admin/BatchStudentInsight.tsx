import React, { useEffect, useMemo, useState } from 'react';
import { Input, Select, Skeleton } from 'antd';
import { CheckCircleFilled, ClockCircleOutlined, FallOutlined, RiseOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { formatPlain } from '../../utils/timezone';
import { DEFAULT_FILTERS, computeView, fmtNum, fmtPct, initialsOf, toneOf } from '../Insights/insightsModel';
import type { InsightsData } from '../Insights/insightsModel';
import '../Insights/BatchInsights.css';

/* ══════════════════════════════════════════
   STUDENT REPORT — one student's results inside the batch, compared with the class.
══════════════════════════════════════════ */

interface Props {
  batchId: string;
  data?: InsightsData | null;
  studentId?: number | null;
  onStudentChange?: (id: number) => void;
}

const BatchStudentInsight: React.FC<Props> = ({ batchId, data, studentId, onStudentChange }) => {
  const { apiCall, user } = useAuth();
  const external = data !== undefined;
  const [own, setOwn] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(!external);
  const [localId, setLocalId] = useState<number | null>(studentId ?? null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (external || !batchId) return;
    let cancelled = false;
    setLoading(true);
    apiCall(`/batches/${batchId}/insights`)
      .then(res => (res.ok ? res.json() : null))
      .then(d => { if (!cancelled) setOwn(d); })
      .catch(() => { if (!cancelled) setOwn(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [batchId, external, apiCall]);

  useEffect(() => { if (studentId != null) setLocalId(studentId); }, [studentId]);

  const source = external ? data : own;
  const view = useMemo(() => (source ? computeView(source, DEFAULT_FILTERS) : null), [source]);
  const list = useMemo(() => {
    if (!view) return [];
    const q = query.trim().toLowerCase();
    return [...view.studentStats]
      .sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1))
      .filter(s => !q || `${s.name} ${s.email}`.toLowerCase().includes(q));
  }, [view, query]);

  const selectedId = localId ?? list[0]?.id ?? null;
  const select = (id: number) => { setLocalId(id); onStudentChange?.(id); };

  if (!external && loading) return <div className="bi"><div className="bi-card bi-pad"><Skeleton active avatar paragraph={{ rows: 6 }} /></div></div>;
  if (!source || !view || view.studentStats.length === 0) {
    return (
      <div className="bi">
        <div className="bi-empty">
          <span className="bi-empty-ic"><UserOutlined /></span>
          <strong>No students in this batch</strong>
          <span>Enrol students to follow their results here.</span>
        </div>
      </div>
    );
  }

  const pass = view.pass;
  const s = view.studentStats.find(x => x.id === selectedId) || view.studentStats[0];
  const rows = view.quizStats.map(q => ({ q, c: view.cellMap.get(`${s.id}:${q.quiz_id}`) || null }));
  const scored = rows.filter(r => r.c && r.c.pct !== null) as { q: typeof rows[number]['q']; c: NonNullable<typeof rows[number]['c']> }[];
  const best = [...scored].sort((a, b) => (b.c.pct as number) - (a.c.pct as number))[0];
  const worst = [...scored].sort((a, b) => (a.c.pct as number) - (b.c.pct as number))[0];
  const delta = s.avg !== null && view.avg !== null ? s.avg - view.avg : null;
  const missing = rows.filter(r => !r.c).length;
  const fmtDate = (iso: string) => formatPlain(iso, user?.timezone, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bi bi-sr">
      {/* ── Student list ── */}
      <aside className="bi-card bi-sr-list" aria-label="Students">
        <div className="bi-sr-search">
          <Input prefix={<SearchOutlined />} allowClear placeholder="Search students" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <ul>
          {list.map(x => (
            <li key={x.id}>
              <button type="button" className={x.id === s.id ? 'is-on' : ''} onClick={() => select(x.id)} aria-pressed={x.id === s.id}>
                <span className="bi-av">{initialsOf(x.name)}</span>
                <span className="bi-sr-name"><strong>{x.name}</strong><em>{x.submitted}/{x.expected} quizzes{x.risk ? ' · needs support' : ''}</em></span>
                <span className={`bi-score ${toneOf(x.avg, pass)}`}>{fmtPct(x.avg)}</span>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="bi-muted-line">No student matches.</li>}
        </ul>
      </aside>

      <div className="bi-sr-select">
        <Select showSearch optionFilterProp="label" value={s.id} onChange={select} style={{ width: '100%' }}
          options={view.studentStats.map(x => ({ value: x.id, label: `${x.name} · ${fmtPct(x.avg)}` }))} />
      </div>

      {/* ── Report ── */}
      <div className="bi-sr-report">
        <section className="bi-card bi-sr-head">
          <span className="bi-av is-lg">{initialsOf(s.name)}</span>
          <div className="bi-sr-id">
            <h3>{s.name}</h3>
            <p>{s.email}</p>
            <div className="bi-sr-tags">
              {s.rank !== null && <span className="bi-pill is-rank">Rank {s.rank} of {view.ranked.length}</span>}
              {s.risk ? <span className="bi-pill is-f">Needs support</span> : s.avg !== null && <span className="bi-pill is-b">On track</span>}
              {s.last && <span className="bi-pill is-none"><ClockCircleOutlined /> Last submission {fmtDate(s.last)}</span>}
            </div>
          </div>
          <div className={`bi-sr-grade ${toneOf(s.avg, pass)}`}>
            <strong>{s.grade}</strong>
            <span>{fmtPct(s.avg)}</span>
          </div>
        </section>

        <section className="bi-kpis is-compact">
          <div className="bi-kpi">
            <span className="bi-kpi-label">Vs class average</span>
            <div className="bi-kpi-row">
              <strong className={delta === null ? '' : delta >= 0 ? 'is-up' : 'is-down'}>
                {delta === null ? '—' : `${delta >= 0 ? '+' : ''}${Math.round(delta)} pts`}
              </strong>
            </div>
            <span className="bi-kpi-sub">Class average {fmtPct(view.avg)}</span>
          </div>
          <div className="bi-kpi">
            <span className="bi-kpi-label">Quizzes done</span>
            <div className="bi-kpi-row"><strong>{s.submitted}</strong><span className="bi-kpi-of">/ {s.expected}</span></div>
            <div className="bi-meter"><i style={{ width: `${s.completion}%` }} className={s.completion < 50 ? 'is-low' : ''} /></div>
          </div>
          <div className="bi-kpi">
            <span className="bi-kpi-label">Passed</span>
            <div className="bi-kpi-row"><strong>{s.passed}</strong><span className="bi-kpi-of">/ {s.passed + s.failed}</span></div>
            <span className="bi-kpi-sub">At {pass}% or more</span>
          </div>
          <div className="bi-kpi">
            <span className="bi-kpi-label">Points</span>
            <div className="bi-kpi-row"><strong>{fmtNum(s.points)}</strong><span className="bi-kpi-of">/ {fmtNum(s.maxPoints)}</span></div>
            <span className="bi-kpi-sub">{missing ? `${missing} ${missing === 1 ? 'quiz' : 'quizzes'} not submitted` : 'Every quiz submitted'}</span>
          </div>
        </section>

        {(best || worst) && scored.length > 1 && (
          <div className="bi-grid">
            <div className="bi-callout is-good"><RiseOutlined /><span><strong>Strongest</strong>{best.q.title} · {fmtPct(best.c.pct)}</span></div>
            <div className="bi-callout is-warn"><FallOutlined /><span><strong>To work on</strong>{worst.q.title} · {fmtPct(worst.c.pct)}</span></div>
          </div>
        )}

        <section className="bi-card">
          <header className="bi-card-head"><span className="bi-card-title"><CheckCircleFilled /> Quiz by quiz</span><span className="bi-muted">Marker = class average</span></header>
          <ul className="bi-sq">
            {rows.map(({ q, c }) => (
              <li key={q.quiz_id} className={c ? '' : 'is-missing'}>
                <span className="bi-sq-title"><b>#{q.order}</b><span><strong>{q.title}</strong><em>{c ? `Submitted ${fmtDate(c.submitted_at)}` : 'Not submitted'}</em></span></span>
                <span className="bi-sq-bar">
                  <span className="bi-sq-track">
                    {c && c.pct !== null && <i className={toneOf(c.pct, pass)} style={{ width: `${Math.max(2, c.pct)}%` }} />}
                    {q.avg !== null && <span className="bi-sq-mark" style={{ left: `${q.avg}%` }} title={`Class average ${fmtPct(q.avg)}`} />}
                  </span>
                </span>
                <span className="bi-sq-score">
                  <span className={`bi-score ${c ? toneOf(c.pct, pass) : 'is-none'}`}>{c ? fmtPct(c.pct) : '—'}</span>
                  <em>{c && c.score !== null && c.max !== null ? `${fmtNum(c.score)}/${fmtNum(c.max)}` : ''}</em>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default BatchStudentInsight;
