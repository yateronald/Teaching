import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Table, Select, Button, Alert, Input, Segmented, Pagination, Tooltip, Skeleton, ConfigProvider, Empty, Drawer, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    SearchOutlined, LockOutlined, RightOutlined, CloseOutlined, CheckOutlined,
    CheckCircleFilled, CloseCircleFilled, MinusCircleFilled, ExclamationCircleFilled, SoundOutlined,
    CalendarOutlined, UserOutlined, TeamOutlined,
    TrophyOutlined, CheckCircleOutlined, AimOutlined, FieldTimeOutlined, FileDoneOutlined, GlobalOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import useExamGuard from '../../hooks/useExamGuard';
import { headerHeight } from '../Layout/layoutMetrics';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import { GRADE_BANDS, PASS_MARK, bandFor, gradeFromPercent, toneFor } from '../../utils/grading';
import './StudentQuizResults.css';

const { RangePicker } = DatePicker;

/* ── API shapes (numeric columns can arrive as strings from Postgres) ── */
interface ApiResult {
    id: number; quiz_id: number; quiz_title: string; quiz_description?: string | null;
    batch_name: string | null; end_date?: string | null; results_locked?: boolean;
    score: number | string | null; max_score: number | string | null; percentage: number | string | null;
    time_taken: number | string | null; submitted_at: string | null;
    total_questions: number | string | null; correct_answers: number | string | null;
    teacher_first_name?: string | null; teacher_last_name?: string | null;
}

interface AudioClip { id: number; audio_order: number; max_plays: number; has_audio: boolean; duration_seconds?: number | null; }

interface DetailQuestion {
    id: number; question_text: string; question_type: string;
    points?: number | string | null; score?: number | string | null; is_correct?: boolean | null;
    student_answer?: string | null; answer_text?: string | null; correct_answer?: string | null;
    audio_clip_id?: number | null; teacher_feedback?: string | null;
    options?: { id: number; option_text: string; is_correct: boolean }[];
    selected_options?: number[] | string | null;
}

interface Detail {
    quiz: { id: number; title: string; description?: string | null };
    submission: {
        id: number; score: number | string; max_score: number | string; percentage: number | string;
        time_taken: number; submitted_at: string; teacher_feedback?: string | null;
    };
    questions: DetailQuestion[];
    audio_clips?: AudioClip[];
}

/** One submission. A quiz shared by several of the student's batches comes back once per batch; we merge those. */
interface ResultRow {
    key: string; quizId: number; title: string;
    batches: string[]; teacher: string | null;
    locked: boolean; releaseAt: string | null;
    score: number | null; maxScore: number | null; pct: number | null;
    correct: number | null; questions: number | null;
    timeSecs: number; submittedAt: string | null;
}

type QStatus = 'correct' | 'partial' | 'incorrect' | 'unanswered';
type SortKey = 'newest' | 'oldest' | 'best' | 'worst';
type GradeFilter = 'A' | 'B' | 'C' | 'D' | 'F' | 'pending';
type ReviewFilter = 'all' | 'review' | 'correct';

interface ReviewState { row: ResultRow; status: 'loading' | 'ready' | 'error'; data?: Detail; error?: string; }

/* ── Helpers ── */
const PAGE_SIZE = 12;

const toNum = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};
const PCT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const NUM = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const fmtPct = (v: number | null) => (v == null ? '—' : `${PCT.format(v)}%`);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const fmtDuration = (secs: number) => {
    const s = Math.max(0, Math.round(secs));
    if (s < 60) return `${s}s`;
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), rest = s % 60;
    if (h > 0) return m ? `${h}h ${m}m` : `${h}h`;
    return rest ? `${m}m ${rest}s` : `${m}m`;
};
const isGraded = (r: ResultRow) => !r.locked && r.pct != null;

const normalize = (raw: ApiResult[]): ResultRow[] => {
    const bySubmission = new Map<string, ResultRow>();
    for (const r of raw) {
        const key = String(r.id);
        const batch = r.batch_name || 'Unassigned';
        const existing = bySubmission.get(key);
        if (existing) {
            if (!existing.batches.includes(batch)) existing.batches.push(batch);
            continue;
        }
        const locked = !!r.results_locked;
        bySubmission.set(key, {
            key,
            quizId: r.quiz_id,
            title: r.quiz_title || 'Untitled quiz',
            batches: [batch],
            teacher: [r.teacher_first_name, r.teacher_last_name].filter(Boolean).join(' ') || null,
            locked,
            releaseAt: locked ? r.end_date ?? null : null,
            score: locked ? null : toNum(r.score),
            maxScore: locked ? null : toNum(r.max_score),
            pct: locked ? null : toNum(r.percentage),
            correct: locked ? null : toNum(r.correct_answers),
            questions: toNum(r.total_questions),
            timeSecs: toNum(r.time_taken) ?? 0,
            submittedAt: r.submitted_at,
        });
    }
    return Array.from(bySubmission.values());
};

