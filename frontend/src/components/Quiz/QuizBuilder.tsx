import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Button, ConfigProvider, DatePicker, Drawer, Input, InputNumber, Modal, Popconfirm, Popover, Segmented, Select, Skeleton, Switch, Tooltip, message,
} from 'antd';
import type { InputRef } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import {
    ArrowDownOutlined, ArrowUpOutlined, CheckCircleFilled, CheckOutlined, CloseOutlined, CopyOutlined, DeleteOutlined, EditOutlined,
    ExclamationCircleOutlined, InfoCircleOutlined, LoadingOutlined, LockOutlined, PlusOutlined, SoundOutlined, ThunderboltOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import AIQuizGenerator from './AIQuizGenerator';
import AudioQuestionModal from './AudioQuestionModal';
import {
    TYPE_META, allQuestions, draftFromApi, duplicateDraft, emptyDraft, emptyOption, fmtNumber, isoToWall, makeWhen, newQuestion, plural,
    questionIssues, retype, toPayload, totalPoints, uid, validateDraft, wallToIso,
} from './quizModel';
import type { Block, DraftClip, DraftQuestion, DraftQuiz, Issue, QuestionType, QuizRow } from './quizModel';
import '../Teacher/Teacher.css';
import './Quiz.css';

/* ══════════════════════════════════════════
   QUIZ BUILDER — full-screen studio for creating and editing a quiz.
   Questions are edited inline; listening sections group questions under one audio clip.
══════════════════════════════════════════ */

export interface BuilderResult { id: number; created: boolean; published: boolean; notified: number; regraded: number }

interface Props {
    quizId: number | null;
    duplicateOf: number | null;
    startWithAI: boolean;
    /** The list row, when editing — used to warn about students who already took the quiz. */
    context: QuizRow | null;
    onClose: () => void;
    onSaved: (result: BuilderResult) => void;
}

interface BatchOption { id: number; name: string; level: string; students: number }
type Mover = (key: string, dir: -1 | 1) => void;

const LETTERS = 'ABCDEFGHIJ';
const MAX_OPTIONS = 8;
const DURATION_CHIPS = [10, 15, 20, 30, 45, 60];
const WALL = 'YYYY-MM-DDTHH:mm';

const apiError = (data: any, fallback: string) => {
    const detail = Array.isArray(data?.details) && data.details[0]?.msg ? ` (${data.details[0].msg}${data.details[0].path ? `: ${data.details[0].path}` : ''})` : '';
    return data?.error ? `${data.error}${detail}` : fallback;
};

/* ─────────────── Question card ─────────────── */
interface CardProps {
    q: DraftQuestion;
    number: number;
    editing: boolean;
    showIssues: boolean;
    first: boolean;
    last: boolean;
    locked: boolean;
    onPatch: (key: string, fn: (q: DraftQuestion) => DraftQuestion) => void;
    onEdit: (key: string | null) => void;
    onMove: Mover;
    onDuplicate: (key: string) => void;
    onRemove: (key: string) => void;
}

const QuestionCard = memo(function QuestionCard({ q, number, editing, showIssues, first, last, locked, onPatch, onEdit, onMove, onDuplicate, onRemove }: CardProps) {
    const issues = useMemo(() => questionIssues(q), [q]);
    const refs = useRef(new Map<string, InputRef | null>());
    const textRef = useRef<any>(null);
    const [focusKey, setFocusKey] = useState<string | null>(null);
    const [explain, setExplain] = useState(!!q.explanation);

    useEffect(() => {
        if (!focusKey) return;
        refs.current.get(focusKey)?.focus();
        setFocusKey(null);
    }, [focusKey, q.options]);
    useEffect(() => {
        if (editing && !q.text) textRef.current?.focus?.();
        // focus the question text only when the card opens empty
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing]);

    const patch = (fn: (x: DraftQuestion) => DraftQuestion) => onPatch(q.key, fn);
    const setOption = (key: string, text: string) => patch(x => ({ ...x, options: x.options.map(o => (o.key === key ? { ...o, text } : o)) }));
    const toggleCorrect = (key: string) => patch(x => ({
        ...x,
        options: x.options.map(o => x.type === 'mcq_single' ? { ...o, correct: o.key === key } : o.key === key ? { ...o, correct: !o.correct } : o),
    }));
    const addOption = (afterKey?: string) => {
        if (q.options.length >= MAX_OPTIONS) return;
        const next = emptyOption();
        patch(x => {
            const at = afterKey ? x.options.findIndex(o => o.key === afterKey) + 1 : x.options.length;
            const options = [...x.options];
            options.splice(at, 0, next);
            return { ...x, options };
        });
        setFocusKey(next.key);
    };
    const removeOption = (key: string) => patch(x => ({ ...x, options: x.options.filter(o => o.key !== key) }));

    const meta = TYPE_META[q.type];
    const flagged = showIssues && issues.length > 0;

    const tools = (
        <span className="qz-q-tools" onClick={e => e.stopPropagation()}>
            <Tooltip title="Move up"><Button type="text" size="small" icon={<ArrowUpOutlined />} disabled={first || locked} onClick={() => onMove(q.key, -1)} aria-label="Move up" /></Tooltip>
            <Tooltip title="Move down"><Button type="text" size="small" icon={<ArrowDownOutlined />} disabled={last || locked} onClick={() => onMove(q.key, 1)} aria-label="Move down" /></Tooltip>
            <Tooltip title="Duplicate"><Button type="text" size="small" icon={<CopyOutlined />} disabled={locked} onClick={() => onDuplicate(q.key)} aria-label="Duplicate question" /></Tooltip>
            <Popconfirm title="Delete this question?" description={q.id ? 'Students’ answers to it are deleted when you save.' : undefined}
                okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => onRemove(q.key)} disabled={locked}>
                <Tooltip title="Delete"><Button type="text" size="small" className="is-danger" icon={<DeleteOutlined />} disabled={locked} aria-label="Delete question" /></Tooltip>
            </Popconfirm>
        </span>
    );

    if (!editing) {
        return (
            <article id={`qz-q-${q.key}`} className={`qz-q${flagged ? ' is-flagged' : ''}`}>
                <div className="qz-q-head">
                    <span className="qz-q-num">{number}</span>
                    <span className="qz-q-type">{meta.short}</span>
                    <span className="qz-q-pts">{plural(Number(fmtNumber(q.points)) || 0, 'pt')}</span>
                    {tools}
                </div>
                <div className="qz-q-view" role="button" tabIndex={locked ? -1 : 0} aria-label={`Edit question ${number}`}
                    onClick={() => !locked && onEdit(q.key)} onKeyDown={e => { if (!locked && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onEdit(q.key); } }}>
                    <p className={`qz-q-text${q.text ? '' : ' is-empty'}`}>{q.text || 'No question text yet'}</p>
                    {q.type === 'yes_no' ? (
                        <div className="qz-yn is-view">
                            {(['yes', 'no'] as const).map(v => (
                                <span key={v} className={`qz-yn-opt${q.answer === v ? ' is-correct' : ''}`}>{q.answer === v && <CheckOutlined />}{v === 'yes' ? 'Yes' : 'No'}</span>
                            ))}
                        </div>
                    ) : (
                        <ul className="qz-opts is-view">
                            {q.options.filter(o => o.text.trim()).map((o, i) => (
                                <li key={o.key} className={o.correct ? 'is-correct' : undefined}>
                                    <span className="qz-opt-letter">{o.correct ? <CheckOutlined /> : LETTERS[i]}</span>
                                    <span>{o.text}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {q.explanation && <p className="qz-q-explain"><InfoCircleOutlined /> {q.explanation}</p>}
                    {flagged && <p className="qz-q-issue"><ExclamationCircleOutlined /> {issues[0]}</p>}
                    {!locked && <span className="qz-q-edit-hint"><EditOutlined /> Edit</span>}
                </div>
            </article>
        );
    }

    return (
        <article id={`qz-q-${q.key}`} className="qz-q is-editing">
            <div className="qz-q-head">
                <span className="qz-q-num">{number}</span>
                <Segmented<QuestionType> size="small" value={q.type} onChange={t => patch(x => retype(x, t))}
                    options={(Object.keys(TYPE_META) as QuestionType[]).map(t => ({ value: t, label: TYPE_META[t].short }))} />
                <span className="qz-q-pts-edit">
                    <InputNumber size="small" min={0.5} max={100} step={0.5} value={q.points} aria-label="Points"
                        onChange={v => patch(x => ({ ...x, points: Number(v) || 0 }))} />
                    <em>pts</em>
                </span>
                {tools}
            </div>

            <Input.TextArea ref={textRef} className="qz-q-input" autoSize={{ minRows: 2, maxRows: 10 }} maxLength={2000}
                placeholder="Write the question students will answer…" value={q.text}
                onChange={e => { const text = e.target.value; patch(x => ({ ...x, text })); }} />

            {q.type === 'yes_no' ? (
                <div className="qz-yn" role="radiogroup" aria-label="Correct answer">
                    {(['yes', 'no'] as const).map(v => (
                        <button key={v} type="button" role="radio" aria-checked={q.answer === v}
                            className={`qz-yn-opt${q.answer === v ? ' is-correct' : ''}`} onClick={() => patch(x => ({ ...x, answer: v }))}>
                            <span className="qz-mark is-radio">{q.answer === v && <CheckOutlined />}</span>
                            {v === 'yes' ? 'Yes' : 'No'}
                        </button>
                    ))}
                    <span className="qz-hint">Select the correct answer.</span>
                </div>
            ) : (
                <div className="qz-opts">
                    {q.options.map((o, i) => (
                        <div key={o.key} className={`qz-opt${o.correct ? ' is-correct' : ''}`}>
                            <Tooltip title={o.correct ? 'Correct answer' : 'Mark as correct'} mouseEnterDelay={0.4}>
                                <button type="button" className={`qz-mark ${q.type === 'mcq_single' ? 'is-radio' : 'is-check'}`}
                                    aria-pressed={o.correct} aria-label={`Mark option ${LETTERS[i]} as correct`} onClick={() => toggleCorrect(o.key)}>
                                    {o.correct && <CheckOutlined />}
                                </button>
                            </Tooltip>
                            <span className="qz-opt-letter">{LETTERS[i]}</span>
                            <Input ref={el => { refs.current.set(o.key, el); }} variant="borderless" value={o.text} maxLength={500}
                                placeholder={`Option ${LETTERS[i]}`} onChange={e => setOption(o.key, e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOption(o.key); } }} />
                            <Tooltip title="Remove option">
                                <Button type="text" size="small" icon={<CloseOutlined />} disabled={q.options.length <= 2}
                                    onClick={() => removeOption(o.key)} aria-label={`Remove option ${LETTERS[i]}`} />
                            </Tooltip>
                        </div>
                    ))}
                    <div className="qz-opts-foot">
                        {q.options.length < MAX_OPTIONS && <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => addOption()}>Add option</Button>}
                        <span className="qz-hint">{meta.hint} Press Enter to add the next option.</span>
                    </div>
                </div>
            )}

            {explain ? (
                <div className="qz-q-explain-edit">
                    <label htmlFor={`qz-ex-${q.key}`}>Explanation <em>shown with the correction</em></label>
                    <Input.TextArea id={`qz-ex-${q.key}`} autoSize={{ minRows: 1, maxRows: 5 }} maxLength={1000} placeholder="Why is this the right answer?"
                        value={q.explanation} onChange={e => { const explanation = e.target.value; patch(x => ({ ...x, explanation })); }} />
                </div>
            ) : (
                <Button type="link" size="small" className="qz-q-explain-add" icon={<PlusOutlined />} onClick={() => setExplain(true)}>Add explanation</Button>
            )}

            {showIssues && issues.length > 0 && (
                <ul className="qz-q-issues">{issues.map(i => <li key={i}><ExclamationCircleOutlined /> {i}</li>)}</ul>
            )}
            <div className="qz-q-foot">
                <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => onEdit(null)}>Done</Button>
            </div>
        </article>
    );
});

/* ─────────────── Listening section ─────────────── */
interface SectionProps {
    block: Extract<Block, { kind: 'listening' }>;
    startNumber: number;
    editingKey: string | null;
    showIssues: boolean;
    first: boolean;
    last: boolean;
    locked: boolean;
    apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
    onEditAudio: (blockKey: string) => void;
    onRemove: (blockKey: string) => void;
    onMoveBlock: Mover;
    onAddQuestion: (blockKey: string) => void;
    card: Pick<CardProps, 'onPatch' | 'onEdit' | 'onDuplicate' | 'onRemove'>;
    onMoveQuestion: Mover;
}

const ListeningSection = memo(function ListeningSection({
    block, startNumber, editingKey, showIssues, first, last, locked, apiCall, onEditAudio, onRemove, onMoveBlock, onAddQuestion, card, onMoveQuestion,
}: SectionProps) {
    const { clip } = block;
    const [url, setUrl] = useState<string | null>(null);
    const [loadingAudio, setLoadingAudio] = useState(false);
    const [audioError, setAudioError] = useState(false);
    const urlRef = useRef<string | null>(null);

    // A new file (regenerated or re-uploaded) invalidates the loaded preview.
    useEffect(() => {
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
        setUrl(null);
        setAudioError(false);
    }, [clip.kdriveFileId]);
    useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

    const loadAudio = async () => {
        if (!clip.kdriveFileId) return;
        setLoadingAudio(true);
        setAudioError(false);
        try {
            const res = await apiCall(`/quizzes/audio/preview/${clip.kdriveFileId}`);
            if (!res.ok) throw new Error();
            const next = URL.createObjectURL(await res.blob());
            if (urlRef.current) URL.revokeObjectURL(urlRef.current);
            urlRef.current = next;
            setUrl(next);
        } catch {
            setAudioError(true);
        } finally {
            setLoadingAudio(false);
        }
    };

    const points = block.questions.reduce((s, q) => s + (Number(q.points) || 0), 0);
    const flagged = showIssues && (!clip.kdriveFileId || !block.questions.length);

    return (
        <section id={`qz-b-${block.key}`} className={`qz-listen${flagged ? ' is-flagged' : ''}`}>
            <header className="qz-listen-head">
                <span className="qz-listen-ic"><SoundOutlined /></span>
                <div className="qz-listen-id">
                    <strong>Listening section</strong>
                    <em>{clip.transcript && !clip.transcript.startsWith('[Uploaded') ? clip.transcript : clip.fileName || 'Uploaded recording'}</em>
                </div>
                <span className="qz-q-tools">
                    <Tooltip title="Move section up"><Button type="text" size="small" icon={<ArrowUpOutlined />} disabled={first || locked} onClick={() => onMoveBlock(block.key, -1)} aria-label="Move section up" /></Tooltip>
                    <Tooltip title="Move section down"><Button type="text" size="small" icon={<ArrowDownOutlined />} disabled={last || locked} onClick={() => onMoveBlock(block.key, 1)} aria-label="Move section down" /></Tooltip>
                    <Tooltip title="Edit audio"><Button type="text" size="small" icon={<EditOutlined />} disabled={locked} onClick={() => onEditAudio(block.key)} aria-label="Edit audio" /></Tooltip>
                    <Popconfirm title="Delete this listening section?"
                        description={`The audio and ${plural(block.questions.length, 'question')} in it are removed.`}
                        okText="Delete section" okButtonProps={{ danger: true }} onConfirm={() => onRemove(block.key)} disabled={locked}>
                        <Tooltip title="Delete section"><Button type="text" size="small" className="is-danger" icon={<DeleteOutlined />} disabled={locked} aria-label="Delete section" /></Tooltip>
                    </Popconfirm>
                </span>
            </header>

            <div className="qz-listen-bar">
                <span className="qz-chip">{clip.sourceType === 'tts' ? `Generated voice · ${clip.voiceName}` : 'Uploaded recording'}</span>
                {clip.durationSeconds ? <span className="qz-chip">{Math.round(clip.durationSeconds)} s</span> : null}
                <span className="qz-chip">{clip.maxPlays ? `Plays: ${clip.maxPlays}×` : 'Unlimited plays'}</span>
                <span className="qz-chip">{plural(block.questions.length, 'question')} · {fmtNumber(points)} pts</span>
                <span className="qz-listen-player">
                    {!clip.kdriveFileId ? (
                        <span className="qz-q-issue"><ExclamationCircleOutlined /> No audio yet</span>
                    ) : url ? (
                        <audio controls controlsList="nodownload" src={url} autoPlay />
                    ) : (
                        <Button size="small" icon={loadingAudio ? <LoadingOutlined /> : <SoundOutlined />} onClick={loadAudio} disabled={loadingAudio}>
                            {audioError ? 'Retry audio' : 'Play audio'}
                        </Button>
                    )}
                </span>
            </div>

            <div className="qz-listen-body">
                {block.questions.map((q, i) => (
                    <QuestionCard key={q.key} q={q} number={startNumber + i} editing={editingKey === q.key} showIssues={showIssues}
                        first={i === 0} last={i === block.questions.length - 1} locked={locked} onMove={onMoveQuestion} {...card} />
                ))}
                {!block.questions.length && <p className="qz-q-issue"><ExclamationCircleOutlined /> Add at least one question about this audio.</p>}
                {!locked && (
                    <Button type="dashed" block icon={<PlusOutlined />} onClick={() => onAddQuestion(block.key)}>Add a question about this audio</Button>
                )}
            </div>
        </section>
    );
});

/* ─────────────── Builder ─────────────── */
const QuizBuilder: React.FC<Props> = ({ quizId, duplicateOf, startWithAI, context, onClose, onSaved }) => {
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const [msg, msgHolder] = message.useMessage();
    const [modal, modalHolder] = Modal.useModal();
    const tz = resolveTimezone(user?.timezone);
    const tzText = `${timezoneLabel(user?.timezone)} (${tz.replace(/_/g, ' ')})`;
    const when = useMemo(() => makeWhen(tz), [tz]);

    const [draft, setDraft] = useState<DraftQuiz>(emptyDraft);
    const [baseline, setBaseline] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [locked, setLocked] = useState(false);
    const [closedAt, setClosedAt] = useState<string | null>(null);
    const [batches, setBatches] = useState<BatchOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);

    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [showIssues, setShowIssues] = useState(false);
    const [saving, setSaving] = useState<null | 'draft' | 'publish'>(null);
    const [aiOpen, setAiOpen] = useState(false);
    const [listening, setListening] = useState<{ blockKey: string | null } | null>(null);
    const [scrollTo, setScrollTo] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    const isNew = !quizId;
    const snapshot = useCallback((d: DraftQuiz) => JSON.stringify(toPayload(d, tz, 'draft')), [tz]);
    const dirty = !loading && !loadError && baseline !== '' && snapshot(draft) !== baseline;

    /* ── Load ── */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const sourceId = quizId || duplicateOf;
                const [bRes, qRes] = await Promise.all([apiCall('/batches'), sourceId ? apiCall(`/quizzes/${sourceId}`) : Promise.resolve(null)]);
                const bData = bRes.ok ? await bRes.json() : [];
                const options: BatchOption[] = (Array.isArray(bData) ? bData : bData?.batches || [])
                    .map((b: any) => ({ id: Number(b.id), name: b.name, level: b.french_level || '', students: Number(b.student_count) || 0 }))
                    .sort((a: BatchOption, b: BatchOption) => a.name.localeCompare(b.name));

                let next = emptyDraft();
                let nextStatus: 'draft' | 'published' = 'draft';
                let nextLocked = false;
                let nextClosed: string | null = null;
                if (qRes) {
                    const qData = await qRes.json().catch(() => ({}));
                    if (!qRes.ok) throw new Error(qData?.error || 'The quiz could not be loaded.');
                    next = draftFromApi(qData, tz);
                    if (duplicateOf) {
                        next = duplicateDraft(next);
                    } else {
                        nextStatus = qData.status === 'published' ? 'published' : 'draft';
                        if (nextStatus === 'published' && qData.end_date && Date.parse(qData.end_date) <= Date.now()) {
                            nextLocked = true;
                            nextClosed = qData.end_date;
                        }
                    }
                } else if (options.length === 1) {
                    next.batchIds = [options[0].id];
                }
                if (cancelled) return;
                setBatches(options);
                setDraft(next);
                setBaseline(snapshot(next));
                setStatus(nextStatus);
                setLocked(nextLocked);
                setClosedAt(nextClosed);
                if (startWithAI && !sourceId) setAiOpen(true);
            } catch (e: any) {
                if (!cancelled) setLoadError(e?.message || 'The quiz could not be loaded.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
        // Loads once per open (and on retry); tz/snapshot are stable for the session.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId, duplicateOf, attempt]);

    useEffect(() => {
        if (!scrollTo) return;
        const id = window.requestAnimationFrame(() => {
            document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setScrollTo(null);
        });
        return () => window.cancelAnimationFrame(id);
    }, [scrollTo, draft.blocks]);

    /* ── Block operations (stable callbacks, functional updates) ── */
    const setBlocks = useCallback((fn: (blocks: Block[]) => Block[]) => setDraft(d => ({ ...d, blocks: fn(d.blocks) })), []);

    const patchQuestion = useCallback((key: string, fn: (q: DraftQuestion) => DraftQuestion) => setBlocks(bs => bs.map(b => {
        if (b.kind === 'question') return b.question.key === key ? { ...b, question: fn(b.question) } : b;
        return b.questions.some(q => q.key === key) ? { ...b, questions: b.questions.map(q => (q.key === key ? fn(q) : q)) } : b;
    })), [setBlocks]);

    const removeQuestion = useCallback((key: string) => {
        setBlocks(bs => bs
            .filter(b => !(b.kind === 'question' && b.question.key === key))
            .map(b => (b.kind === 'listening' && b.questions.some(q => q.key === key) ? { ...b, questions: b.questions.filter(q => q.key !== key) } : b)));
        setEditingKey(k => (k === key ? null : k));
    }, [setBlocks]);

    const copyOf = (q: DraftQuestion): DraftQuestion => ({ ...q, key: uid('q'), id: undefined, options: q.options.map(o => ({ ...o, key: uid('o'), id: undefined })) });

    // The copy is built once, outside the state updater: updaters must stay pure (React may run them twice).
    const draftRef = useRef(draft);
    draftRef.current = draft;
    const duplicateQuestion = useCallback((key: string) => {
        const source = allQuestions(draftRef.current.blocks).find(q => q.key === key);
        if (!source) return;
        const created = copyOf(source);
        setBlocks(bs => bs.flatMap<Block>(b => {
            if (b.kind === 'question') return b.question.key === key ? [b, { kind: 'question', key: created.key, question: created }] : [b];
            const i = b.questions.findIndex(q => q.key === key);
            if (i < 0) return [b];
            const questions = [...b.questions];
            questions.splice(i + 1, 0, created);
            return [{ ...b, questions }];
        }));
        setEditingKey(created.key);
        setScrollTo(`qz-q-${created.key}`);
    }, [setBlocks]);

    const moveBlock = useCallback<Mover>((key, dir) => setBlocks(bs => {
        const i = bs.findIndex(b => (b.kind === 'question' ? b.question.key === key : b.key === key));
        const j = i + dir;
        if (i < 0 || j < 0 || j >= bs.length) return bs;
        const out = [...bs];
        [out[i], out[j]] = [out[j], out[i]];
        return out;
    }), [setBlocks]);

    const moveInSection = useCallback<Mover>((key, dir) => setBlocks(bs => bs.map(b => {
        if (b.kind !== 'listening') return b;
        const i = b.questions.findIndex(q => q.key === key);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= b.questions.length) return b;
        const questions = [...b.questions];
        [questions[i], questions[j]] = [questions[j], questions[i]];
        return { ...b, questions };
    })), [setBlocks]);

    const lastPoints = () => {
        const qs = allQuestions(draft.blocks);
        return qs.length ? Number(qs[qs.length - 1].points) || 1 : 1;
    };

    const addQuestion = (type: QuestionType = 'mcq_single') => {
        const q = newQuestion(type, lastPoints());
        setBlocks(bs => [...bs, { kind: 'question', key: q.key, question: q }]);
        setEditingKey(q.key);
        setScrollTo(`qz-q-${q.key}`);
    };

    const addToSection = useCallback((blockKey: string) => {
        const q = newQuestion('mcq_single', 1);
        setBlocks(bs => bs.map(b => (b.kind === 'listening' && b.key === blockKey ? { ...b, questions: [...b.questions, q] } : b)));
        setEditingKey(q.key);
        setScrollTo(`qz-q-${q.key}`);
    }, [setBlocks]);

    const removeSection = useCallback((blockKey: string) => setBlocks(bs => bs.filter(b => b.key !== blockKey)), [setBlocks]);
    const editAudio = useCallback((blockKey: string) => setListening({ blockKey }), []);

    const setAllPoints = (points: number) => {
        setBlocks(bs => bs.map(b => (b.kind === 'question' ? { ...b, question: { ...b.question, points } } : { ...b, questions: b.questions.map(q => ({ ...q, points })) })));
    };

    const cardHandlers = useMemo(() => ({ onPatch: patchQuestion, onEdit: setEditingKey, onDuplicate: duplicateQuestion, onRemove: removeQuestion }), [patchQuestion, duplicateQuestion, removeQuestion]);

    /* ── AI + listening results ── */
    const addGenerated = (questions: DraftQuestion[], meta: { title?: string; description?: string }) => {
        if (!questions.length) return;
        setDraft(d => ({
            ...d,
            title: d.title.trim() ? d.title : meta.title || d.title,
            description: d.description.trim() ? d.description : meta.description || d.description,
            blocks: [...d.blocks, ...questions.map(q => ({ kind: 'question' as const, key: q.key, question: q }))],
        }));
        setAiOpen(false);
        setScrollTo(`qz-q-${questions[0].key}`);
        msg.success(`${plural(questions.length, 'question')} added — review them before publishing`);
    };

    const saveListening = (clip: DraftClip, generated: DraftQuestion[]) => {
        const target = listening?.blockKey;
        if (target) {
            setBlocks(bs => bs.map(b => (b.kind === 'listening' && b.key === target ? { ...b, clip, questions: [...b.questions, ...generated] } : b)));
            if (generated.length) msg.success(`${plural(generated.length, 'question')} added to the section`);
        } else {
            const questions = generated.length ? generated : [newQuestion('mcq_single', 1)];
            const block: Block = { kind: 'listening', key: uid('b'), clip, questions };
            setBlocks(bs => [...bs, block]);
            if (!generated.length) setEditingKey(questions[0].key);
            setScrollTo(`qz-b-${block.key}`);
        }
        setListening(null);
    };

    /* ── Validation + save ── */
    const publishIssues = useMemo(() => validateDraft(draft, { publishing: true, isNew, tz }), [draft, isNew, tz]);

    const jumpTo = (issue: Issue) => {
        if (!issue.target) return;
        const qKey = issue.target.startsWith('qz-q-') ? issue.target.slice(5) : null;
        if (qKey) setEditingKey(qKey);
        setScrollTo(issue.target);
    };

    const save = async (intent: 'draft' | 'publish') => {
        if (locked || saving) return;
        const publishing = intent === 'publish';
        const found = validateDraft(draft, { publishing, isNew, tz });
        if (found.length) {
            setShowIssues(true);
            jumpTo(found[0]);
            msg.error(found.length === 1 ? found[0].message : `${found.length} things need fixing first — see the checklist.`);
            return;
        }
        setSaving(intent);
        const finalStatus = publishing ? 'published' : 'draft';
        const body = JSON.stringify(toPayload(draft, tz, finalStatus));
        try {
            if (quizId) {
                const res = await apiCall(`/quizzes/${quizId}`, { method: 'PUT', body });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(apiError(data, 'The quiz could not be saved.'));
                setBaseline(snapshot(draft));
                onSaved({ id: quizId, created: false, published: finalStatus === 'published', notified: Number(data?.notified) || 0, regraded: Number(data?.regraded) || 0 });
                return;
            }
            const res = await apiCall('/quizzes', { method: 'POST', body });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(apiError(data, 'The quiz could not be created.'));
            const id = Number(data?.quiz?.id);
            setBaseline(snapshot(draft));
            let notified = 0;
            let published = false;
            if (publishing && id) {
                // The quiz exists now; whatever happens next, don't let a second click create it twice.
                const pub = await apiCall(`/quizzes/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'published' }) });
                const pubData = await pub.json().catch(() => ({}));
                if (pub.ok) { published = true; notified = Number(pubData?.notified) || 0; }
                else msg.warning(`Saved as a draft, but publishing failed: ${pubData?.error || 'unknown error'}. Publish it from the list.`);
            }
            onSaved({ id, created: true, published, notified, regraded: 0 });
        } catch (e: any) {
            msg.error(e?.message || 'The quiz could not be saved.');
        } finally {
            setSaving(null);
        }
    };

    const moveToDraft = () => {
        modal.confirm({
            title: 'Move this quiz back to drafts?',
            icon: <WarningOutlined />,
            content: context?.in_progress_students
                ? `${plural(context.in_progress_students, 'student is', 'students are')} taking it right now and will lose access. Submitted work is kept.`
                : 'Students will no longer see it until you publish it again. Submitted work is kept.',
            okText: 'Save as draft',
            onOk: () => save('draft'),
        });
    };

    const requestClose = () => {
        if (saving) return;
        if (!dirty) { onClose(); return; }
        modal.confirm({
            title: 'Discard your changes?',
            icon: <ExclamationCircleOutlined />,
            content: 'You have changes that are not saved yet.',
            okText: 'Discard',
            okButtonProps: { danger: true },
            cancelText: 'Keep editing',
            onOk: onClose,
        });
    };

    // Ctrl/Cmd + S saves without leaving the builder's current state.
    const saveRef = useRef(save);
    saveRef.current = save;
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                saveRef.current(status === 'published' ? 'publish' : 'draft');
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [status]);

    /* ── Derived summary ── */
    const questions = allQuestions(draft.blocks);
    const points = totalPoints(draft.blocks);
    const typeCounts = (Object.keys(TYPE_META) as QuestionType[]).map(t => ({ type: t, count: questions.filter(q => q.type === t).length }));
    const sections = draft.blocks.filter(b => b.kind === 'listening').length;
    const secondsPerQuestion = questions.length ? (draft.duration * 60) / questions.length : null;
    const selectedStudents = batches.filter(b => draft.batchIds.includes(b.id)).reduce((s, b) => s + b.students, 0);

    const hasWindow = draft.start !== null || draft.end !== null;
    const nowWall = () => {
        const wall = isoToWall(new Date(Math.ceil(Date.now() / 300_000) * 300_000).toISOString(), tz) as string;
        return dayjs(wall);
    };
    const windowPresets = useMemo(() => {
        const start = nowWall();
        const tomorrow = start.add(1, 'day').hour(9).minute(0);
        return [
            { label: 'Next 24 hours', value: [start, start.add(1, 'day')] as [Dayjs, Dayjs] },
            { label: 'Next 3 days', value: [start, start.add(3, 'day')] as [Dayjs, Dayjs] },
            { label: 'Next 7 days', value: [start, start.add(7, 'day')] as [Dayjs, Dayjs] },
            { label: 'Tomorrow 9:00–18:00', value: [tomorrow, tomorrow.hour(18)] as [Dayjs, Dayjs] },
        ];
        // presets are computed when the builder opens
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tz]);
    const windowSummary = (() => {
        if (!draft.start || !draft.end) return null;
        const s = wallToIso(draft.start, tz);
        const e = wallToIso(draft.end, tz);
        if (!s || !e) return null;
        const hours = (Date.parse(e) - Date.parse(s)) / 3_600_000;
        const length = hours >= 48 ? `${Math.round(hours / 24)} days` : `${Math.round(hours * 10) / 10} h`;
        return `Opens ${when.at(s)} · closes ${when.at(e)} · ${length}`;
    })();

    const primaryLabel = status === 'published' ? 'Save changes' : 'Publish';
    const heading = duplicateOf ? 'Copy of a quiz' : isNew ? 'New quiz' : status === 'published' ? 'Editing a published quiz' : 'Editing a draft';

    let questionNumber = 0;

    return (
        <Drawer open placement="right" width="100%" closable={false} title={null} footer={null} onClose={requestClose} keyboard={!saving}
            rootClassName="tc-drawer qz-studio-drawer" styles={{ body: { padding: 0 } }} destroyOnHidden>
            <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
                {msgHolder}{modalHolder}
                <div className="qz-studio" aria-busy={!!saving}>
                    {/* ── Top bar ── */}
                    <header className="qz-studio-bar">
                        <Tooltip title="Close"><Button type="text" icon={<CloseOutlined />} onClick={requestClose} aria-label="Close builder" disabled={!!saving} /></Tooltip>
                        <div className="qz-studio-id">
                            <span className="qz-eyebrow">{heading}</span>
                            <strong>{draft.title.trim() || 'Untitled quiz'}</strong>
                        </div>
                        {!loading && !loadError && (
                            <span className={`qz-save-state${dirty ? ' is-dirty' : ''}`}>
                                {locked ? <><LockOutlined /> Read only</> : saving ? <><LoadingOutlined /> Saving…</> : dirty ? 'Unsaved changes' : isNew && !duplicateOf ? 'Not saved yet' : 'No unsaved changes'}
                            </span>
                        )}
                        <div className="qz-studio-actions">
                            {!loading && !loadError && !locked && (
                                <>
                                    {status === 'published'
                                        ? <Button onClick={moveToDraft} disabled={!!saving}>{r.isMobile ? 'To draft' : 'Move to draft'}</Button>
                                        : <Button onClick={() => save('draft')} loading={saving === 'draft'} disabled={!!saving && saving !== 'draft'}>{r.isMobile ? 'Save' : 'Save draft'}</Button>}
                                    <Button type="primary" onClick={() => save('publish')} loading={saving === 'publish'} disabled={!!saving && saving !== 'publish'}>{primaryLabel}</Button>
                                </>
                            )}
                        </div>
                    </header>

                    {loading ? (
                        <div className="qz-studio-body">
                            <main className="qz-studio-main"><div className="qz-panel"><Skeleton active paragraph={{ rows: 4 }} /></div><div className="qz-panel"><Skeleton active paragraph={{ rows: 8 }} /></div></main>
                            <aside className="qz-studio-side"><div className="qz-panel"><Skeleton active paragraph={{ rows: 6 }} /></div></aside>
                        </div>
                    ) : loadError ? (
                        <div className="qz-studio-error">
                            <WarningOutlined />
                            <strong>This quiz couldn't be opened</strong>
                            <span>{loadError}</span>
                            <div><Button onClick={onClose}>Close</Button> <Button type="primary" onClick={() => setAttempt(a => a + 1)}>Try again</Button></div>
                        </div>
                    ) : (
                        <ConfigProvider componentDisabled={locked || !!saving}>
                            <div className="qz-studio-body">
                                <main className="qz-studio-main">
                                    {locked && (
                                        <div className="qz-notice is-locked">
                                            <LockOutlined />
                                            <span><strong>This quiz closed {closedAt ? when.at(closedAt) : ''}.</strong> Its questions and answers can no longer be changed. Use <em>Duplicate</em> from the quiz list to reuse them.</span>
                                        </div>
                                    )}
                                    {!locked && status === 'published' && context && (context.submitted_students > 0 || context.in_progress_students > 0) && (
                                        <div className="qz-notice">
                                            <InfoCircleOutlined />
                                            <span>
                                                <strong>{context.submitted_students > 0 ? `${plural(context.submitted_students, 'student has', 'students have')} already submitted.` : `${plural(context.in_progress_students, 'student is', 'students are')} taking this quiz now.`}</strong>{' '}
                                                Rewording is safe. Changing a correct answer or points recalculates everyone’s score when you save; deleting a question also deletes the answers to it.
                                            </span>
                                        </div>
                                    )}

                                    {/* Details */}
                                    <section className="qz-panel qz-details">
                                        <Input id="qz-field-title" className="qz-title-input" variant="borderless" placeholder="Quiz title" maxLength={200}
                                            value={draft.title} status={showIssues && !draft.title.trim() ? 'error' : undefined}
                                            onChange={e => { const title = e.target.value; setDraft(d => ({ ...d, title })); }} aria-label="Quiz title" />
                                        <Input.TextArea className="qz-desc-input" variant="borderless" autoSize={{ minRows: 1, maxRows: 6 }} maxLength={2000}
                                            placeholder="Short description — what does this quiz cover?" value={draft.description}
                                            onChange={e => { const description = e.target.value; setDraft(d => ({ ...d, description })); }} aria-label="Description" />
                                        {showInstructions || draft.instructions ? (
                                            <div className="qz-field">
                                                <label htmlFor="qz-field-instructions">Instructions for students <em>shown before they start</em></label>
                                                <Input.TextArea id="qz-field-instructions" autoSize={{ minRows: 2, maxRows: 8 }} maxLength={2000}
                                                    placeholder="E.g. No dictionaries. Answer every question — there is no penalty for guessing on single-choice questions."
                                                    value={draft.instructions} onChange={e => { const instructions = e.target.value; setDraft(d => ({ ...d, instructions })); }} />
                                            </div>
                                        ) : (
                                            <Button type="link" size="small" className="qz-link-btn" icon={<PlusOutlined />} onClick={() => setShowInstructions(true)}>Add instructions for students</Button>
                                        )}
                                    </section>

                                    {/* Questions */}
                                    <section id="qz-questions" className="qz-panel qz-questions">
                                        <header className="qz-panel-head">
                                            <h3>Questions <span className="tc-count">{questions.length}</span></h3>
                                            <span className="qz-panel-meta">{fmtNumber(points)} points{sections ? ` · ${plural(sections, 'listening section')}` : ''}</span>
                                            {questions.length > 1 && !locked && (
                                                <PointsPopover onApply={setAllPoints} />
                                            )}
                                        </header>

                                        {draft.blocks.length === 0 ? (
                                            <div className="qz-start">
                                                <p>How do you want to start?</p>
                                                <div className="qz-start-grid">
                                                    <button type="button" className="qz-start-card" onClick={() => addQuestion()} disabled={locked}>
                                                        <span className="qz-start-ic"><EditOutlined /></span>
                                                        <strong>Write a question</strong>
                                                        <em>Single choice, multiple choice or yes/no.</em>
                                                    </button>
                                                    <button type="button" className="qz-start-card is-ai" onClick={() => setAiOpen(true)} disabled={locked}>
                                                        <span className="qz-start-ic"><ThunderboltOutlined /></span>
                                                        <strong>Generate with AI</strong>
                                                        <em>Describe the topic and level; review before adding.</em>
                                                    </button>
                                                    <button type="button" className="qz-start-card is-audio" onClick={() => setListening({ blockKey: null })} disabled={locked}>
                                                        <span className="qz-start-ic"><SoundOutlined /></span>
                                                        <strong>Listening section</strong>
                                                        <em>Generated voice or your own recording.</em>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="qz-blocks">
                                                {draft.blocks.map((b, i) => {
                                                    const first = i === 0;
                                                    const last = i === draft.blocks.length - 1;
                                                    if (b.kind === 'question') {
                                                        questionNumber += 1;
                                                        return (
                                                            <QuestionCard key={b.key} q={b.question} number={questionNumber} editing={editingKey === b.question.key}
                                                                showIssues={showIssues} first={first} last={last} locked={locked} onMove={moveBlock} {...cardHandlers} />
                                                        );
                                                    }
                                                    const start = questionNumber + 1;
                                                    questionNumber += b.questions.length;
                                                    return (
                                                        <ListeningSection key={b.key} block={b} startNumber={start} editingKey={editingKey} showIssues={showIssues}
                                                            first={first} last={last} locked={locked} apiCall={apiCall} onEditAudio={editAudio} onRemove={removeSection}
                                                            onMoveBlock={moveBlock} onAddQuestion={addToSection} card={cardHandlers} onMoveQuestion={moveInSection} />
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {draft.blocks.length > 0 && !locked && (
                                            <div className="qz-add-bar">
                                                <Button icon={<PlusOutlined />} onClick={() => addQuestion()}>Question</Button>
                                                <Button icon={<ThunderboltOutlined />} onClick={() => setAiOpen(true)}>Generate with AI</Button>
                                                <Button icon={<SoundOutlined />} onClick={() => setListening({ blockKey: null })}>Listening section</Button>
                                            </div>
                                        )}
                                    </section>
                                </main>

                                <aside className="qz-studio-side">
                                    {/* Audience */}
                                    <section className="qz-panel" id="qz-field-batches">
                                        <h3 className="qz-side-title">Who takes it</h3>
                                        <Select mode="multiple" className="qz-block-select" placeholder="Choose batches" value={draft.batchIds}
                                            status={showIssues && !draft.batchIds.length ? 'error' : undefined} optionFilterProp="label" maxTagCount="responsive"
                                            onChange={batchIds => setDraft(d => ({ ...d, batchIds }))}
                                            options={batches.map(b => ({ value: b.id, label: b.name, level: b.level, students: b.students }))}
                                            optionRender={o => (
                                                <span className="qz-batch-opt"><span>{o.data.label}</span><em>{[o.data.level, plural(o.data.students, 'student')].filter(Boolean).join(' · ')}</em></span>
                                            )}
                                            notFoundContent={<span className="qz-hint">No batches are assigned to you yet.</span>} />
                                        <p className="qz-hint">{draft.batchIds.length ? `${plural(selectedStudents, 'student')} will see it once it is published.` : 'Only students in the selected batches can see the quiz.'}</p>
                                    </section>

                                    {/* Availability + time limit */}
                                    <section className="qz-panel" id="qz-field-schedule">
                                        <h3 className="qz-side-title">Availability</h3>
                                        <Segmented block value={hasWindow ? 'window' : 'open'} options={[{ value: 'open', label: 'As soon as published' }, { value: 'window', label: 'Set a window' }]}
                                            onChange={v => {
                                                if (v === 'open') setDraft(d => ({ ...d, start: null, end: null }));
                                                else { const [s, e] = windowPresets[2].value; setDraft(d => ({ ...d, start: s.format(WALL), end: e.format(WALL) })); }
                                            }} />
                                        {hasWindow ? (
                                            <>
                                                <DatePicker.RangePicker className="qz-range" showTime={{ format: 'HH:mm', minuteStep: 5 }} format="MMM D, YYYY  HH:mm"
                                                    allowClear={false} presets={windowPresets} placeholder={['Opens', 'Closes']}
                                                    value={[draft.start ? dayjs(draft.start) : null, draft.end ? dayjs(draft.end) : null]}
                                                    onChange={v => setDraft(d => ({ ...d, start: v?.[0] ? v[0].format(WALL) : null, end: v?.[1] ? v[1].format(WALL) : null }))}
                                                    status={showIssues && publishIssues.some(i => i.area === 'schedule') ? 'error' : undefined}
                                                    getPopupContainer={trigger => trigger.parentElement || document.body} />
                                                {windowSummary && <p className="qz-window">{windowSummary}</p>}
                                            </>
                                        ) : (
                                            <p className="qz-hint">Students can start it any time after you publish, until you move it back to drafts.</p>
                                        )}
                                        {showIssues && publishIssues.filter(i => i.area === 'schedule').map(i => <p key={i.message} className="qz-q-issue"><ExclamationCircleOutlined /> {i.message}</p>)}
                                        <p className="qz-hint">Times are in {tzText}, your profile time zone. Each student sees them in their own zone.</p>

                                        <div className="qz-field" id="qz-field-duration">
                                            <label htmlFor="qz-duration">Time limit</label>
                                            <div className="qz-duration">
                                                <InputNumber id="qz-duration" min={1} max={600} value={draft.duration} addonAfter="min"
                                                    onChange={v => setDraft(d => ({ ...d, duration: Number(v) || 0 }))} />
                                                <span className="qz-chips">
                                                    {DURATION_CHIPS.map(m => (
                                                        <button key={m} type="button" className={`qz-chip is-btn${draft.duration === m ? ' is-on' : ''}`} onClick={() => setDraft(d => ({ ...d, duration: m }))}>{m}</button>
                                                    ))}
                                                </span>
                                            </div>
                                            {secondsPerQuestion !== null && (
                                                <p className={`qz-hint${secondsPerQuestion < 20 ? ' is-warn' : ''}`}>
                                                    About {secondsPerQuestion >= 90 ? `${Math.round(secondsPerQuestion / 6) / 10} min` : `${Math.round(secondsPerQuestion)} s`} per question
                                                    {secondsPerQuestion < 20 ? ' — that is very tight.' : '.'} The quiz submits itself when time runs out.
                                                </p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Delivery */}
                                    <section className="qz-panel">
                                        <h3 className="qz-side-title">Delivery</h3>
                                        <label className="qz-switch">
                                            <span><strong>Shuffle questions</strong><em>Each student gets a different order.</em></span>
                                            <Switch checked={draft.shuffleQuestions} onChange={shuffleQuestions => setDraft(d => ({ ...d, shuffleQuestions }))} />
                                        </label>
                                        <label className="qz-switch">
                                            <span><strong>Shuffle answer options</strong><em>Makes copying from a neighbour harder.</em></span>
                                            <Switch checked={draft.shuffleOptions} onChange={shuffleOptions => setDraft(d => ({ ...d, shuffleOptions }))} />
                                        </label>
                                    </section>

                                    {/* Summary + readiness */}
                                    <section className="qz-panel qz-summary">
                                        <h3 className="qz-side-title">Summary</h3>
                                        <dl className="qz-facts">
                                            <div><dt>Questions</dt><dd>{questions.length}</dd></div>
                                            <div><dt>Points</dt><dd>{fmtNumber(points)}</dd></div>
                                            <div><dt>Time limit</dt><dd>{draft.duration || '—'} min</dd></div>
                                        </dl>
                                        {questions.length > 0 && (
                                            <ul className="qz-mix">
                                                {typeCounts.filter(t => t.count).map(t => (
                                                    <li key={t.type}><span>{TYPE_META[t.type].label}</span><span className="qz-mix-bar"><i style={{ width: `${(t.count / questions.length) * 100}%` }} /></span><b>{t.count}</b></li>
                                                ))}
                                                {sections > 0 && <li><span>Listening sections</span><span className="qz-mix-bar is-audio"><i style={{ width: '100%' }} /></span><b>{sections}</b></li>}
                                            </ul>
                                        )}
                                        {locked ? null : publishIssues.length === 0 ? (
                                            <p className="qz-ready"><CheckCircleFilled /> Ready to {status === 'published' ? 'save' : 'publish'}</p>
                                        ) : (
                                            <div className="qz-checklist">
                                                <span>Before {status === 'published' ? 'saving' : 'publishing'}</span>
                                                <ul>
                                                    {publishIssues.slice(0, 6).map((issue, i) => (
                                                        <li key={`${issue.target}-${i}`}>
                                                            <button type="button" onClick={() => { setShowIssues(true); jumpTo(issue); }}><ExclamationCircleOutlined /> {issue.message}</button>
                                                        </li>
                                                    ))}
                                                    {publishIssues.length > 6 && <li className="qz-hint">and {publishIssues.length - 6} more</li>}
                                                </ul>
                                            </div>
                                        )}
                                        {!r.isMobile && !locked && <p className="qz-hint qz-kbd">Tip: press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.</p>}
                                    </section>
                                </aside>
                            </div>
                        </ConfigProvider>
                    )}
                </div>

                {aiOpen && <AIQuizGenerator open onClose={() => setAiOpen(false)} onAdd={addGenerated} defaultPoints={lastPoints()} />}
                {listening && (
                    <AudioQuestionModal
                        open
                        quizTitle={draft.title}
                        clip={listening.blockKey ? (draft.blocks.find(b => b.kind === 'listening' && b.key === listening.blockKey) as Extract<Block, { kind: 'listening' }> | undefined)?.clip ?? null : null}
                        onClose={() => setListening(null)}
                        onSave={saveListening}
                    />
                )}
            </ConfigProvider>
        </Drawer>
    );
};

/* ─────────────── "Set all points" ─────────────── */
const PointsPopover: React.FC<{ onApply: (points: number) => void }> = ({ onApply }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<number>(1);
    return (
        <Popover open={open} onOpenChange={setOpen} trigger="click" placement="bottomRight" title="Same points for every question"
            content={(
                <div className="qz-points-pop">
                    <InputNumber min={0.5} max={100} step={0.5} value={value} onChange={v => setValue(Number(v) || 1)} addonAfter="pts" />
                    <Button type="primary" size="small" onClick={() => { onApply(value); setOpen(false); }}>Apply</Button>
                </div>
            )}>
            <Button size="small" type="text" className="qz-panel-tool">Set all points</Button>
        </Popover>
    );
};

export default QuizBuilder;
