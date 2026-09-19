import React, { useEffect, useState } from 'react';
import { Button, Drawer, Skeleton } from 'antd';
import {
    AudioOutlined, CheckCircleFilled, CloseCircleFilled, CloseOutlined, FileImageOutlined, FormOutlined,
    LoadingOutlined, MinusCircleFilled, ReadOutlined, ReloadOutlined, SoundOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useExamGuard from '../../hooks/useExamGuard';
import ExamReport, { type EETaskExtra } from '../ExamSim/ExamReport';
import { MILESTONES, NCLC_BANDS, nclcOf, type ExamReport as Report } from '../ExamSim/examModel';
import { SKILLS, dateText, durationText, scoreText, scoreUnit, type Attempt, type SkillKey } from './candidateModel';

/* A completed result, read back: correction for reading/listening, the full report for writing/speaking. */

interface Props { attempt: Pick<Attempt, 'skill' | 'id'> & Partial<Attempt>; onClose: () => void }

const ICON: Record<SkillKey, React.ReactNode> = { ce: <ReadOutlined />, co: <SoundOutlined />, ee: <FormOutlined />, eo: <AudioOutlined /> };
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

interface McqQuestion { id: number; question_order: number; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; cefr_level: string; points: number; has_image?: boolean }
interface McqAnswer { question_id: number; selected_answer: string | null; correct_answer: string; is_correct: boolean; cefr_level: string }
interface McqCorrection {
    series_name: string; completed_at: string; time_spent_seconds: number; correct_count: number; total_questions: number;
    earned_points: number | string; total_points: number | string; is_auto_submitted: boolean; questions: McqQuestion[]; answers: McqAnswer[];
}
interface EeResult { report: Report | null; tasks: { task_number: number; student_answer: string; consigne?: string; title?: string | null; documents?: string[]; min_words: number; max_words: number; correction_text: string | null; score: number; level: string; positives: string[]; improvements: string[] }[]; average_score: number; overall_level: string }
interface EoResult { evaluation?: Report | null; overall_score: number | null; overall_feedback?: string; tache1_score?: number | null; tache2_score?: number | null; tache3_score?: number | null; tache1_feedback?: string; tache2_feedback?: string; tache3_feedback?: string }

const endpoint = (skill: SkillKey, id: number) => ({
    ce: `/tcf/student/ce/attempts/${id}/correction`,
    co: `/tcf/student/co/attempts/${id}/correction`,
    ee: `/tcf/ee/simulation/${id}/result`,
    eo: `/eo-simulation/${id}`,
}[skill]);

/** The next NCLC step above a score on 20 (same rule as the server's report). */
const nextStep = (score: number): Report['global']['next'] => {
    const s = Math.round(score);
    const current = nclcOf(s) ?? 3;
    const next = NCLC_BANDS.find(b => b.nclc > current);
    return next ? { nclc: next.nclc, score: next.min, missing: Math.max(0, next.min - s), note: MILESTONES[next.nclc] ?? null } : null;
};

/** Older writing results only carry per-task scores: shape them as a report. */
const legacyEe = (r: EeResult): Report => ({
    version: 1, exam: 'tcf_canada', skill: 'ee', generatedAt: '',
    global: { score: Math.round(r.average_score), precise: r.average_score, cefr: (r.overall_level || null) as Report['global']['cefr'], nclc: nclcOf(r.average_score), next: nextStep(r.average_score), weights: { 1: 0.25, 2: 0.35, 3: 0.4 } },
    summary: { headline: r.overall_level ? `Niveau estimé ${r.overall_level}.` : 'Résultat', text: '', priorities: [], strengths: [] },
    criteria: [],
    tasks: r.tasks.map(t => ({
        n: t.task_number, title: `Tâche ${t.task_number}`, score: t.score, cefr: (t.level || null) as Report['global']['cefr'],
        words: (t.student_answer || '').trim().split(/\s+/).filter(Boolean).length, evaluated: true, criteria: [],
        strengths: t.positives || [], improvements: t.improvements || [], errors: [], adjustments: [],
    })),
    reliability: { corrections: 1, arbitrated: false },
});

/** A reading document, loaded on demand (only while the series is still open to the learner). */
const DocumentImage: React.FC<{ questionId: number }> = ({ questionId }) => {
    const { token } = useAuth();
    const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
    const load = async () => {
        setState('loading');
        try {
            const api = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const res = await fetch(`${api}/tcf/student/ce/questions/${questionId}/image`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error();
            setUrl(URL.createObjectURL(await res.blob()));
            setState('idle');
        } catch { setState('error'); }
    };
    if (url) return <img className="cx-doc" src={url} alt="" draggable={false} onContextMenu={e => e.preventDefault()} />;
    return (
        <button type="button" className="cx-doc-btn" onClick={load} disabled={state === 'loading'}>
            {state === 'loading' ? <LoadingOutlined /> : <FileImageOutlined />}
            {state === 'error' ? 'The document is no longer available (access ended).' : 'Show the document'}
        </button>
    );
};

const McqReview: React.FC<{ skill: 'ce' | 'co'; data: McqCorrection }> = ({ skill, data }) => {
    const [filter, setFilter] = useState<'all' | 'wrong'>('all');
    const answers = new Map(data.answers.map(a => [Number(a.question_id), a]));
    const byLevel = LEVELS.map(level => {
        const qs = data.questions.filter(q => q.cefr_level === level);
        const ok = qs.filter(q => answers.get(q.id)?.is_correct).length;
        return { level, total: qs.length, ok };
    }).filter(l => l.total > 0);
    const shown = data.questions.filter(q => filter === 'all' || !answers.get(q.id)?.is_correct);
    const earned = Number(data.earned_points);
    return (
        <div className="cx-review">
            <div className="cx-review-summary">
                <div className="cx-review-score">
                    <b>{Math.round(earned)}</b><span>/ {Math.round(Number(data.total_points)) || 699} pts</span>
                </div>
                <dl>
                    <div><dt>Correct</dt><dd>{data.correct_count}/{data.total_questions}</dd></div>
                    <div><dt>Time</dt><dd>{durationText(data.time_spent_seconds)}</dd></div>
                    <div><dt>Date</dt><dd>{dateText(data.completed_at)}</dd></div>
                </dl>
                {data.is_auto_submitted && <span className="cx-review-flag">Submitted automatically when time ran out</span>}
            </div>

            <div className="cx-review-levels" aria-label="Correct answers by level">
                {byLevel.map(l => (
                    <div key={l.level} className="cx-review-level">
                        <span className="cx-level-tag">{l.level}</span>
                        <div className="cx-meter"><span style={{ width: `${(l.ok / l.total) * 100}%` }} /></div>
                        <b>{l.ok}/{l.total}</b>
                    </div>
                ))}
            </div>

            <div className="cx-review-toolbar">
                <h3>Correction</h3>
                <div className="cx-seg">
                    <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All {data.questions.length}</button>
                    <button type="button" aria-pressed={filter === 'wrong'} onClick={() => setFilter('wrong')}>To review {data.questions.length - data.correct_count}</button>
                </div>
            </div>
            <ol className="cx-qs">
                {shown.map(q => {
                    const a = answers.get(q.id);
                    const options = [q.option_a, q.option_b, q.option_c, q.option_d];
                    const status = !a?.selected_answer ? 'blank' : a.is_correct ? 'ok' : 'ko';
                    return (
                        <li key={q.id} className={`cx-q is-${status}`}>
                            <div className="cx-q-head">
                                <span className="cx-q-icon">{status === 'ok' ? <CheckCircleFilled /> : status === 'ko' ? <CloseCircleFilled /> : <MinusCircleFilled />}</span>
                                <span className="cx-q-no">Question {q.question_order}</span>
                                <span className="cx-level-tag">{q.cefr_level}</span>
                                <span className="cx-q-pts">{status === 'ok' ? `+${Number(q.points)}` : 0} pts</span>
                            </div>
                            {skill === 'ce' && q.has_image && <DocumentImage questionId={q.id} />}
                            {q.question_text && <p className="cx-q-text">{q.question_text}</p>}
                            <ul className="cx-q-options">
                                {OPTION_KEYS.map((k, i) => {
                                    const correct = q.correct_answer === k;
                                    const picked = a?.selected_answer === k;
                                    return (
                                        <li key={k} className={`${correct ? 'is-correct' : ''}${picked && !correct ? ' is-picked' : ''}`}>
                                            <span className="cx-q-key">{k}</span>
                                            <span className="cx-q-opt">{options[i]}</span>
                                            {correct && <span className="cx-q-mark">Correct answer</span>}
                                            {picked && !correct && <span className="cx-q-mark">Your answer</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                            {!a?.selected_answer && <p className="cx-q-blank">Not answered</p>}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

const AttemptReview: React.FC<Props> = ({ attempt, onClose }) => {
    const { apiCall } = useAuth();
    const [data, setData] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [nonce, setNonce] = useState(0);
    useExamGuard(true);
    const meta = SKILLS[attempt.skill];

    useEffect(() => {
        let cancelled = false;
        setLoading(true); setError(null);
        (async () => {
            try {
                const res = await apiCall(endpoint(attempt.skill, attempt.id));
                const body = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(body.error || 'This result could not be opened.');
                if (!cancelled) setData(body);
            } catch (e) {
                if (!cancelled) setError((e as Error).message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [apiCall, attempt.skill, attempt.id, nonce]);

    let body: React.ReactNode = null;
    if (!loading && !error && data) {
        if (attempt.skill === 'ce' || attempt.skill === 'co') {
            body = <McqReview skill={attempt.skill} data={data as McqCorrection} />;
        } else if (attempt.skill === 'ee') {
            const r = data as EeResult;
            const extras: EETaskExtra[] = (r.tasks || []).map(t => ({
                answer: t.student_answer, consigne: t.consigne, title: t.title, documents: t.documents,
                minWords: t.min_words, maxWords: t.max_words, correction: t.correction_text,
            }));
            body = <div className="xs-root xs-ee xs-embed"><ExamReport report={r.report || legacyEe(r)} eeTasks={extras} /></div>;
        } else {
            const r = data as EoResult;
            body = r.evaluation && r.evaluation.version >= 2
                ? <div className="xs-root xs-eo xs-embed"><ExamReport report={r.evaluation} /></div>
                : (
                    <div className="cx-review">
                        <div className="cx-review-summary">
                            <div className="cx-review-score"><b>{scoreText(r.overall_score, 20)}</b><span>/ 20</span></div>
                        </div>
                        {([1, 2, 3] as const).map(n => (
                            <section key={n} className="cx-legacy-task">
                                <h4>Tâche {n} · {scoreText(r[`tache${n}_score`] ?? null, 20)} / 20</h4>
                                <p>{r[`tache${n}_feedback`] || 'No feedback for this task.'}</p>
                            </section>
                        ))}
                        {r.overall_feedback && <section className="cx-legacy-task"><h4>Overall</h4><p>{r.overall_feedback}</p></section>}
                    </div>
                );
        }
    }

    return (
        <Drawer
            open
            onClose={onClose}
            placement="right"
            width="min(880px, 100vw)"
            rootClassName="cx-drawer"
            destroyOnHidden
            closable={false}
            styles={{ body: { padding: 0 } }}
            title={(
                <div className="cx-drawer-head" style={{ '--sk': meta.color, '--sk-soft': meta.soft } as React.CSSProperties}>
                    <span className="cx-drawer-icon" aria-hidden>{ICON[attempt.skill]}</span>
                    <div>
                        <span className="cx-drawer-eyebrow">{meta.english} · {meta.french}</span>
                        <h2>{attempt.title || 'Result'}</h2>
                        {attempt.score != null && (
                            <span className="cx-drawer-meta">
                                {scoreText(attempt.score, meta.max)} {scoreUnit(meta.max)} · {attempt.cefr}{attempt.nclc ? ` · NCLC ${attempt.nclc}` : ''} · {dateText(attempt.at)}
                            </span>
                        )}
                    </div>
                </div>
            )}
            extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} aria-label="Close" />}
        >
            <div className="cx-drawer-body">
                {loading ? <Skeleton active paragraph={{ rows: 8 }} />
                    : error ? (
                        <div className="cx-empty" role="alert">
                            <strong>This result could not be opened</strong>
                            <span>{error}</span>
                            <Button icon={<ReloadOutlined />} onClick={() => setNonce(n => n + 1)}>Try again</Button>
                        </div>
                    ) : body}
            </div>
        </Drawer>
    );
};

export default AttemptReview;
