import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Input, Segmented, Select, Skeleton, Tabs, Tooltip } from 'antd';
import {
    CheckCircleFilled, CheckOutlined, CloseCircleFilled, CloseOutlined, DownloadOutlined, LeftOutlined, MinusCircleFilled, ReloadOutlined,
    RightOutlined, SearchOutlined, SoundOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { resolveTimezone } from '../../utils/timezone';
import QuizInsights from './QuizInsights';
import { ClipPlayer } from './QuizDetails';
import {
    PASS_MARK, TYPE_META, csvOf, fmtMinutes, fmtNumber, fmtPct, gradeFromPercent, initials, isFinished, makeWhen, plural,
    resultRowsFromApi, toneOfScore,
} from './quizModel';
import type { QuestionType, QuizRow, ResultRow, SubmissionStatus } from './quizModel';
import '../Teacher/Teacher.css';
import './Quiz.css';

/* ══════════════════════════════════════════
   QUIZ RESULTS — overview, every student, and what each question revealed.
══════════════════════════════════════════ */

export type ResultsTab = 'overview' | 'students' | 'questions';

interface Props {
    quiz: QuizRow | null;
    initialTab: ResultsTab;
    onClose: () => void;
}

type StatusFilter = 'all' | 'finished' | 'in_progress' | 'not_started' | 'below';
type SortKey = 'name' | 'high' | 'low' | 'fast' | 'recent';

const LETTERS = 'ABCDEFGHIJ';
const STATUS_LABEL: Record<SubmissionStatus, string> = {
    not_started: 'Not started', in_progress: 'In progress', submitted: 'Submitted', auto_submitted: 'Time ran out', graded: 'Submitted',
};

interface AnalysisQuestion {
    id: number; order: number; question_text: string; question_type: string; marks: number; audio_clip_id: number | null;
    correct_answer: string | null; answered: number; correct: number; partial: number; avg_points: number | null; correct_rate: number | null;
    yes_no: { yes: number; no: number } | null; options: { id: number; option_text: string; is_correct: boolean; picks: number }[];
}
interface Analysis { finished: number; questions: AnalysisQuestion[] }

const typeOf = (t: string): QuestionType => (t === 'yes_no' || t === 'boolean' ? 'yes_no' : t === 'mcq_multiple' ? 'mcq_multiple' : 'mcq_single');

/* ─────────────── Submission review ─────────────── */
const Review: React.FC<{ quizId: number; row: ResultRow | null; tz: string; onClose: () => void; onStep: (dir: -1 | 1) => void; position: string; hasPrev: boolean; hasNext: boolean }> = ({
    quizId, row, tz, onClose, onStep, position, hasPrev, hasNext,
}) => {
    const { apiCall } = useAuth();
    const r = useResponsive();
    const when = useMemo(() => makeWhen(tz), [tz]);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'wrong' | 'right'>('all');
    const sid = row?.submissionId ?? null;

    useEffect(() => {
        if (!sid) return;
        let cancelled = false;
        setData(null);
        setError(null);
        apiCall(`/quizzes/${quizId}/submissions/${sid}`)
            .then(async res => {
                const body = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(body?.error || 'This submission could not be loaded.');
                if (!cancelled) setData(body);
            })
            .catch(e => { if (!cancelled) setError(e?.message || 'This submission could not be loaded.'); });
        return () => { cancelled = true; };
    }, [quizId, sid, apiCall]);

    const items = useMemo(() => (Array.isArray(data?.questions) ? data.questions : []).map((q: any, i: number) => {
        const type = typeOf(q.question_type);
        const marks = Number(q.marks) || 0;
        const awarded = Number(q.score ?? q.marks_awarded) || 0;
        const selected: number[] = Array.isArray(q.selected_options) ? q.selected_options.map(Number) : [];
        const answered = type === 'yes_no' ? !!q.answer_text : selected.length > 0;
        const outcome = !answered ? 'blank' : q.is_correct ? 'right' : awarded > 0 ? 'partial' : 'wrong';
        return { q, i, type, marks, awarded, selected, outcome };
    }), [data]);

    const counts = { right: items.filter((x: any) => x.outcome === 'right').length, total: items.length };
    const visible = items.filter((x: any) => filter === 'all' || (filter === 'right' ? x.outcome === 'right' : x.outcome !== 'right'));
    const clips = new Map<number, any>((data?.audio_clips || []).map((c: any) => [Number(c.id), c]));
    const shownClip = new Set<number>();

    const OUTCOME = {
        right: { icon: <CheckCircleFilled />, label: 'Correct' },
        partial: { icon: <MinusCircleFilled />, label: 'Partly correct' },
        wrong: { icon: <CloseCircleFilled />, label: 'Incorrect' },
        blank: { icon: <MinusCircleFilled />, label: 'Not answered' },
    } as const;

    return (
        <Drawer open={!!row} onClose={onClose} placement="right" width={r.isMobile ? '100%' : Math.min(720, r.width - 40)} destroyOnHidden
            rootClassName="tc-drawer qz-drawer" closeIcon={<CloseOutlined />}
            title={<span className="tc-dtitle"><strong>{row?.name}</strong><em>{position}</em></span>}
            extra={(
                <span className="qz-drawer-actions">
                    <Tooltip title="Previous student"><Button size="small" icon={<LeftOutlined />} disabled={!hasPrev} onClick={() => onStep(-1)} aria-label="Previous student" /></Tooltip>
                    <Tooltip title="Next student"><Button size="small" icon={<RightOutlined />} disabled={!hasNext} onClick={() => onStep(1)} aria-label="Next student" /></Tooltip>
                </span>
            )}>
            {error ? (
                <div className="tc-alert" role="alert"><WarningOutlined /><span>{error}</span></div>
            ) : !data || !row ? (
                <div className="tc-card tc-pad"><Skeleton active avatar paragraph={{ rows: 8 }} /></div>
            ) : (
                <>
                    <section className="tc-card qz-review-head">
                        <span className="tc-av is-lg">{initials(row.name)}</span>
                        <div className="tc-cell"><strong>{row.name}</strong><em>{row.email}</em></div>
                        <div className="qz-review-score">
                            <span className={`tc-score ${toneOfScore(row.percentage)}`}>{fmtPct(row.percentage)}</span>
                            {row.percentage !== null && <b className="qz-grade">{gradeFromPercent(row.percentage)}</b>}
                        </div>
                        <dl className="qz-facts is-wide">
                            <div><dt>Points</dt><dd>{fmtNumber(Number(data.total_score))} / {fmtNumber(Number(data.max_score))}</dd></div>
                            <div><dt>Correct</dt><dd>{counts.right} / {counts.total}</dd></div>
                            <div><dt>Time</dt><dd>{fmtMinutes(row.minutes)}</dd></div>
                            <div><dt>{row.status === 'auto_submitted' ? 'Auto-submitted' : 'Submitted'}</dt><dd>{when.at(row.submittedAt)}</dd></div>
                        </dl>
                    </section>

                    <div className="qz-review-filter">
                        <Segmented size="small" value={filter} onChange={v => setFilter(v as typeof filter)}
                            options={[{ value: 'all', label: `All ${counts.total}` }, { value: 'wrong', label: `To review ${counts.total - counts.right}` }, { value: 'right', label: `Correct ${counts.right}` }]} />
                    </div>

                    <ol className="qz-review-list">
                        {visible.map(({ q, i, type, marks, awarded, selected, outcome }: any) => {
                            const clipId = Number(q.audio_clip_id) || null;
                            const clip = clipId && !shownClip.has(clipId) ? clips.get(clipId) : null;
                            if (clipId) shownClip.add(clipId);
                            return (
                                <li key={q.id} className={`qz-review-q is-${outcome}`}>
                                    {clip && (
                                        <div className="qz-review-clip"><SoundOutlined /> Listening section {clip.has_audio && <ClipPlayer clipId={clip.id} />}</div>
                                    )}
                                    <div className="qz-review-q-head">
                                        <span className="qz-review-outcome">{OUTCOME[outcome as keyof typeof OUTCOME].icon}</span>
                                        <span className="qz-q-num">{i + 1}</span>
                                        <span className="qz-q-type">{TYPE_META[type as QuestionType].short}</span>
                                        <span className="qz-review-pts">{fmtNumber(awarded)} / {fmtNumber(marks)} pts</span>
                                    </div>
                                    <p className="qz-q-text">{q.question_text}</p>
                                    {type === 'yes_no' ? (
                                        <ul className="qz-opts is-view is-review">
                                            {(['yes', 'no'] as const).map(v => {
                                                const picked = q.answer_text === v;
                                                const correct = q.correct_answer === v || (v === 'yes' && q.correct_answer === 'true') || (v === 'no' && q.correct_answer === 'false');
                                                return (
                                                    <li key={v} className={`${correct ? 'is-correct' : ''}${picked ? ' is-picked' : ''}${picked && !correct ? ' is-wrong' : ''}`}>
                                                        <span className="qz-opt-letter">{correct ? <CheckOutlined /> : picked ? <CloseOutlined /> : '·'}</span>
                                                        <span>{v === 'yes' ? 'Yes' : 'No'}</span>
                                                        {picked && <em className="qz-pick-tag">Their answer</em>}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <ul className="qz-opts is-view is-review">
                                            {(q.options || []).map((o: any, j: number) => {
                                                const picked = selected.includes(Number(o.id));
                                                const correct = !!o.is_correct;
                                                return (
                                                    <li key={o.id} className={`${correct ? 'is-correct' : ''}${picked ? ' is-picked' : ''}${picked && !correct ? ' is-wrong' : ''}`}>
                                                        <span className="qz-opt-letter">{correct ? <CheckOutlined /> : picked ? <CloseOutlined /> : LETTERS[j]}</span>
                                                        <span>{o.option_text}</span>
                                                        {picked && <em className="qz-pick-tag">Their answer</em>}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                    {outcome === 'blank' && <p className="qz-hint">No answer given.</p>}
                                </li>
                            );
                        })}
                        {!visible.length && <li className="tc-muted-line">Nothing in this filter.</li>}
                    </ol>
                </>
            )}
        </Drawer>
    );
};

/* ─────────────── Results ─────────────── */
const QuizResults: React.FC<Props> = ({ quiz, initialTab, onClose }) => {
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const tz = resolveTimezone(user?.timezone);
    const when = useMemo(() => makeWhen(tz), [tz]);

    const [tab, setTab] = useState<ResultsTab>(initialTab);
    const [rows, setRows] = useState<ResultRow[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [batch, setBatch] = useState<string | null>(null);
    const [sort, setSort] = useState<SortKey>('high');
    const [qSort, setQSort] = useState<'order' | 'hard'>('order');
    const [reviewId, setReviewId] = useState<number | null>(null);

    const id = quiz?.id ?? null;
    useEffect(() => { if (id !== null) { setTab(initialTab); setSearch(''); setStatus('all'); setBatch(null); setReviewId(null); } }, [id, initialTab]);

    useEffect(() => {
        if (id === null) return;
        let cancelled = false;
        setRows(null);
        setError(null);
        setAnalysis(null);
        setAnalysisError(null);
        apiCall(`/quizzes/${id}/results`)
            .then(async res => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || 'The results could not be loaded.');
                if (!cancelled) setRows(resultRowsFromApi(data));
            })
            .catch(e => { if (!cancelled) setError(e?.message || 'The results could not be loaded.'); });
        return () => { cancelled = true; };
    }, [id, attempt, apiCall]);

    // Question analysis loads the first time its tab is opened.
    useEffect(() => {
        if (id === null || tab !== 'questions' || analysis || analysisError) return;
        let cancelled = false;
        apiCall(`/quizzes/${id}/analysis`)
            .then(async res => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || 'The question analysis could not be loaded.');
                if (!cancelled) setAnalysis(data);
            })
            .catch(e => { if (!cancelled) setAnalysisError(e?.message || 'The question analysis could not be loaded.'); });
        return () => { cancelled = true; };
    }, [id, tab, analysis, analysisError, apiCall]);

    const batches = useMemo(() => [...new Set((rows || []).flatMap(x => x.batches))].sort((a, b) => a.localeCompare(b)), [rows]);

    const list = useMemo(() => {
        const q = search.trim().toLowerCase();
        const out = (rows || []).filter(x => {
            if (batch && !x.batches.includes(batch)) return false;
            if (q && !`${x.name} ${x.email}`.toLowerCase().includes(q)) return false;
            if (status === 'finished') return isFinished(x.status);
            if (status === 'in_progress') return x.status === 'in_progress';
            if (status === 'not_started') return x.status === 'not_started';
            if (status === 'below') return x.percentage !== null && x.percentage < PASS_MARK;
            return true;
        });
        const score = (x: ResultRow) => x.percentage ?? -1;
        return out.sort((a, b) => {
            if (sort === 'name') return a.name.localeCompare(b.name);
            if (sort === 'low') return (a.percentage ?? Infinity) - (b.percentage ?? Infinity);
            if (sort === 'fast') return (a.minutes ?? Infinity) - (b.minutes ?? Infinity);
            if (sort === 'recent') return (Date.parse(b.submittedAt || '') || 0) - (Date.parse(a.submittedAt || '') || 0);
            return score(b) - score(a) || a.name.localeCompare(b.name);
        });
    }, [rows, search, status, batch, sort]);

    // Review navigation follows the list as it is currently filtered and sorted.
    const reviewable = useMemo(() => list.filter(x => x.submissionId && isFinished(x.status)), [list]);
    const reviewIndex = reviewable.findIndex(x => x.studentId === reviewId);
    const reviewRow = reviewIndex >= 0 ? reviewable[reviewIndex] : (rows || []).find(x => x.studentId === reviewId) || null;
    const openStudent = useCallback((row: ResultRow) => { if (row.submissionId && isFinished(row.status)) setReviewId(row.studentId); }, []);

    const exportCsv = () => {
        if (!quiz || !rows) return;
        const blob = new Blob(['﻿', csvOf(list, tz)], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${quiz.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'quiz'}-results.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    const analysisList = useMemo(() => {
        const qs = [...(analysis?.questions || [])];
        return qSort === 'hard' ? qs.sort((a, b) => (a.correct_rate ?? 101) - (b.correct_rate ?? 101)) : qs;
    }, [analysis, qSort]);

    const students = (
        <div className="qz-results-students">
            <div className="qz-toolbar is-sub">
                <Segmented size={r.isMobile ? 'small' : 'middle'} value={status} onChange={v => setStatus(v as StatusFilter)} options={[
                    { value: 'all', label: 'All' }, { value: 'finished', label: 'Submitted' }, { value: 'in_progress', label: 'In progress' },
                    { value: 'not_started', label: 'Not started' }, { value: 'below', label: `Below ${PASS_MARK}%` },
                ]} />
                <div className="qz-filters">
                    <Input className="qz-search" allowClear prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder="Find a student" value={search} onChange={e => setSearch(e.target.value)} aria-label="Find a student" />
                    {batches.length > 1 && <Select<string> className="qz-filter" allowClear placeholder="All batches" value={batch ?? undefined} onChange={v => setBatch(v ?? null)} options={batches.map(b => ({ value: b, label: b }))} />}
                    <Select<SortKey> className="qz-sort" value={sort} onChange={setSort} aria-label="Sort" options={[
                        { value: 'high', label: 'Highest score' }, { value: 'low', label: 'Lowest score' }, { value: 'name', label: 'Name (A–Z)' },
                        { value: 'fast', label: 'Fastest' }, { value: 'recent', label: 'Latest submitted' },
                    ]} />
                </div>
            </div>
            {list.length === 0 ? (
                <p className="tc-muted-line">No students match these filters.</p>
            ) : (
                <div className="qz-stable" role="table" aria-label="Students">
                    <div className="qz-srow is-head" role="row">
                        <span role="columnheader">Student</span><span role="columnheader">Status</span><span role="columnheader">Score</span>
                        <span role="columnheader">Time</span><span role="columnheader">Submitted</span><span role="columnheader"><span className="qz-sr">Open</span></span>
                    </div>
                    {list.map(x => {
                        const open = !!x.submissionId && isFinished(x.status);
                        return (
                            <div key={x.studentId} className={`qz-srow${open ? ' is-open' : ''}`} role="row" tabIndex={open ? 0 : -1}
                                onClick={() => openStudent(x)} onKeyDown={e => { if (open && e.key === 'Enter') openStudent(x); }}>
                                <span className="qz-s-name" role="cell">
                                    <span className="tc-av is-sm">{initials(x.name)}</span>
                                    <span className="tc-cell"><strong>{x.name}</strong><em>{batches.length > 1 ? x.batches.join(', ') : x.email}</em></span>
                                </span>
                                <span role="cell"><span className={`qz-sub-status is-${x.status}`}>{STATUS_LABEL[x.status]}</span></span>
                                <span className="qz-s-score" role="cell">
                                    {x.percentage === null ? <span className="qz-muted">—</span> : (
                                        <>
                                            <span className={`tc-score ${toneOfScore(x.percentage)}`}>{fmtPct(x.percentage)}</span>
                                            <em>{fmtNumber(x.score)}/{fmtNumber(x.maxScore)} · {gradeFromPercent(x.percentage)}</em>
                                        </>
                                    )}
                                </span>
                                <span className="qz-s-time" role="cell">{isFinished(x.status) ? fmtMinutes(x.minutes) : x.status === 'in_progress' && x.startedAt ? `Started ${when.at(x.startedAt)}` : '—'}</span>
                                <span className="qz-s-when" role="cell">{x.submittedAt && isFinished(x.status) ? when.at(x.submittedAt) : '—'}</span>
                                <span className="qz-s-go" role="cell">{open && <RightOutlined />}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const questions = analysisError ? (
        <div className="tc-alert" role="alert"><WarningOutlined /><span>{analysisError}</span><Button size="small" onClick={() => setAnalysisError(null)}>Retry</Button></div>
    ) : !analysis ? (
        <div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 10 }} /></div>
    ) : analysis.finished === 0 ? (
        <div className="qz-empty is-compact"><strong>No submissions to analyse yet</strong><span>Each question’s success rate and the most common wrong answers appear here once students submit.</span></div>
    ) : (
        <div className="qz-analysis">
            <div className="qz-toolbar is-sub">
                <span className="qz-hint">Based on {plural(analysis.finished, 'submission')}. Blank answers count as incorrect.</span>
                <Segmented size="small" value={qSort} onChange={v => setQSort(v as 'order' | 'hard')} options={[{ value: 'order', label: 'In order' }, { value: 'hard', label: 'Hardest first' }]} />
            </div>
            <ol className="qz-analysis-list">
                {analysisList.map(q => {
                    const type = typeOf(q.question_type);
                    const rate = q.correct_rate;
                    const pickTotal = Math.max(1, analysis.finished);
                    const topWrong = q.options.filter(o => !o.is_correct && o.picks > 0).sort((a, b) => b.picks - a.picks)[0];
                    return (
                        <li key={q.id} className="qz-analysis-q">
                            <div className="qz-analysis-top">
                                <div className="qz-analysis-main">
                                    <div className="qz-q-head is-plain">
                                        <span className="qz-q-num">{q.order}</span>
                                        <span className="qz-q-type">{TYPE_META[type].short}</span>
                                        <span className="qz-q-pts">{fmtNumber(q.marks)} pts</span>
                                        {q.audio_clip_id && <span className="qz-q-type"><SoundOutlined /> Listening</span>}
                                    </div>
                                    <p className="qz-q-text">{q.question_text}</p>
                                </div>
                                <div className={`qz-rate ${toneOfScore(rate)}`}>
                                    <strong>{fmtPct(rate)}</strong>
                                    <em>correct</em>
                                    <span className="qz-meter"><i style={{ width: `${rate ?? 0}%` }} /></span>
                                    <small>{q.correct}/{analysis.finished}{q.partial ? ` · ${q.partial} partly` : ''} · avg {fmtNumber(q.avg_points)} pts</small>
                                </div>
                            </div>
                            {type === 'yes_no' && q.yes_no ? (
                                <ul className="qz-picks">
                                    {(['yes', 'no'] as const).map(v => {
                                        const picks = q.yes_no![v];
                                        const correct = q.correct_answer === v || (v === 'yes' && q.correct_answer === 'true') || (v === 'no' && q.correct_answer === 'false');
                                        return (
                                            <li key={v} className={correct ? 'is-correct' : picks ? 'is-wrong' : ''}>
                                                <span className="qz-pick-label">{correct && <CheckOutlined />}{v === 'yes' ? 'Yes' : 'No'}</span>
                                                <span className="qz-pick-track"><i style={{ width: `${(picks / pickTotal) * 100}%` }} /></span>
                                                <span className="qz-pick-val">{picks}</span>
                                            </li>
                                        );
                                    })}
                                    {analysis.finished - q.answered > 0 && <li className="is-blank"><span className="qz-pick-label">No answer</span><span className="qz-pick-track"><i style={{ width: `${((analysis.finished - q.answered) / pickTotal) * 100}%` }} /></span><span className="qz-pick-val">{analysis.finished - q.answered}</span></li>}
                                </ul>
                            ) : (
                                <ul className="qz-picks">
                                    {q.options.map((o, j) => (
                                        <li key={o.id} className={o.is_correct ? 'is-correct' : o === topWrong ? 'is-wrong' : ''}>
                                            <span className="qz-pick-label">{o.is_correct ? <CheckOutlined /> : <b>{LETTERS[j]}</b>}{o.option_text}</span>
                                            <span className="qz-pick-track"><i style={{ width: `${(o.picks / pickTotal) * 100}%` }} /></span>
                                            <span className="qz-pick-val">{o.picks}{o === topWrong && <em>most chosen mistake</em>}</span>
                                        </li>
                                    ))}
                                    {analysis.finished - q.answered > 0 && <li className="is-blank"><span className="qz-pick-label">No answer</span><span className="qz-pick-track"><i style={{ width: `${((analysis.finished - q.answered) / pickTotal) * 100}%` }} /></span><span className="qz-pick-val">{analysis.finished - q.answered}</span></li>}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );

    return (
        <>
            <Drawer open={!!quiz} onClose={onClose} placement="right" width={r.isMobile ? '100%' : Math.min(1120, r.width - 48)} destroyOnHidden
                rootClassName="tc-drawer qz-drawer qz-results-drawer" closeIcon={<CloseOutlined />}
                title={<span className="tc-dtitle"><strong>{quiz?.title}</strong><em>Results{rows ? ` · ${plural(rows.length, 'student')}` : ''}</em></span>}
                extra={(
                    <span className="qz-drawer-actions">
                        <Tooltip title="Refresh"><Button size="small" icon={<ReloadOutlined />} onClick={() => setAttempt(a => a + 1)} aria-label="Refresh results" /></Tooltip>
                        <Button size="small" icon={<DownloadOutlined />} disabled={!rows?.length} onClick={exportCsv}>{r.isMobile ? '' : 'Export CSV'}</Button>
                    </span>
                )}>
                {error ? (
                    <div className="tc-alert" role="alert"><WarningOutlined /><span><strong>Couldn't load the results.</strong> {error}</span><Button size="small" onClick={() => setAttempt(a => a + 1)}>Retry</Button></div>
                ) : !rows || !quiz ? (
                    <div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 10 }} /></div>
                ) : (
                    <Tabs className="qz-tabs-bar" activeKey={tab} onChange={k => setTab(k as ResultsTab)} items={[
                        { key: 'overview', label: 'Overview', children: <QuizInsights quiz={quiz} rows={rows} tz={tz} onOpenStudent={openStudent} onShow={setTab} /> },
                        { key: 'students', label: `Students ${rows.length}`, children: students },
                        { key: 'questions', label: 'Question analysis', children: questions },
                    ]} />
                )}
            </Drawer>

            {quiz && (
                <Review
                    quizId={quiz.id}
                    row={reviewRow}
                    tz={tz}
                    onClose={() => setReviewId(null)}
                    position={reviewIndex >= 0 ? `Submission ${reviewIndex + 1} of ${reviewable.length}` : 'Submission'}
                    hasPrev={reviewIndex > 0}
                    hasNext={reviewIndex >= 0 && reviewIndex < reviewable.length - 1}
                    onStep={dir => { const next = reviewable[reviewIndex + dir]; if (next) setReviewId(next.studentId); }}
                />
            )}
        </>
    );
};

export default QuizResults;
