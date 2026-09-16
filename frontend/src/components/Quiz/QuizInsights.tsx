import React, { useMemo } from 'react';
import { Button } from 'antd';
import { BarChartOutlined, ClockCircleOutlined, RiseOutlined, TeamOutlined, TrophyOutlined, WarningOutlined } from '@ant-design/icons';
import { PASS_MARK, fmtMinutes, fmtPct, gradeFromPercent, initials, isFinished, makeWhen, plural, summarize, toneOfScore } from './quizModel';
import type { QuizRow, ResultRow } from './quizModel';

/* ══════════════════════════════════════════
   RESULTS OVERVIEW — how the class did on one quiz.
   Every figure comes from the same deduplicated student list as the Students tab.
══════════════════════════════════════════ */

interface Props {
    quiz: QuizRow;
    rows: ResultRow[];
    tz: string;
    onOpenStudent: (row: ResultRow) => void;
    onShow: (tab: 'students' | 'questions') => void;
}

const BAND_TONE: Record<string, string> = { A: 'is-a', B: 'is-b', C: 'is-c', D: 'is-d', F: 'is-f' };

/** Cumulative submissions over time against the class size. */
const Timeline: React.FC<{ rows: ResultRow[]; total: number; tz: string }> = ({ rows, total, tz }) => {
    const when = makeWhen(tz);
    const times = rows.filter(r => isFinished(r.status) && r.submittedAt).map(r => Date.parse(r.submittedAt as string)).filter(Number.isFinite).sort((a, b) => a - b);
    if (times.length < 2) return <p className="tc-muted-line">The curve appears after the second submission.</p>;
    const W = 600;
    const H = 140;
    const t0 = times[0];
    const t1 = times[times.length - 1] === t0 ? t0 + 1 : times[times.length - 1];
    const top = Math.max(total, times.length, 1);
    const x = (t: number) => ((t - t0) / (t1 - t0)) * W;
    const y = (n: number) => H - (n / top) * (H - 6);
    let d = `M0,${H}`;
    times.forEach((t, i) => { d += ` L${x(t).toFixed(1)},${y(i).toFixed(1)} L${x(t).toFixed(1)},${y(i + 1).toFixed(1)}`; });
    const area = `${d} L${W},${y(times.length).toFixed(1)} L${W},${H} Z`;
    return (
        <div className="qz-timeline">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
                <line x1="0" x2={W} y1={y(total)} y2={y(total)} className="qz-timeline-goal" />
                <path d={area} className="qz-timeline-area" />
                <path d={`${d} L${W},${y(times.length).toFixed(1)}`} className="qz-timeline-line" />
            </svg>
            <div className="qz-timeline-axis"><span>{when.at(new Date(t0).toISOString())}</span><span>{when.at(new Date(t1).toISOString())}</span></div>
            <p className="qz-hint">Dashed line: every student submitted ({total}).</p>
        </div>
    );
};