const isMcq = (q: DetailQuestion) => q.question_type === 'mcq_single' || q.question_type === 'mcq_multiple';
const parseSelected = (v: DetailQuestion['selected_options']): number[] => {
    if (Array.isArray(v)) return v.map(Number);
    if (typeof v === 'string' && v) {
        try { const p = JSON.parse(v); return Array.isArray(p) ? p.map(Number) : []; } catch { return []; }
    }
    return [];
};
// The API fills `student_answer` only for MCQ / yes-no; free-text answers live in `answer_text`.
const answerText = (q: DetailQuestion) => String(q.student_answer ?? q.answer_text ?? '').trim();
const questionStatus = (q: DetailQuestion): QStatus => {
    const answered = isMcq(q) ? parseSelected(q.selected_options).length > 0 : answerText(q) !== '';
    if (!answered) return 'unanswered';
    const pts = toNum(q.points) ?? 0, s = toNum(q.score) ?? 0;
    if (pts > 0) return s >= pts ? 'correct' : s > 0 ? 'partial' : 'incorrect';
    return q.is_correct ? 'correct' : 'incorrect';
};
const STATUS_LABEL: Record<QStatus, string> = { correct: 'Correct', partial: 'Partly correct', incorrect: 'Incorrect', unanswered: 'Not answered' };
const STATUS_ICON: Record<QStatus, React.ReactNode> = {
    correct: <CheckCircleFilled />, partial: <ExclamationCircleFilled />, incorrect: <CloseCircleFilled />, unanswered: <MinusCircleFilled />,
};

/* ── Small presentational pieces ── */
const ScoreCell = ({ pct }: { pct: number }) => (
    <div className={`qr-score qr-tone-${toneFor(pct)}`}>
        <span className="qr-score-bar" aria-hidden><span style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} /></span>
        <span className="qr-score-value">{fmtPct(pct)}</span>
    </div>
);
const GradeBadge = ({ pct }: { pct: number }) => (
    <span className={`qr-grade qr-tone-${toneFor(pct)}`}>{gradeFromPercent(pct)}</span>
);

/** Circular average-score gauge; colour comes from the parent's .qr-tone-* class. */
const Ring = ({ pct }: { pct: number | null }) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const value = Math.min(100, Math.max(0, pct ?? 0));
    return (
        <div className="qr-ring">
            <svg viewBox="0 0 92 92" aria-hidden>
                <circle cx="46" cy="46" r={radius} className="qr-ring-track" />
                <circle cx="46" cy="46" r={radius} className="qr-ring-fill"
                    strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} />
            </svg>
            <div className="qr-ring-value">
                <strong>{pct != null ? `${Math.round(pct)}%` : '—'}</strong>
                <span>average</span>
            </div>
        </div>
    );
};

const StatTile: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode; note?: React.ReactNode; bar?: number | null }> = ({
    icon, label, value, note, bar,
}) => (
    <div className="qr-tile">
        <div className="qr-tile-icon">{icon}</div>
        <div className="qr-tile-body">
            <div className="qr-tile-label">{label}</div>
            <div className="qr-tile-value">{value}</div>
            {bar != null && <div className="qr-tile-bar"><span style={{ width: `${Math.min(100, Math.max(0, bar))}%` }} /></div>}
            {note && <div className="qr-tile-note">{note}</div>}
        </div>
    </div>
);

/* ══════════════════════════════
   REVIEW PANEL (drawer content)
══════════════════════════════ */
interface ReviewItem { q: DetailQuestion; no: number; status: QStatus; }
type ReviewGroup = { kind: 'audio'; clip: AudioClip; items: ReviewItem[] } | { kind: 'single'; item: ReviewItem };

