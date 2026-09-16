import React, { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Segmented, Select, Skeleton, Tooltip } from 'antd';
import {
    BulbOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, ReloadOutlined, RiseOutlined, TeamOutlined,
    TrophyOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { formatPlain } from '../../utils/timezone';
import { gradeFromPercent } from '../../utils/grading';
import { DEFAULT_FILTERS, computeView, fmtPct, initialsOf, toneOf } from '../Insights/insightsModel';
import type { Filters, InsightsData, InsightsView } from '../Insights/insightsModel';
import '../Insights/BatchInsights.css';

/* ══════════════════════════════════════════
   BATCH PERFORMANCE — used on the admin Batch insights page and in the teacher batch drawer.
   Pass `data` when the parent already loaded /batches/:id/insights; otherwise it fetches itself.
══════════════════════════════════════════ */

interface Props {
    batchId: string;
    data?: InsightsData | null;
    onOpenStudent?: (studentId: number) => void;
}

const PASS_OPTIONS = [40, 50, 60, 70, 75, 80];
const TAKEAWAY_ICON = { good: <RiseOutlined />, warn: <WarningOutlined />, bad: <CloseCircleOutlined />, info: <InfoCircleOutlined /> };

/* ── Submissions over time ── */
const TimelineChart: React.FC<{ points: InsightsView['timeline']; expected: number; tz?: string | null }> = ({ points, expected, tz }) => {
    const W = 600;
    const H = 150;
    const top = Math.max(expected, points[points.length - 1]?.cum || 0, 1);
    const coords: [number, number][] = [[0, H], ...points.map((p, i) => [((i + 1) / points.length) * W, H - (p.cum / top) * (H - 8)] as [number, number])];
    const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const area = `${line} L${W},${H} L0,${H} Z`;
    const goalY = H - (expected / top) * (H - 8);
    const label = (d: string) => formatPlain(`${d}T12:00:00Z`, tz, { month: 'short', day: 'numeric' });
    return (
        <div className="bi-timeline">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
                <defs>
                    <linearGradient id="bi-area" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {expected > 0 && <line x1="0" x2={W} y1={goalY} y2={goalY} className="bi-timeline-goal" />}
                <path d={area} fill="url(#bi-area)" />
                <path d={line} className="bi-timeline-line" />
            </svg>
            <div className="bi-timeline-axis">
                <span>{label(points[0].day)}</span>
                {points.length > 2 && <span>{label(points[Math.floor(points.length / 2)].day)}</span>}
                <span>{label(points[points.length - 1].day)}</span>
            </div>
        </div>
    );
};

const BatchInsights: React.FC<Props> = ({ batchId, data, onOpenStudent }) => {
    const { apiCall, user } = useAuth();
    const external = data !== undefined;
    const [own, setOwn] = useState<InsightsData | null>(null);
    const [ownLoading, setOwnLoading] = useState(!external);
    const [ownError, setOwnError] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [quizSort, setQuizSort] = useState<'order' | 'score' | 'completion'>('order');
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (external || !batchId) return;
        let cancelled = false;
        setOwnLoading(true);
        apiCall(`/batches/${batchId}/insights`)
            .then(async res => {
                if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not load the insights');
                return res.json();
            })
            .then(d => { if (!cancelled) { setOwn(d); setOwnError(null); } })
            .catch(e => { if (!cancelled) setOwnError(e?.message || 'Could not load the insights'); })
            .finally(() => { if (!cancelled) setOwnLoading(false); });
        return () => { cancelled = true; };
    }, [batchId, external, apiCall]);

    const source = external ? data : own;
    const view = useMemo(() => (source ? computeView(source, filters) : null), [source, filters]);

    if (!external && ownLoading) return <div className="bi"><div className="bi-card bi-pad"><Skeleton active paragraph={{ rows: 8 }} /></div></div>;
    if (!source || !view) {
        return (
            <div className="bi">
                <div className="bi-empty">
                    <span className="bi-empty-ic"><InfoCircleOutlined /></span>
                    <strong>No insights available</strong>
                    <span>{ownError || 'This batch has no quiz data yet.'}</span>
                </div>
            </div>
        );
    }

    const pass = filters.passMark;
    const isDefault = !filters.studentIds.length && !filters.quizIds.length && !filters.range && filters.passMark === DEFAULT_FILTERS.passMark;
    const noQuizzes = source.quizzes.length === 0;
    const scoredCount = view.cells.filter(c => c.pct !== null).length;
    const passCount = view.cells.filter(c => c.pct !== null && (c.pct as number) >= pass).length;
    const bandMax = Math.max(1, ...view.bands.map(b => b.count));
    const sortedQuizzes = [...view.quizStats].sort((a, b) =>
        quizSort === 'score' ? (a.avg ?? 101) - (b.avg ?? 101) : quizSort === 'completion' ? a.completion - b.completion : a.order - b.order);
    const board = showAll ? view.ranked : view.ranked.slice(0, 8);
    const heatStudents = [...view.studentStats].sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));

    return (
        <div className="bi">
            {/* ── Filters ── */}
            <div className="bi-filters">
                <Select mode="multiple" allowClear maxTagCount="responsive" placeholder="All students" className="bi-f-wide"
                    value={filters.studentIds} onChange={v => setFilters(f => ({ ...f, studentIds: v }))} optionFilterProp="label"
                    options={source.students.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}`.trim() || s.email }))} />
                <Select mode="multiple" allowClear maxTagCount="responsive" placeholder="All quizzes" className="bi-f-wide"
                    value={filters.quizIds} onChange={v => setFilters(f => ({ ...f, quizIds: v }))} optionFilterProp="label"
                    options={source.quizzes.map(q => ({ value: q.quiz_id, label: q.quiz_title }))} />
                <DatePicker.RangePicker className="bi-f-range" value={filters.range} format="MMM D, YYYY" placeholder={['Submitted from', 'To']}
                    onChange={v => setFilters(f => ({ ...f, range: v && v[0] && v[1] ? [v[0], v[1]] : null }))} />
                <Tooltip title="Scores at or above this mark count as a pass in this view">
                    <Select className="bi-f-pass" value={pass} onChange={v => setFilters(f => ({ ...f, passMark: v }))}
                        options={PASS_OPTIONS.map(p => ({ value: p, label: `Pass mark ${p}%` }))} />
                </Tooltip>
                {!isDefault && <Button type="link" size="small" icon={<ReloadOutlined />} onClick={() => setFilters(DEFAULT_FILTERS)}>Reset</Button>}
            </div>

            {noQuizzes ? (
                <div className="bi-empty">
                    <span className="bi-empty-ic"><BulbOutlined /></span>
                    <strong>No quizzes assigned yet</strong>
                    <span>Assign quizzes to this batch to see scores, completion and trends here.</span>
                </div>
            ) : (
                <>
                    {/* ── KPIs ── */}
                    <section className="bi-kpis" aria-label="Key numbers">
                        <div className={`bi-kpi ${view.avg === null ? '' : toneOf(view.avg, pass)}`}>
                            <span className="bi-kpi-label">Class average</span>
                            <div className="bi-kpi-row">
                                <strong>{fmtPct(view.avg)}</strong>
                                {view.avg !== null && <span className="bi-grade">{gradeFromPercent(view.avg)}</span>}
                            </div>
                            <span className="bi-kpi-sub">{scoredCount} graded {scoredCount === 1 ? 'submission' : 'submissions'}</span>
                        </div>
                        <div className="bi-kpi">
                            <span className="bi-kpi-label">Completion</span>
                            <div className="bi-kpi-row"><strong>{fmtPct(view.completion)}</strong></div>
                            <div className="bi-meter"><i style={{ width: `${Math.min(100, view.completion)}%` }} /></div>
                            <span className="bi-kpi-sub">{view.submitted} of {view.expected} submissions</span>
                        </div>
                        <div className="bi-kpi">
                            <span className="bi-kpi-label">Pass rate</span>
                            <div className="bi-kpi-row"><strong>{fmtPct(view.passRate)}</strong></div>
                            <span className="bi-kpi-sub">{passCount} of {scoredCount} at {pass}% or more</span>
                        </div>
                        <div className={`bi-kpi${view.atRisk.length ? ' is-alert' : ''}`}>
                            <span className="bi-kpi-label">Need support</span>
                            <div className="bi-kpi-row"><strong>{view.atRisk.length}</strong><span className="bi-kpi-of">/ {view.students.length}</span></div>
                            <span className="bi-kpi-sub">{view.atRisk.length ? 'Below pass mark or < 50% done' : 'Everyone is on track'}</span>
                        </div>
                    </section>

                    {/* ── Takeaways + distribution ── */}
                    <div className="bi-grid">
                        <section className="bi-card">
                            <header className="bi-card-head"><span className="bi-card-title"><BulbOutlined /> Key takeaways</span></header>
                            <div className="bi-card-body">
                                {view.takeaways.length === 0 ? <div className="bi-muted-line">Not enough submissions yet to draw conclusions.</div> : (
                                    <ul className="bi-takeaways">
                                        {view.takeaways.map(t => (
                                            <li key={t.key} className={`is-${t.tone}`}>
                                                <span className="bi-take-ic">{TAKEAWAY_ICON[t.tone]}</span>
                                                <span><strong>{t.title}</strong><em>{t.text}</em></span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                        <section className="bi-card">
                            <header className="bi-card-head"><span className="bi-card-title"><TrophyOutlined /> Grade distribution</span></header>
                            <div className="bi-card-body">
                                {scoredCount === 0 ? <div className="bi-muted-line">No graded submissions in this view.</div> : (
                                    <>
                                        <ul className="bi-bands">
                                            {view.bands.map(b => (
                                                <li key={b.label} className={`is-${b.label.toLowerCase()}`}>
                                                    <span className="bi-band-label"><b>{b.label}</b>{b.range}%</span>
                                                    <span className="bi-band-track"><i style={{ width: `${(b.count / bandMax) * 100}%` }} /></span>
                                                    <span className="bi-band-val">{b.count}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="bi-passbar" aria-label={`${passCount} passed, ${scoredCount - passCount} below pass mark`}>
                                            {passCount > 0 && <i className="is-pass" style={{ flexGrow: passCount }} />}
                                            {scoredCount - passCount > 0 && <i className="is-fail" style={{ flexGrow: scoredCount - passCount }} />}
                                        </div>
                                        <div className="bi-passlegend">
                                            <span><i className="is-pass" />Passed <b>{passCount}</b></span>
                                            <span><i className="is-fail" />Below {pass}% <b>{scoredCount - passCount}</b></span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ── Quiz performance ── */}
                    <section className="bi-card">
                        <header className="bi-card-head">
                            <span className="bi-card-title"><CheckCircleOutlined /> Quiz performance</span>
                            <Segmented size="small" value={quizSort} onChange={v => setQuizSort(v as typeof quizSort)}
                                options={[{ value: 'order', label: 'In order' }, { value: 'score', label: 'Lowest score' }, { value: 'completion', label: 'Lowest completion' }]} />
                        </header>
                        <div className="bi-qtable" role="table" aria-label="Quiz performance">
                            <div className="bi-qrow is-head" role="row">
                                <span role="columnheader">Quiz</span>
                                <span role="columnheader">Completion</span>
                                <span role="columnheader">Average · range</span>
                                <span role="columnheader">Passed</span>
                            </div>
                            {sortedQuizzes.map(q => (
                                <div key={q.quiz_id} className="bi-qrow" role="row">
                                    <span className="bi-qtitle" role="cell"><b>#{q.order}</b><span>{q.title}</span></span>
                                    <span className="bi-qcell" role="cell">
                                        <span className="bi-meter is-sm"><i style={{ width: `${q.completion}%` }} className={q.completion < 50 ? 'is-low' : ''} /></span>
                                        <em>{q.submitted}/{q.expected}</em>
                                    </span>
                                    <span className="bi-qcell" role="cell">
                                        <Tooltip title={q.min !== null ? `Lowest ${fmtPct(q.min)} · highest ${fmtPct(q.max)}` : 'No scores yet'}>
                                            <span className="bi-range">
                                                {q.min !== null && <span className="bi-range-span" style={{ left: `${q.min}%`, width: `${Math.max(1, (q.max as number) - q.min)}%` }} />}
                                                {q.avg !== null && <span className={`bi-range-dot ${toneOf(q.avg, pass)}`} style={{ left: `${q.avg}%` }} />}
                                                <span className="bi-range-pass" style={{ left: `${pass}%` }} />
                                            </span>
                                        </Tooltip>
                                        <em className={`bi-score ${toneOf(q.avg, pass)}`}>{fmtPct(q.avg)}</em>
                                    </span>
                                    <span className="bi-qcell" role="cell"><span className={`bi-pill ${q.passRate === null ? 'is-none' : q.passRate >= 70 ? 'is-b' : q.passRate >= 50 ? 'is-c' : 'is-f'}`}>{fmtPct(q.passRate)}</span></span>
                                </div>
                            ))}
                        </div>
                        <p className="bi-foot">Bar = spread between the lowest and highest score · dot = class average · line = pass mark ({pass}%).</p>
                    </section>

                    {/* ── Timeline + leaderboard ── */}
                    <div className="bi-grid">
                        <section className="bi-card">
                            <header className="bi-card-head"><span className="bi-card-title"><RiseOutlined /> Submissions over time</span></header>
                            <div className="bi-card-body">
                                {view.timeline.length === 0 ? <div className="bi-muted-line">No submissions in this view.</div> : (
                                    <>
                                        <div className="bi-tl-head">
                                            <strong>{view.submitted}</strong><span>of {view.expected} expected · dashed line = everyone done</span>
                                        </div>
                                        <TimelineChart points={view.timeline} expected={view.expected} tz={user?.timezone} />
                                    </>
                                )}
                            </div>
                        </section>
                        <section className="bi-card">
                            <header className="bi-card-head">
                                <span className="bi-card-title"><TeamOutlined /> Leaderboard</span>
                                {view.ranked.length > 8 && <button type="button" className="bi-link" onClick={() => setShowAll(v => !v)}>{showAll ? 'Show top 8' : `Show all ${view.ranked.length}`}</button>}
                            </header>
                            <div className="bi-card-body is-flush">
                                {board.length === 0 ? <div className="bi-muted-line">No graded students yet.</div> : (
                                    <ol className="bi-board">
                                        {board.map(s => (
                                            <li key={s.id}>
                                                <button type="button" onClick={() => onOpenStudent?.(s.id)} disabled={!onOpenStudent}>
                                                    <span className={`bi-rank${s.rank && s.rank <= 3 ? ` is-top${s.rank}` : ''}`}>{s.rank}</span>
                                                    <span className="bi-av">{initialsOf(s.name)}</span>
                                                    <span className="bi-board-name"><strong>{s.name}</strong><em>{s.submitted}/{s.expected} quizzes{s.risk ? ' · needs support' : ''}</em></span>
                                                    <span className="bi-board-bar"><i className={toneOf(s.avg, pass)} style={{ width: `${Math.max(3, s.avg ?? 0)}%` }} /></span>
                                                    <span className={`bi-score ${toneOf(s.avg, pass)}`}>{fmtPct(s.avg)}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ── Gradebook heatmap ── */}
                    <section className="bi-card">
                        <header className="bi-card-head">
                            <span className="bi-card-title"><TrophyOutlined /> Gradebook</span>
                            <span className="bi-heat-legend">
                                <span><i className="is-a" />85+</span><span><i className="is-b" />70–84</span>
                                <span><i className="is-c" />{pass}–69</span><span><i className="is-f" />&lt;{pass}</span><span><i className="is-none" />Missing</span>
                            </span>
                        </header>
                        <div className="bi-heat-wrap">
                            <table className="bi-heat">
                                <thead>
                                    <tr>
                                        <th scope="col">Student</th>
                                        {view.quizStats.map(q => <th key={q.quiz_id} scope="col"><Tooltip title={q.title}><span>#{q.order}</span></Tooltip></th>)}
                                        <th scope="col">Average</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {heatStudents.map(s => (
                                        <tr key={s.id} className={onOpenStudent ? 'is-click' : ''} onClick={() => onOpenStudent?.(s.id)}>
                                            <th scope="row"><span className="bi-av is-sm">{initialsOf(s.name)}</span><span className="bi-heat-name">{s.name}</span></th>
                                            {view.quizStats.map(q => {
                                                const c = view.cellMap.get(`${s.id}:${q.quiz_id}`);
                                                const p = c?.pct ?? null;
                                                return (
                                                    <td key={q.quiz_id}>
                                                        <Tooltip title={`${q.title}: ${c ? fmtPct(p) : 'not submitted'}`}>
                                                            <span className={`bi-heat-cell ${c ? toneOf(p, pass) : 'is-none'}`}>{c ? (p === null ? '✓' : Math.round(p)) : '–'}</span>
                                                        </Tooltip>
                                                    </td>
                                                );
                                            })}
                                            <td><span className={`bi-score ${toneOf(s.avg, pass)}`}>{fmtPct(s.avg)}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default BatchInsights;
