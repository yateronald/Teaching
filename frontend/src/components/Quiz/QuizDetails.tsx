import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Skeleton, Switch } from 'antd';
import {
    CheckOutlined, CloseOutlined, EditOutlined, InfoCircleOutlined, LoadingOutlined, SoundOutlined, TeamOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import { TYPE_META, allQuestions, draftFromApi, fmtNumber, liveStateOf, makeWhen, plural, STATE_META, totalPoints, wallToIso } from './quizModel';
import type { Block, DraftQuestion, DraftQuiz, QuizRow } from './quizModel';
import '../Teacher/Teacher.css';
import './Quiz.css';

/* ══════════════════════════════════════════
   QUIZ PREVIEW — the paper as students get it, with the answer key on top.
══════════════════════════════════════════ */

interface Props {
    quiz: QuizRow | null;
    onClose: () => void;
    onEdit: (row: QuizRow) => void;
    onResults: (row: QuizRow) => void;
    canEdit: (row: QuizRow) => boolean;
}

const LETTERS = 'ABCDEFGHIJ';

/** Loads a clip only when the teacher asks to hear it. */
export const ClipPlayer: React.FC<{ clipId: number }> = ({ clipId }) => {
    const { apiCall } = useAuth();
    const [url, setUrl] = useState<string | null>(null);
    const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
    const urlRef = useRef<string | null>(null);
    useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

    const load = async () => {
        setState('loading');
        try {
            const res = await apiCall(`/quizzes/audio/${clipId}/stream`);
            if (!res.ok) throw new Error();
            const next = URL.createObjectURL(await res.blob());
            urlRef.current = next;
            setUrl(next);
            setState('idle');
        } catch {
            setState('error');
        }
    };

    if (url) return <audio className="qz-clip-audio" controls controlsList="nodownload" src={url} autoPlay />;
    return (
        <Button size="small" icon={state === 'loading' ? <LoadingOutlined /> : <SoundOutlined />} onClick={load} disabled={state === 'loading'}>
            {state === 'error' ? 'Audio unavailable — retry' : 'Play audio'}
        </Button>
    );
};

const PaperQuestion: React.FC<{ q: DraftQuestion; n: number; answers: boolean }> = ({ q, n, answers }) => (
    <li className="qz-paper-q">
        <div className="qz-q-head is-plain">
            <span className="qz-q-num">{n}</span>
            <span className="qz-q-type">{TYPE_META[q.type].short}</span>
            <span className="qz-q-pts">{fmtNumber(q.points)} {Number(q.points) === 1 ? 'pt' : 'pts'}</span>
        </div>
        <p className="qz-q-text">{q.text}</p>
        {q.type === 'yes_no' ? (
            <div className="qz-yn is-view">
                {(['yes', 'no'] as const).map(v => (
                    <span key={v} className={`qz-yn-opt${answers && q.answer === v ? ' is-correct' : ''}`}>{answers && q.answer === v && <CheckOutlined />}{v === 'yes' ? 'Yes' : 'No'}</span>
                ))}
            </div>
        ) : (
            <ul className="qz-opts is-view">
                {q.options.map((o, i) => (
                    <li key={o.key} className={answers && o.correct ? 'is-correct' : undefined}>
                        <span className="qz-opt-letter">{answers && o.correct ? <CheckOutlined /> : LETTERS[i]}</span><span>{o.text}</span>
                    </li>
                ))}
                {q.type === 'mcq_multiple' && <li className="qz-opts-note">Students can select several answers.</li>}
            </ul>
        )}
        {answers && q.explanation && <p className="qz-q-explain"><InfoCircleOutlined /> {q.explanation}</p>}
    </li>
);

const QuizDetails: React.FC<Props> = ({ quiz, onClose, onEdit, onResults, canEdit }) => {
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const tz = resolveTimezone(user?.timezone);
    const when = useMemo(() => makeWhen(tz), [tz]);

    const [draft, setDraft] = useState<DraftQuiz | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [answers, setAnswers] = useState(true);
    const [attempt, setAttempt] = useState(0);
    const [showTranscript, setShowTranscript] = useState<Set<string>>(new Set());

    const id = quiz?.id ?? null;
    useEffect(() => {
        if (id === null) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        setDraft(null);
        setShowTranscript(new Set());
        apiCall(`/quizzes/${id}`)
            .then(async res => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || 'The quiz could not be loaded.');
                if (!cancelled) setDraft(draftFromApi(data, tz));
            })
            .catch(e => { if (!cancelled) setError(e?.message || 'The quiz could not be loaded.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // tz is stable for the session
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, attempt, apiCall]);

    const state = quiz ? liveStateOf(quiz, 0).state : 'draft';
    const questions = draft ? allQuestions(draft.blocks) : [];
    let n = 0;

    const renderBlock = (b: Block) => {
        if (b.kind === 'question') { n += 1; return <PaperQuestion key={b.key} q={b.question} n={n} answers={answers} />; }
        const open = showTranscript.has(b.key);
        const items = b.questions.map(q => { n += 1; return <PaperQuestion key={q.key} q={q} n={n} answers={answers} />; });
        return (
            <li key={b.key} className="qz-paper-listen">
                <div className="qz-paper-listen-head">
                    <span className="qz-listen-ic"><SoundOutlined /></span>
                    <div className="qz-listen-id">
                        <strong>Listening · {plural(b.questions.length, 'question')}</strong>
                        <em>{[b.clip.durationSeconds ? `${Math.round(b.clip.durationSeconds)} s` : null, b.clip.maxPlays ? `max ${b.clip.maxPlays} ${b.clip.maxPlays === 1 ? 'play' : 'plays'}` : 'unlimited plays'].filter(Boolean).join(' · ')}</em>
                    </div>
                    {b.clip.id ? <ClipPlayer clipId={b.clip.id} /> : null}
                </div>
                {b.clip.transcript && (
                    <div className="qz-paper-transcript">
                        <button type="button" className="qz-link" onClick={() => setShowTranscript(s => { const next = new Set(s); if (next.has(b.key)) next.delete(b.key); else next.add(b.key); return next; })}>
                            {open ? 'Hide transcript' : 'Show transcript'} <em>students don’t see it</em>
                        </button>
                        {open && <p>{b.clip.transcript}</p>}
                    </div>
                )}
                <ol className="qz-paper-list is-nested">{items}</ol>
            </li>
        );
    };

    const windowText = draft && (draft.start || draft.end)
        ? `${draft.start ? when.at(wallToIso(draft.start, tz)) : 'On publish'} → ${draft.end ? when.at(wallToIso(draft.end, tz)) : 'no end'}`
        : 'As soon as it is published';

    return (
        <Drawer open={!!quiz} onClose={onClose} placement="right" width={r.isMobile ? '100%' : Math.min(860, r.width - 48)} destroyOnHidden
            rootClassName="tc-drawer qz-drawer" closeIcon={<CloseOutlined />}
            title={<span className="tc-dtitle"><strong>{quiz?.title}</strong><em>Preview & answer key</em></span>}
            extra={quiz && (
                <span className="qz-drawer-actions">
                    {state !== 'draft' && <Button size="small" icon={<TeamOutlined />} onClick={() => onResults(quiz)}>{r.isMobile ? '' : 'Results'}</Button>}
                    {canEdit(quiz) && <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => onEdit(quiz)}>{r.isMobile ? '' : 'Edit'}</Button>}
                </span>
            )}>
            {loading ? (
                <div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 10 }} /></div>
            ) : error ? (
                <div className="tc-alert" role="alert"><WarningOutlined /><span>{error}</span><Button size="small" onClick={() => setAttempt(a => a + 1)}>Retry</Button></div>
            ) : draft && quiz && (
                <>
                    <section className="tc-card qz-paper-head">
                        <div className="qz-paper-title">
                            <span className={`qz-state is-${state}`}><i aria-hidden />{STATE_META[state].label}</span>
                            {draft.description && <p>{draft.description}</p>}
                        </div>
                        <dl className="qz-facts is-wide">
                            <div><dt>Questions</dt><dd>{questions.length}</dd></div>
                            <div><dt>Points</dt><dd>{fmtNumber(totalPoints(draft.blocks))}</dd></div>
                            <div><dt>Time limit</dt><dd>{draft.duration} min</dd></div>
                            <div className="is-span"><dt>Available</dt><dd>{windowText} <em className="qz-muted">{timezoneLabel(user?.timezone)}</em></dd></div>
                            <div className="is-span"><dt>Batches</dt><dd>{quiz.batches.join(', ') || '—'}</dd></div>
                            <div className="is-span"><dt>Delivery</dt><dd>{[draft.shuffleQuestions ? 'Questions shuffled' : 'Fixed question order', draft.shuffleOptions ? 'options shuffled' : 'fixed option order'].join(' · ')}</dd></div>
                        </dl>
                        {draft.instructions && (
                            <div className="qz-instructions"><strong>Instructions for students</strong><p>{draft.instructions}</p></div>
                        )}
                    </section>

                    <section className="tc-card qz-paper">
                        <header className="qz-panel-head">
                            <h3>Questions <span className="tc-count">{questions.length}</span></h3>
                            <label className="qz-inline-switch"><Switch size="small" checked={answers} onChange={setAnswers} /> Show answers</label>
                        </header>
                        {draft.blocks.length === 0
                            ? <p className="tc-muted-line">This quiz has no questions yet.</p>
                            : <ol className="qz-paper-list">{draft.blocks.map(renderBlock)}</ol>}
                    </section>
                </>
            )}
        </Drawer>
    );
};

export default QuizDetails;