const ReviewPanel: React.FC<{
    review: ReviewState;
    audioUrls: Record<number, string>;
    onClose: () => void;
    onRetry: () => void;
    fmtDate: (iso: string | null) => string;
    fmtClock: (iso: string | null) => string;
    tzLabel: string;
}> = ({ review, audioUrls, onClose, onRetry, fmtDate, fmtClock, tzLabel }) => {
    useExamGuard(true);
    const [filter, setFilter] = useState<ReviewFilter>('all');
    const bodyRef = useRef<HTMLDivElement>(null);
    const { row, data } = review;

    const model = useMemo(() => {
        if (!data) return null;
        const clips = data.audio_clips ?? [];
        const byClip = new Map<number, DetailQuestion[]>();
        data.questions.forEach(q => {
            if (!q.audio_clip_id) return;
            if (!byClip.has(q.audio_clip_id)) byClip.set(q.audio_clip_id, []);
            byClip.get(q.audio_clip_id)!.push(q);
        });
        // Listening questions stay together under their clip; numbering follows the display order.
        const groups: ReviewGroup[] = [];
        const items: ReviewItem[] = [];
        const seen = new Set<number>();
        let no = 0;
        const make = (q: DetailQuestion) => {
            const item = { q, no: ++no, status: questionStatus(q) };
            items.push(item);
            return item;
        };
        data.questions.forEach(q => {
            if (q.audio_clip_id) {
                if (seen.has(q.audio_clip_id)) return;
                seen.add(q.audio_clip_id);
                const clip = clips.find(c => c.id === q.audio_clip_id) ?? { id: q.audio_clip_id, audio_order: 0, max_plays: 0, has_audio: false };
                groups.push({ kind: 'audio', clip, items: (byClip.get(q.audio_clip_id) ?? []).map(make) });
            } else {
                groups.push({ kind: 'single', item: make(q) });
            }
        });
        return { groups, items };
    }, [data]);

    const correctCount = model?.items.filter(i => i.status === 'correct').length ?? 0;
    const reviewCount = (model?.items.length ?? 0) - correctCount;
    const visible = (i: ReviewItem) => filter === 'all' || (filter === 'correct' ? i.status === 'correct' : i.status !== 'correct');

    const jumpTo = (item: ReviewItem) => {
        const go = () => bodyRef.current?.querySelector(`#qr-q-${item.q.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!visible(item)) { setFilter('all'); requestAnimationFrame(() => requestAnimationFrame(go)); }
        else go();
    };

    const renderItem = (item: ReviewItem) => {
        const { q, no, status } = item;
        const pts = toNum(q.points) ?? 0;
        const got = toNum(q.score) ?? 0;
        const selected = parseSelected(q.selected_options);
        return (
            <article key={q.id} id={`qr-q-${q.id}`} className={`qr-q is-${status}`}>
                <header className="qr-q-head">
                    <span className="qr-q-no">Question {no}</span>
                    <span className="qr-q-status">{STATUS_ICON[status]} {STATUS_LABEL[status]}</span>
                    <span className="qr-q-pts">{NUM.format(got)} / {NUM.format(pts)} pts</span>
                </header>
                <p className="qr-q-text">{q.question_text}</p>
                {isMcq(q) && q.options?.length ? (
                    <ul className="qr-options">
                        {q.options.map(o => {
                            const picked = selected.includes(o.id);
                            const cls = o.is_correct ? (picked ? 'is-hit' : 'is-missed') : picked ? 'is-wrong' : '';
                            return (
                                <li key={o.id} className={`qr-option ${cls}`}>
                                    <span className="qr-option-mark">{o.is_correct ? <CheckOutlined /> : picked ? <CloseOutlined /> : null}</span>
                                    <span className="qr-option-text">{o.option_text}</span>
                                    {picked && <span className="qr-option-tag">Your answer</span>}
                                    {!picked && o.is_correct && <span className="qr-option-tag">Correct answer</span>}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="qr-answers">
                        <div>
                            <div className="qr-answer-label">Your answer</div>
                            <div className={`qr-answer-box ${status === 'correct' ? 'is-good' : status === 'unanswered' ? '' : 'is-bad'}`}>
                                {answerText(q) || <em>No answer given</em>}
                            </div>
                        </div>
                        {q.correct_answer && status !== 'correct' && (
                            <div>
                                <div className="qr-answer-label">Correct answer</div>
                                <div className="qr-answer-box is-good">{q.correct_answer}</div>
                            </div>
                        )}
                    </div>
                )}
                {q.teacher_feedback && (
                    <div className="qr-q-feedback"><strong>Teacher feedback</strong>{q.teacher_feedback}</div>
                )}
            </article>
        );
    };

    const pct = row.pct ?? toNum(data?.submission.percentage) ?? 0;
    const time = data?.submission.time_taken ?? row.timeSecs;

    return (
        <div className="qr-review">
            <header className="qr-review-head">
                <div className="qr-review-head-bar">
                    <span className="qr-review-kicker">Quiz review</span>
                    <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} aria-label="Close review" />
                </div>
                <h2 className="qr-review-title">{data?.quiz.title ?? row.title}</h2>
                <ul className="qr-review-meta">
                    {row.batches.map(b => <li key={b} className="qr-chip"><TeamOutlined /> {b}</li>)}
                    {row.teacher && <li><UserOutlined /> {row.teacher}</li>}
                    {row.submittedAt && (
                        <li>
                            <CalendarOutlined /> {fmtDate(row.submittedAt)} at {fmtClock(row.submittedAt)}
                            <span className="qr-muted">{tzLabel}</span>
                        </li>
                    )}
                </ul>
            </header>

            <div className="qr-review-body" ref={bodyRef}>
                {review.status === 'loading' && (
                    <div className="qr-pad"><Skeleton active paragraph={{ rows: 3 }} /><Skeleton active paragraph={{ rows: 5 }} /></div>
                )}
                {review.status === 'error' && (
                    <div className="qr-pad">
                        <Alert type="error" showIcon message="Couldn't load this review" description={review.error}
                            action={<Button size="small" onClick={onRetry}>Retry</Button>} />
                    </div>
                )}
                {review.status === 'ready' && data && model && (
                    <>
                        <section className={`qr-review-summary qr-tone-${toneFor(pct)}`}>
                            <div className="qr-review-grade">{gradeFromPercent(pct)}</div>
                            <div className="qr-review-score">
                                <div className="qr-review-pct">{fmtPct(pct)}</div>
                                <div className="qr-meter" aria-hidden>
                                    <span style={{ width: `${Math.min(100, pct)}%` }} />
                                    <i style={{ left: `${PASS_MARK}%` }} />
                                </div>
                                <div className="qr-meter-caption">{pct >= PASS_MARK ? 'Above' : 'Below'} the {PASS_MARK}% pass mark</div>
                            </div>
                            <dl className="qr-review-facts">
                                <div><dt>Points</dt><dd>{NUM.format(toNum(data.submission.score) ?? 0)} / {NUM.format(toNum(data.submission.max_score) ?? 0)}</dd></div>
                                <div><dt>Correct</dt><dd>{correctCount} / {model.items.length}</dd></div>
                                <div><dt>Time</dt><dd>{fmtDuration(time)}</dd></div>
                            </dl>
                        </section>

                        {data.submission.teacher_feedback && (
                            <div className="qr-review-feedback">
                                <strong>Teacher feedback</strong>
                                {data.submission.teacher_feedback}
                            </div>
                        )}

                        <div className="qr-review-toolbar">
                            <Segmented<ReviewFilter>
                                size="small"
                                value={filter}
                                onChange={setFilter}
                                options={[
                                    { value: 'all', label: `All ${model.items.length}` },
                                    { value: 'review', label: `To review ${reviewCount}` },
                                    { value: 'correct', label: `Correct ${correctCount}` },
                                ]}
                            />
                            <div className="qr-nav" aria-label="Jump to question">
                                {model.items.map(it => (
                                    <button key={it.q.id} type="button" className={`qr-nav-item is-${it.status}`}
                                        onClick={() => jumpTo(it)} title={`Question ${it.no}: ${STATUS_LABEL[it.status]}`}>
                                        {it.no}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="qr-questions" onCopy={e => e.preventDefault()} onContextMenu={e => e.preventDefault()}>
                            {model.groups.map((g, gi) => {
                                if (g.kind === 'single') return visible(g.item) ? renderItem(g.item) : null;
                                const shown = g.items.filter(visible);
                                if (shown.length === 0) return null;
                                const got = g.items.reduce((s, i) => s + (toNum(i.q.score) ?? 0), 0);
                                const max = g.items.reduce((s, i) => s + (toNum(i.q.points) ?? 0), 0);
                                return (
                                    <section key={`clip-${g.clip.id}`} className="qr-audio">
                                        <header className="qr-audio-head">
                                            <SoundOutlined />
                                            <strong>Listening passage {g.clip.audio_order || gi + 1}</strong>
                                            <span>{plural(g.items.length, 'question')} · {NUM.format(got)} / {NUM.format(max)} pts</span>
                                        </header>
                                        {g.clip.has_audio && (audioUrls[g.clip.id] ? (
                                            <audio className="qr-audio-player" controls controlsList="nodownload noplaybackrate"
                                                src={audioUrls[g.clip.id]} onContextMenu={e => e.preventDefault()} />
                                        ) : (
                                            <div className="qr-audio-loading">Loading audio…</div>
                                        ))}
                                        <div className="qr-audio-items">{shown.map(renderItem)}</div>
                                    </section>
                                );
                            })}
                            {model.items.every(i => !visible(i)) && (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={filter === 'review' ? 'Nothing to review. Every question is correct.' : 'No correct answers in this quiz yet.'} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
const StudentQuizResults: React.FC = () => {
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const zone = resolveTimezone(user?.timezone);

    const [rows, setRows] = useState<ResultRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [batch, setBatch] = useState<string | null>(null);
    const [teacher, setTeacher] = useState<string | null>(null);
    const [grade, setGrade] = useState<GradeFilter | null>(null);
    const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [sort, setSort] = useState<SortKey>('newest');
    const [page, setPage] = useState(1);
    const [review, setReview] = useState<ReviewState | null>(null);
    const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
    const audioRef = useRef<Record<number, string>>({});
    const reviewSeq = useRef(0);
    const lastReview = useRef<ReviewState | null>(null);
    if (review) lastReview.current = review; // keeps drawer content during its close animation

    const [searchParams] = useSearchParams();
    const focusId = searchParams.get('focus');

    /* ── Dates in the student's timezone. The zone label is shown once (page subtitle,
          review header) instead of being repeated after every date and time. ── */
    const fmt = useMemo(() => {
        const make = (opts: Intl.DateTimeFormatOptions, locale = 'en-US') => {
            const f = new Intl.DateTimeFormat(locale, { timeZone: zone, ...opts });
            return (iso: string | null) => {
                if (!iso) return '';
                const d = new Date(iso);
                return isNaN(d.getTime()) ? '' : f.format(d);
            };
        };
        return {
            date: make({ month: 'short', day: 'numeric', year: 'numeric' }),
            clock: make({ hour: '2-digit', minute: '2-digit', hour12: false }, 'en-GB'),
            day: make({ year: 'numeric', month: '2-digit', day: '2-digit' }, 'en-CA'), // YYYY-MM-DD, for date filtering
        };
    }, [zone]);
    const fmtDate = (iso: string | null) => fmt.date(iso) || '—';
    const fmtClock = fmt.clock;
    const dayKey = fmt.day;
    const tzLabel = timezoneLabel(zone);

    /* ── Data ── */
    const fetchResults = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await apiCall('/quizzes/student/results');
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body?.error || 'Failed to load results');
            setRows(normalize(Array.isArray(body?.results) ? body.results : []));
        } catch (e: any) { setError(e?.message || 'Failed to load results'); }
        finally { setLoading(false); }
    }, [apiCall]);

    useEffect(() => { fetchResults(); }, [fetchResults]);

    /* ── Filters ── */
    const batchOptions = useMemo(() => Array.from(new Set(rows.flatMap(x => x.batches))).sort().map(v => ({ value: v, label: v })), [rows]);
    const teacherOptions = useMemo(() => Array.from(new Set(rows.map(x => x.teacher).filter((t): t is string => !!t))).sort().map(v => ({ value: v, label: v })), [rows]);
    const hasFilters = !!(search.trim() || batch || teacher || grade || range?.[0] || range?.[1]);

    const list = useMemo(() => {
        const q = search.trim().toLowerCase();
        const from = range?.[0]?.format('YYYY-MM-DD');
        const to = range?.[1]?.format('YYYY-MM-DD');
        const filtered = rows.filter(row => {
            if (q && !row.title.toLowerCase().includes(q) && !row.batches.some(b => b.toLowerCase().includes(q))) return false;
            if (batch && !row.batches.includes(batch)) return false;
            if (teacher && row.teacher !== teacher) return false;
            if (grade === 'pending' && isGraded(row)) return false;
            if (grade && grade !== 'pending' && (!isGraded(row) || bandFor(row.pct as number).label !== grade)) return false;
            if (from || to) {
                if (!row.submittedAt) return false;
                const k = dayKey(row.submittedAt);
                if (from && k < from) return false;
                if (to && k > to) return false;
            }
            return true;
        });
        const time = (x: ResultRow) => (x.submittedAt ? new Date(x.submittedAt).getTime() : 0);
        const score = (x: ResultRow) => (isGraded(x) ? (x.pct as number) : -1);
        return filtered.sort((a, b) => {
            if (sort === 'oldest') return time(a) - time(b);
            if (sort === 'best') return score(b) - score(a) || time(b) - time(a);
            if (sort === 'worst') {
                // Locked results (no score yet) go last rather than first.
                const sa = isGraded(a) ? score(a) : 101, sb = isGraded(b) ? score(b) : 101;
                return sa - sb || time(b) - time(a);
            }
            return time(b) - time(a);
        });
    }, [rows, search, batch, teacher, grade, range, sort, dayKey]);

    useEffect(() => { setPage(1); }, [search, batch, teacher, grade, range, sort]);

    const stats = useMemo(() => {
        let graded = 0, pending = 0, passed = 0, pts = 0, max = 0, correct = 0, questions = 0, time = 0;
        let best: ResultRow | null = null;
        let lastAt: string | null = null;
        for (const row of list) {
            time += row.timeSecs;
            if (row.submittedAt && (!lastAt || row.submittedAt > lastAt)) lastAt = row.submittedAt;
            if (!isGraded(row)) { pending++; continue; }
            graded++;
            if ((row.pct as number) >= PASS_MARK) passed++;
            pts += row.score ?? 0;
            max += row.maxScore ?? 0;
            if (row.correct != null && row.questions) { correct += row.correct; questions += row.questions; }
            if (!best || (row.pct as number) > (best.pct as number)) best = row;
        }
        return {
            graded, pending, passed, correct, questions, time, lastAt,
            best: best as ResultRow | null,
            average: max > 0 ? (pts / max) * 100 : null,
            passRate: graded > 0 ? (passed / graded) * 100 : null,
            accuracy: questions > 0 ? (correct / questions) * 100 : null,
            avgTime: list.length ? time / list.length : 0,
        };
    }, [list]);

    /* ── Deep link from a "grade published" notification: ?focus=<submissionId> ── */
    useEffect(() => {
        if (!focusId || loading) return;
        const idx = list.findIndex(x => x.key === focusId);
        if (idx < 0) return;
        setPage(Math.floor(idx / PAGE_SIZE) + 1);
        const t = setTimeout(() => {
            const el = document.querySelector(`[data-focus-id="${focusId}"]`);
            if (!el) return;
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('qr-focus');
            setTimeout(() => el.classList.remove('qr-focus'), 2600);
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusId, loading]);

    /* ── Review drawer ── */
    const revokeAudio = useCallback(() => {
        Object.values(audioRef.current).forEach(u => URL.revokeObjectURL(u));
        audioRef.current = {};
        setAudioUrls({});
    }, []);
    useEffect(() => () => { Object.values(audioRef.current).forEach(u => URL.revokeObjectURL(u)); }, []);

    const loadAudio = async (detail: Detail, seq: number) => {
        const clips = (detail.audio_clips ?? []).filter(c => c.has_audio);
        await Promise.all(clips.map(async clip => {
            try {
                const res = await apiCall(`/quizzes/audio/${clip.id}/stream`);
                if (!res.ok) return;
                const j = await res.json();
                if (!j.audioData || seq !== reviewSeq.current) return;
                const bin = atob(j.audioData);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                const url = URL.createObjectURL(new Blob([bytes], { type: j.contentType || 'audio/wav' }));
                if (seq !== reviewSeq.current) { URL.revokeObjectURL(url); return; }
                audioRef.current[clip.id] = url;
                setAudioUrls(prev => ({ ...prev, [clip.id]: url }));
            } catch { /* audio is optional in the review */ }
        }));
    };

    const openReview = async (row: ResultRow) => {
        if (row.locked) return;
        const seq = ++reviewSeq.current;
        revokeAudio();
        setReview({ row, status: 'loading' });
        try {
            const res = await apiCall(`/quizzes/${row.quizId}/student-results`);
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body?.error || 'Failed to load review');
            if (seq !== reviewSeq.current) return;
            setReview({ row, status: 'ready', data: body as Detail });
            loadAudio(body as Detail, seq);
        } catch (e: any) {
            if (seq === reviewSeq.current) setReview({ row, status: 'error', error: e?.message || 'Failed to load review' });
        }
    };

    const closeReview = () => {
        reviewSeq.current++;
        setReview(null);
        revokeAudio();
    };

    const clearFilters = () => { setSearch(''); setBatch(null); setTeacher(null); setGrade(null); setRange(null); };

    /* ── Columns ── */
    const LOCK_SPAN = 3; // Correct + Score + Grade
    const hideWhenLocked = (row: ResultRow) => ({ colSpan: row.locked ? 0 : 1 });
    const columns: ColumnsType<ResultRow> = [
        {
            title: 'Quiz', key: 'quiz',
            render: (_, row) => (
                <div>
                    <div className="qr-cell-title" title={row.title}>{row.title}</div>
                    <div className="qr-cell-meta">{[row.batches.join(', '), row.teacher].filter(Boolean).join(' · ')}</div>
                </div>
            ),
        },
        {
            title: 'Submitted', key: 'submitted', width: 136,
            sorter: true, sortDirections: ['descend', 'ascend'],
            sortOrder: sort === 'newest' ? 'descend' : sort === 'oldest' ? 'ascend' : null,
            render: (_, row) => row.submittedAt ? (
                <div>
                    <div>{fmtDate(row.submittedAt)}</div>
                    <div className="qr-cell-meta">{fmtClock(row.submittedAt)}</div>
                </div>
            ) : <span className="qr-muted">—</span>,
        },
        { title: 'Time', key: 'time', width: 84, align: 'right', render: (_, row) => fmtDuration(row.timeSecs) },
        {
            title: 'Correct', key: 'correct', width: 92, align: 'right',
            onCell: row => (row.locked ? { colSpan: LOCK_SPAN, className: 'qr-cell-locked' } : {}),
            render: (_, row) => row.locked ? (
                <span className="qr-pill"><LockOutlined /> {row.releaseAt ? `Results released ${fmtDate(row.releaseAt)}` : 'Awaiting release'}</span>
            ) : row.correct != null && row.questions ? `${row.correct} / ${row.questions}` : <span className="qr-muted">—</span>,
        },
        {
            title: 'Score', key: 'score', width: 168, align: 'right', onCell: hideWhenLocked,
            sorter: true, sortDirections: ['descend', 'ascend'],
            sortOrder: sort === 'best' ? 'descend' : sort === 'worst' ? 'ascend' : null,
            render: (_, row) => row.pct != null ? (
                <div>
                    <ScoreCell pct={row.pct} />
                    {row.score != null && row.maxScore != null && (
                        <div className="qr-cell-meta">{NUM.format(row.score)} / {NUM.format(row.maxScore)} pts</div>
                    )}
                </div>
            ) : null,
        },
        {
            title: 'Grade', key: 'grade', width: 72, align: 'center', onCell: hideWhenLocked,
            render: (_, row) => row.pct != null ? <GradeBadge pct={row.pct} /> : null,
        },
        {
            title: '', key: 'action', width: 104, align: 'right',
            render: (_, row) => row.locked ? (
                <Tooltip title="Available once the quiz closes">
                    <Button size="small" type="text" disabled icon={<LockOutlined />}>Locked</Button>
                </Tooltip>
            ) : (
                <Button size="small" className="qr-review-btn"
                    loading={review?.row.key === row.key && review.status === 'loading'}
                    onClick={e => { e.stopPropagation(); openReview(row); }}>
                    Review <RightOutlined />
                </Button>
            ),
        },
    ];

    /* ═══════════ LOADING ═══════════ */
    if (loading) return (
        <div className="qr" aria-busy="true">
            <div className="qr-header">
                <div>
                    <Skeleton.Input active size="small" style={{ width: 80, height: 12 }} />
                    <div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 220, height: 24 }} /></div>
                </div>
            </div>
            <div className="qr-overview qr-overview-loading"><Skeleton active avatar={{ size: 76 }} title={false} paragraph={{ rows: 3 }} /></div>
            <div className="qr-card" style={{ padding: 20 }}><Skeleton active title={false} paragraph={{ rows: 8 }} /></div>
        </div>
    );

    /* ═══════════ RENDER ═══════════ */
    const pageRows = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const panel = review ?? lastReview.current;

    const emptyState = (
        <div className="qr-empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={rows.length === 0 ? 'No results yet. Your quiz results will appear here once you submit a quiz.' : 'No results match these filters.'}>
                {rows.length > 0 && hasFilters && <Button size="small" onClick={clearFilters}>Clear filters</Button>}
            </Empty>
        </div>
    );

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#047857', fontSize: 13 } }}>
            <div className="qr">

                {/* ── Header ── */}
                <header className="qr-header">
                    <div>
                        <div className="qr-overline">Results</div>
                        <h1 className="qr-title">Quiz results</h1>
                        <ul className="qr-header-meta">
                            <li>
                                <FileDoneOutlined />
                                {hasFilters && list.length !== rows.length ? `${list.length} of ${plural(rows.length, 'result')}` : plural(list.length, 'result')}
                            </li>
                            {stats.pending > 0 && <li><LockOutlined /> {stats.pending} awaiting release</li>}
                            {stats.lastAt && <li><CalendarOutlined /> Last submitted {fmtDate(stats.lastAt)}</li>}
                            <li><GlobalOutlined /> Times in {tzLabel}</li>
                        </ul>
                    </div>
                    {hasFilters && <Button size="small" onClick={clearFilters}>Clear filters</Button>}
                </header>

                {error && (
                    <Alert type="error" showIcon message="Couldn't load your results" description={error}
                        action={<Button size="small" onClick={fetchResults}>Retry</Button>} />
                )}

                {/* ── Summary (follows the active filters) ── */}
                <section className="qr-overview" aria-label="Summary">
                    <div className={`qr-hero${stats.average != null ? ` qr-tone-${toneFor(stats.average)}` : ''}`}>
                        <Ring pct={stats.average} />
                        <div className="qr-hero-text">
                            <div className="qr-hero-label">Average score</div>
                            <div className="qr-hero-grade">
                                {stats.average != null ? <>Grade <GradeBadge pct={stats.average} /></> : 'No grades yet'}
                            </div>
                        </div>
                    </div>
                    <div className="qr-tiles">
                        <StatTile
                            icon={<TrophyOutlined />}
                            label="Best score"
                            value={fmtPct(stats.best?.pct ?? null)}
                            note={stats.best ? <span title={stats.best.title}>Achieved in “{stats.best.title}”</span> : 'No graded quiz yet'}
                        />
                        <StatTile
                            icon={<CheckCircleOutlined />}
                            label="Quizzes passed"
                            value={<>{stats.passed} <small>/ {stats.graded}</small></>}
                            bar={stats.passRate}
                            note={stats.passRate != null ? `${Math.round(stats.passRate)}% pass rate` : 'No graded quiz yet'}
                        />
                        <StatTile
                            icon={<AimOutlined />}
                            label="Accuracy"
                            value={stats.accuracy != null ? `${Math.round(stats.accuracy)}%` : '—'}
                            bar={stats.accuracy}
                            note={stats.questions ? `${stats.correct} of ${stats.questions} questions correct` : 'No answers yet'}
                        />
                        <StatTile
                            icon={<FieldTimeOutlined />}
                            label="Time spent"
                            value={fmtDuration(stats.time)}
                            note={list.length ? `${fmtDuration(stats.avgTime)} per quiz on average` : '—'}
                        />
                    </div>
                </section>

                {/* ── Results ── */}
                <section className="qr-card" aria-label="Results">
                    <div className="qr-toolbar">
                        <Input
                            className="qr-search"
                            prefix={<SearchOutlined className="qr-muted" />}
                            placeholder="Search quizzes"
                            allowClear
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            aria-label="Search quizzes"
                        />
                        {batchOptions.length > 1 && (
                            <Select className="qr-filter" allowClear placeholder="All batches" value={batch} onChange={v => setBatch(v ?? null)}
                                options={batchOptions} aria-label="Filter by batch" />
                        )}
                        {teacherOptions.length > 1 && (
                            <Select className="qr-filter" allowClear placeholder="All teachers" value={teacher} onChange={v => setTeacher(v ?? null)}
                                options={teacherOptions} aria-label="Filter by teacher" />
                        )}
                        <Select<GradeFilter>
                            className="qr-filter qr-filter-sm" allowClear placeholder="Any grade" value={grade ?? undefined}
                            onChange={v => setGrade(v ?? null)} aria-label="Filter by grade"
                            options={[
                                ...GRADE_BANDS.map(b => ({ value: b.label, label: `${b.label} · ${b.range}%` })),
                                { value: 'pending' as const, label: 'Awaiting release' },
                            ]}
                        />
                        <RangePicker className="qr-range" value={range} onChange={v => setRange(v)} allowEmpty={[true, true]} />
                        <Select<SortKey>
                            className="qr-filter qr-sort" value={sort} onChange={setSort} aria-label="Sort results"
                            options={[
                                { value: 'newest', label: 'Newest first' },
                                { value: 'oldest', label: 'Oldest first' },
                                { value: 'best', label: 'Highest score' },
                                { value: 'worst', label: 'Lowest score' },
                            ]}
                        />
                    </div>

                    {list.length === 0 ? emptyState : !r.isMobile ? (
                        <Table<ResultRow>
                            className="qr-table"
                            columns={columns}
                            dataSource={list}
                            rowKey="key"
                            tableLayout="fixed"
                            scroll={{ x: 900 }}
                            sticky={{ offsetHeader: headerHeight(r.isMobile) }}
                            size="middle"
                            showSorterTooltip={false}
                            rowClassName={row => (row.locked ? 'qr-row-locked' : 'qr-row-link')}
                            onRow={row => ({
                                onClick: () => openReview(row),
                                'data-focus-id': row.key,
                            } as React.HTMLAttributes<HTMLElement>)}
                            onChange={(_p, _f, sorter, extra) => {
                                if (extra.action !== 'sort') return;
                                const s = Array.isArray(sorter) ? sorter[0] : sorter;
                                if (!s?.order) setSort('newest');
                                else if (s.columnKey === 'score') setSort(s.order === 'descend' ? 'best' : 'worst');
                                else setSort(s.order === 'descend' ? 'newest' : 'oldest');
                            }}
                            pagination={{
                                current: page, pageSize: PAGE_SIZE, onChange: setPage,
                                hideOnSinglePage: true, showSizeChanger: false, size: 'small',
                                showTotal: (total, [from, to]) => `${from}–${to} of ${total}`,
                            }}
                        />
                    ) : (
                        <>
                            <ul className="qr-list">
                                {pageRows.map(row => (
                                    <li key={row.key} data-focus-id={row.key}>
                                        <button type="button" className="qr-list-item" disabled={row.locked} onClick={() => openReview(row)}>
                                            <div className="qr-list-main">
                                                <div className="qr-cell-title">{row.title}</div>
                                                <div className="qr-cell-meta">
                                                    {[row.batches.join(', '), row.submittedAt && fmtDate(row.submittedAt), fmtDuration(row.timeSecs)].filter(Boolean).join(' · ')}
                                                </div>
                                                {row.locked ? (
                                                    <div className="qr-cell-meta"><LockOutlined /> {row.releaseAt ? `Results released ${fmtDate(row.releaseAt)}` : 'Awaiting release'}</div>
                                                ) : row.correct != null && row.questions ? (
                                                    <div className="qr-cell-meta">{row.correct}/{row.questions} correct · {NUM.format(row.score ?? 0)}/{NUM.format(row.maxScore ?? 0)} pts</div>
                                                ) : null}
                                            </div>
                                            <div className="qr-list-side">
                                                {row.pct != null && (
                                                    <>
                                                        <span className="qr-list-pct">{fmtPct(row.pct)}</span>
                                                        <GradeBadge pct={row.pct} />
                                                    </>
                                                )}
                                                {!row.locked && <RightOutlined className="qr-muted" />}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {list.length > PAGE_SIZE && (
                                <div className="qr-foot">
                                    <Pagination simple size="small" current={page} pageSize={PAGE_SIZE} total={list.length} onChange={setPage} />
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* ── Review drawer ── */}
                <Drawer
                    open={!!review}
                    onClose={closeReview}
                    placement="right"
                    width={r.isMobile ? '100%' : 680}
                    closable={false}
                    destroyOnHidden
                    rootClassName="qr-drawer"
                    styles={{ body: { padding: 0 } }}
                >
                    {panel && (
                        <ReviewPanel
                            key={panel.row.key}
                            review={panel}
                            audioUrls={audioUrls}
                            onClose={closeReview}
                            onRetry={() => openReview(panel.row)}
                            fmtDate={fmtDate}
                            fmtClock={fmtClock}
                            tzLabel={tzLabel}
                        />
                    )}
                </Drawer>
            </div>
        </ConfigProvider>
    );
};

export default StudentQuizResults;