const QuizInsights: React.FC<Props> = ({ quiz, rows, tz, onOpenStudent, onShow }) => {
    const s = useMemo(() => summarize(rows), [rows]);
    const byBatch = useMemo(() => {
        const map = new Map<string, ResultRow[]>();
        rows.forEach(r => r.batches.forEach(b => { if (!map.has(b)) map.set(b, []); map.get(b)!.push(r); }));
        return [...map.entries()].map(([name, list]) => ({ name, ...summarize(list) })).sort((a, b) => a.name.localeCompare(b.name));
    }, [rows]);

    if (!rows.length) {
        return (
            <div className="qz-empty">
                <span className="qz-empty-art"><TeamOutlined /></span>
                <strong>No students assigned</strong>
                <span>The batches on this quiz have no students enrolled yet.</span>
            </div>
        );
    }

    const ranked = [...s.scored].sort((a, b) => b.percentage - a.percentage);
    const top = ranked.slice(0, 5);
    const support = ranked.filter(r => r.percentage < PASS_MARK).reverse().slice(0, 5);
    const bandMax = Math.max(1, ...s.bands.map(b => b.count));

    return (
        <div className="qz-insights">
            <section className="qz-kpis" aria-label="Key figures">
                <div className="qz-kpi">
                    <span className="qz-kpi-label"><TeamOutlined /> Submitted</span>
                    <strong>{s.finished}<small> / {s.assigned}</small></strong>
                    <span className="qz-meter"><i style={{ width: `${s.completion}%` }} /></span>
                    <em>{[s.inProgress && `${s.inProgress} in progress`, s.notStarted && `${s.notStarted} not started`].filter(Boolean).join(' · ') || 'Everyone has submitted'}</em>
                </div>
                <div className={`qz-kpi ${toneOfScore(s.average)}`}>
                    <span className="qz-kpi-label"><TrophyOutlined /> Class average</span>
                    <strong>{fmtPct(s.average)}{s.average !== null && <span className="qz-grade">{gradeFromPercent(s.average)}</span>}</strong>
                    <em>{s.median !== null ? `Median ${fmtPct(s.median)} · range ${fmtPct(s.lowest)}–${fmtPct(s.best)}` : 'No scores yet'}</em>
                </div>
                <div className={`qz-kpi ${s.passRate === null ? '' : s.passRate >= 70 ? 'is-good' : s.passRate >= 50 ? 'is-warn' : 'is-bad'}`}>
                    <span className="qz-kpi-label"><RiseOutlined /> Pass rate</span>
                    <strong>{fmtPct(s.passRate)}</strong>
                    <em>{s.scored.length ? `${s.passed} of ${s.scored.length} scored ${PASS_MARK}% or more` : `Pass mark ${PASS_MARK}%`}</em>
                </div>
                <div className="qz-kpi">
                    <span className="qz-kpi-label"><ClockCircleOutlined /> Median time</span>
                    <strong>{fmtMinutes(s.medianMinutes)}</strong>
                    <em>Time limit {quiz.duration_minutes} min</em>
                </div>
            </section>

            {s.finished === 0 ? (
                <div className="qz-empty is-compact">
                    <strong>No submissions yet</strong>
                    <span>{s.inProgress ? `${plural(s.inProgress, 'student is', 'students are')} taking the quiz right now.` : 'Scores and charts appear here as students submit.'}</span>
                </div>
            ) : (
                <div className="qz-grid">
                    <section className="tc-card">
                        <header className="tc-card-head"><span className="tc-card-title"><span className="tc-card-ic"><BarChartOutlined /></span>Score distribution</span></header>
                        <div className="tc-card-body">
                            <ul className="qz-bands">
                                {s.bands.map(b => (
                                    <li key={b.label} className={BAND_TONE[b.label]}>
                                        <span className="qz-band-label"><b>{b.label}</b>{b.range}%</span>
                                        <span className="qz-band-track"><i style={{ width: `${(b.count / bandMax) * 100}%` }} /></span>
                                        <span className="qz-band-val">{b.count}<em>{s.scored.length ? fmtPct((b.count / s.scored.length) * 100) : ''}</em></span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="tc-card">
                        <header className="tc-card-head"><span className="tc-card-title"><span className="tc-card-ic is-green"><RiseOutlined /></span>Submissions over time</span></header>
                        <div className="tc-card-body">
                            <div className="qz-progress" aria-label={`${s.finished} submitted, ${s.inProgress} in progress, ${s.notStarted} not started`}>
                                {s.finished > 0 && <i className="is-done" style={{ flexGrow: s.finished }} />}
                                {s.inProgress > 0 && <i className="is-doing" style={{ flexGrow: s.inProgress }} />}
                                {s.notStarted > 0 && <i className="is-todo" style={{ flexGrow: s.notStarted }} />}
                            </div>
                            <div className="qz-legend">
                                <span><i className="is-done" />Submitted <b>{s.finished}</b></span>
                                <span><i className="is-doing" />In progress <b>{s.inProgress}</b></span>
                                <span><i className="is-todo" />Not started <b>{s.notStarted}</b></span>
                            </div>
                            <Timeline rows={rows} total={s.assigned} tz={tz} />
                        </div>
                    </section>

                    {byBatch.length > 1 && (
                        <section className="tc-card">
                            <header className="tc-card-head"><span className="tc-card-title"><span className="tc-card-ic"><TeamOutlined /></span>By batch</span></header>
                            <div className="tc-card-body">
                                <ul className="tc-bars">
                                    {byBatch.map(b => (
                                        <li key={b.name}>
                                            <div className="tc-bars-top"><strong>{b.name}</strong><em>{fmtPct(b.average)} avg · {b.finished}/{b.assigned} submitted</em></div>
                                            <div className="tc-bars-track"><i style={{ width: `${b.average ?? 0}%`, ['--b' as string]: b.average === null ? '#cbd5e1' : b.average >= 70 ? '#059669' : b.average >= PASS_MARK ? '#d97706' : '#dc2626' }} /></div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    )}

                    <section className="tc-card">
                        <header className="tc-card-head">
                            <span className="tc-card-title"><span className="tc-card-ic is-green"><TrophyOutlined /></span>Top scores</span>
                            <button type="button" className="tc-link" onClick={() => onShow('students')}>All students</button>
                        </header>
                        <div className="tc-card-body is-flush">
                            <ul className="tc-people">
                                {top.map((row, i) => (
                                    <li key={row.studentId}>
                                        <button type="button" className="tc-person" onClick={() => onOpenStudent(row)}>
                                            <span className={`tc-rank is-${i + 1}`}>{i + 1}</span>
                                            <span className="tc-av is-sm">{initials(row.name)}</span>
                                            <span className="tc-cell"><strong>{row.name}</strong><em>{fmtMinutes(row.minutes)}</em></span>
                                            <span className={`tc-score ${toneOfScore(row.percentage)}`}>{fmtPct(row.percentage)}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="tc-card">
                        <header className="tc-card-head">
                            <span className="tc-card-title"><span className="tc-card-ic is-amber"><WarningOutlined /></span>Below the pass mark</span>
                            <Button size="small" type="link" onClick={() => onShow('questions')}>Which questions?</Button>
                        </header>
                        <div className="tc-card-body is-flush">
                            {support.length === 0 ? (
                                <p className="tc-muted-line">Every scored student reached {PASS_MARK}%.</p>
                            ) : (
                                <ul className="tc-people">
                                    {support.map(row => (
                                        <li key={row.studentId}>
                                            <button type="button" className="tc-person" onClick={() => onOpenStudent(row)}>
                                                <span className="tc-av is-sm">{initials(row.name)}</span>
                                                <span className="tc-cell"><strong>{row.name}</strong><em>{row.batches.join(', ')}</em></span>
                                                <span className={`tc-score ${toneOfScore(row.percentage)}`}>{fmtPct(row.percentage)}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default QuizInsights;
