import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Modal, Skeleton, Tooltip, message } from 'antd';
import {
    ClockCircleOutlined, CheckCircleFilled, CheckOutlined, CloseOutlined, FlagOutlined, FlagFilled,
    LeftOutlined, RightOutlined, AppstoreOutlined, SoundOutlined, CaretRightFilled, PauseOutlined,
    LoadingOutlined, ExclamationCircleOutlined, LockOutlined, InfoCircleOutlined,
    FileTextOutlined, QuestionCircleOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { resolveTimezone } from '../../utils/timezone';
import './QuizTaking.css';

/* ══════════════════════════════════════════
   Quiz player (student). Rendered full-screen by StudentQuizzes.

   Integrity/behaviour kept from the previous version on purpose:
   – question order is shuffled per load; audio-linked questions stay together;
   – audio is decoded into Web Audio (no downloadable <audio src>) and plays are
     counted per clip in this session;
   – answers auto-save (debounced) and the server is polled for time left and
     for a server-side auto-submit when time runs out;
   – copy / cut / paste / context menu are blocked while answering.
══════════════════════════════════════════ */

const formatNumber = (num: number): string => (num % 1 === 0 ? num.toString() : num.toFixed(2));
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const OPTION_KEYS = 'ABCDEFGH';
const STATUS_POLL_MS = 5000;

interface AudioClip { id: number; duration_seconds?: number; audio_order: number; max_plays: number; has_audio: boolean; }

interface Question {
    id: number;
    question_text: string;
    question_type: 'mcq_single' | 'mcq_multiple' | 'yes_no';
    options?: { id: number; option_text: string; option_order: number }[];
    points: number;
    audio_clip_id?: number;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    instructions?: string | null;
    end_date?: string | null;
    duration_minutes?: number;
    total_questions: number;
    questions: Question[];
    audio_clips?: AudioClip[];
}

interface Answer { question_id: number; answer_text?: string; selected_options?: number[]; }

interface QuizTakingProps {
    quizId?: string;
    /** Called after the student acknowledges a submitted quiz ("Done"). */
    onComplete?: () => void;
    /** Called when the student cancels before starting, or leaves to resume later. */
    onExit?: () => void;
}

export interface QuizTakingHandle {
    submitNow: (auto?: boolean) => Promise<boolean>;
    isStarted: () => boolean;
    saveNow: () => Promise<boolean>;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const parseSavedAnswers = (raw: unknown, validIds: Set<number>): Answer[] => {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter((a: any) => validIds.has(Number(a?.question_id)))
        .map((a: any) => {
            let selected: number[] | undefined;
            if (Array.isArray(a.selected_options)) selected = a.selected_options.map((n: any) => Number(n));
            else if (a.selected_options) {
                try { selected = (JSON.parse(a.selected_options) as any[]).map(Number); } catch { selected = undefined; }
            }
            return { question_id: Number(a.question_id), answer_text: a.answer_text ?? undefined, selected_options: selected };
        });
};

/* ══════════════════════════════
   Secure audio player — no downloadable src in the DOM
══════════════════════════════ */
interface SecureAudioPlayerProps {
    blobUrl?: string;
    unavailable: boolean;
    isExhausted: boolean;
    isLimited: boolean;
    remaining: number;
    maxPlays: number;
    durationSeconds?: number;
    linkedCount: number;
    currentAudioIdx: number;
    onPlay: () => void;
}

const SecureAudioPlayer: React.FC<SecureAudioPlayerProps> = ({
    blobUrl, unavailable, isExhausted, isLimited, remaining, maxPlays, durationSeconds, linkedCount, currentAudioIdx, onPlay,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(durationSeconds || 0);
    const [isLoading, setIsLoading] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);
    const hasCountedRef = useRef(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const startTimeRef = useRef(0);
    const offsetRef = useRef(0);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!blobUrl) return;
        setIsLoading(true);
        let isCancelled = false;
        const initAudio = async () => {
            try {
                const arrayBuffer = await (await fetch(blobUrl)).arrayBuffer();
                if (isCancelled) return;
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
                const buffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
                if (isCancelled) return;
                audioBufferRef.current = buffer;
                if (buffer.duration && isFinite(buffer.duration)) setDuration(buffer.duration);
            } catch (err) {
                console.error('Failed to decode audio', err);
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };
        void initAudio();
        return () => {
            isCancelled = true;
            if (sourceNodeRef.current) {
                try { sourceNodeRef.current.stop(); } catch { /* already stopped */ }
                sourceNodeRef.current.disconnect();
                sourceNodeRef.current = null;
            }
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [blobUrl]);

    const updateProgress = () => {
        if (!audioCtxRef.current || !audioBufferRef.current) return;
        const offset = offsetRef.current + (audioCtxRef.current.currentTime - startTimeRef.current);
        if (offset >= audioBufferRef.current.duration) {
            setIsPlaying(false);
            setCurrentTime(audioBufferRef.current.duration);
            offsetRef.current = 0;
            hasCountedRef.current = false; // the next full listen counts as a new play
        } else {
            setCurrentTime(offset);
            animationRef.current = requestAnimationFrame(updateProgress);
        }
    };

    const togglePlay = () => {
        if (isExhausted || !audioBufferRef.current || !audioCtxRef.current) return;
        if (isPlaying) {
            if (sourceNodeRef.current) {
                try { sourceNodeRef.current.stop(); } catch { /* already stopped */ }
                sourceNodeRef.current.disconnect();
                sourceNodeRef.current = null;
            }
            offsetRef.current += audioCtxRef.current.currentTime - startTimeRef.current;
            setIsPlaying(false);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            setCurrentTime(offsetRef.current);
            return;
        }
        if (!hasCountedRef.current) { onPlay(); hasCountedRef.current = true; }
        if (audioCtxRef.current.state === 'suspended') void audioCtxRef.current.resume();
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.connect(audioCtxRef.current.destination);
        if (offsetRef.current >= audioBufferRef.current.duration) { offsetRef.current = 0; setCurrentTime(0); }
        source.start(0, offsetRef.current);
        startTimeRef.current = audioCtxRef.current.currentTime;
        sourceNodeRef.current = source;
        setIsPlaying(true);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(updateProgress);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioBufferRef.current || !progressRef.current || isExhausted || !audioCtxRef.current) return;
        const rect = progressRef.current.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newOffset = pct * (audioBufferRef.current.duration || duration);
        if (isPlaying) {
            if (sourceNodeRef.current) {
                try { sourceNodeRef.current.stop(); } catch { /* already stopped */ }
                sourceNodeRef.current.disconnect();
            }
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = audioBufferRef.current;
            source.connect(audioCtxRef.current.destination);
            source.start(0, newOffset);
            startTimeRef.current = audioCtxRef.current.currentTime;
            sourceNodeRef.current = source;
        }
        offsetRef.current = newOffset;
        setCurrentTime(newOffset);
    };

    const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const busy = !unavailable && (!blobUrl || isLoading);

    return (
        <div className={`qt-audio${isExhausted ? ' is-exhausted' : ''}`} data-quiz-audio onContextMenu={e => e.preventDefault()}>
            <div className="qt-audio-head">
                <span className="qt-audio-icon"><SoundOutlined /></span>
                <div className="qt-audio-title">
                    <strong>Listening passage</strong>
                    {linkedCount > 1 && <span>Question {currentAudioIdx + 1} of {linkedCount} for this audio</span>}
                </div>
                {isLimited && (
                    <span className={`qt-audio-plays${isExhausted ? ' is-out' : remaining <= 1 ? ' is-low' : ''}`}>
                        {isExhausted ? 'No plays left' : `${remaining} of ${maxPlays} plays left`}
                    </span>
                )}
            </div>
            {unavailable ? (
                <div className="qt-audio-error"><ExclamationCircleOutlined /> The audio could not be loaded. Tell your teacher.</div>
            ) : (
                <div className="qt-audio-controls">
                    <button type="button" className="qt-audio-play" onClick={togglePlay} disabled={busy || isExhausted}
                        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}>
                        {busy ? <LoadingOutlined /> : isPlaying ? <PauseOutlined /> : <CaretRightFilled />}
                    </button>
                    <span className="qt-audio-time">{fmt(currentTime)}</span>
                    <div className="qt-audio-bar" ref={progressRef} onClick={handleProgressClick} aria-hidden>
                        <span style={{ width: `${progress}%` }} />
                        <i style={{ left: `${progress}%` }} />
                    </div>
                    <span className="qt-audio-time">{fmt(duration)}</span>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════
   QUIZ PLAYER
══════════════════════════════ */
const QuizTaking = forwardRef(({ quizId: propQuizId, onComplete, onExit }: QuizTakingProps, ref: React.Ref<QuizTakingHandle>) => {
    const { quizId: paramQuizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const [messageApi, contextHolder] = message.useMessage();
    const quizId = propQuizId || paramQuizId;
    const isNarrow = r.width < 1024;
    const zone = resolveTimezone(user?.timezone);

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [blocked, setBlocked] = useState<{ title: string; text: string } | null>(null);
    const [resumeLeft, setResumeLeft] = useState<number | null | undefined>(undefined); // undefined = fresh start
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
    const [started, setStarted] = useState(false);
    const [starting, setStarting] = useState(false);
    const [completed, setCompleted] = useState<{ auto: boolean; timeTaken: number | null } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [visited, setVisited] = useState<Set<number>>(() => new Set());
    const [flagged, setFlagged] = useState<Set<number>>(() => new Set());
    const [audioPlayCounts, setAudioPlayCounts] = useState<Record<number, number>>({});
    const [audioBlobUrls, setAudioBlobUrls] = useState<Record<number, string>>({});
    const [audioPreloaded, setAudioPreloaded] = useState(false);
    const [totalAudioClips, setTotalAudioClips] = useState(0);

    const timerRef = useRef<number | null>(null);
    const autoSaveTimerRef = useRef<number | null>(null);
    const retryTimerRef = useRef<number | null>(null);
    const syncIntervalRef = useRef<number | null>(null);
    const blobUrlsRef = useRef<string[]>([]);
    const warnedRef = useRef({ five: false, one: false });
    const mainRef = useRef<HTMLDivElement>(null);

    const safeJson = async (resp: Response) => { try { return await resp.json(); } catch { return null; } };
    const stopTimers = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (syncIntervalRef.current) { clearInterval(syncIntervalRef.current); syncIntervalRef.current = null; }
    };

    /* ── Load quiz (+ current session status, to offer "Resume") ── */
    useEffect(() => {
        if (!quizId) return;
        let cancelled = false;
        (async () => {
            try {
                const [response, statusResp] = await Promise.all([
                    apiCall(`/quizzes/${quizId}`),
                    apiCall(`/quizzes/${quizId}/status`).catch(() => null),
                ]);
                const status = statusResp?.ok ? await safeJson(statusResp) : null;
                if (cancelled) return;
                if (status && ['submitted', 'auto_submitted', 'graded', 'published'].includes(status.status)) {
                    setBlocked({ title: 'Already submitted', text: 'You have already submitted this quiz. Your result will appear in My Results once it is released.' });
                    return;
                }
                if (status?.status === 'in_progress') setResumeLeft(typeof status.time_left_seconds === 'number' ? status.time_left_seconds : null);

                if (!response.ok) {
                    const err = await safeJson(response);
                    setBlocked({ title: 'This quiz is not available', text: err?.error || 'The quiz could not be loaded.' });
                    return;
                }
                const data = await response.json();
                const normalized: Quiz = data?.quiz
                    ? { ...(data.quiz as Quiz), questions: data.questions ?? data.quiz?.questions ?? [] }
                    : (data as Quiz);

                if (Array.isArray(normalized.questions)) {
                    normalized.questions = normalized.questions.map((q: any) => ({ ...q, points: q.points ?? q.marks ?? 0 }));
                    // Shuffle: every independent question is its own cluster; audio-linked questions stay together
                    // (shuffled within their clip), then the clusters are shuffled.
                    const independent: Question[][] = [];
                    const byClip: Record<string, Question[]> = {};
                    normalized.questions.forEach(q => {
                        if (q.audio_clip_id) (byClip[q.audio_clip_id] ??= []).push(q);
                        else independent.push([q]);
                    });
                    const shuffle = <T,>(arr: T[]) => {
                        for (let i = arr.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [arr[i], arr[j]] = [arr[j], arr[i]];
                        }
                        return arr;
                    };
                    const clusters: Question[][] = [...independent, ...Object.values(byClip).map(g => shuffle(g))];
                    normalized.questions = shuffle(clusters).flat();
                }
                setQuiz(normalized);

                // Preload audio in the background; "Start" waits for it.
                const clips: AudioClip[] = (normalized?.audio_clips || data?.audio_clips || []).filter((c: AudioClip) => c?.id && c.has_audio);
                setTotalAudioClips(clips.length);
                if (clips.length === 0) { setAudioPreloaded(true); return; }
                let loadedCount = 0;
                clips.forEach(async clip => {
                    try {
                        const audioResp = await apiCall(`/quizzes/audio/${clip.id}/stream`);
                        if (!audioResp.ok) return;
                        let blob: Blob;
                        if ((audioResp.headers.get('content-type') || '').includes('application/json')) {
                            // Base64 JSON wrapper keeps download managers from grabbing the file.
                            const payload = await audioResp.json();
                            const bin = atob(payload.audioData);
                            const bytes = new Uint8Array(bin.length);
                            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                            blob = new Blob([bytes], { type: payload.contentType || 'audio/wav' });
                        } else {
                            blob = await audioResp.blob();
                        }
                        const url = URL.createObjectURL(blob);
                        blobUrlsRef.current.push(url);
                        if (!cancelled) setAudioBlobUrls(prev => ({ ...prev, [clip.id]: url }));
                    } catch (err) {
                        console.warn('Failed to preload audio clip', clip.id, err);
                    } finally {
                        loadedCount++;
                        if (loadedCount >= clips.length && !cancelled) setAudioPreloaded(true);
                    }
                });
            } catch {
                if (!cancelled) setBlocked({ title: 'Connection problem', text: 'The quiz could not be loaded. Check your connection and try again.' });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId]);

    // Release decoded audio files when the player closes.
    useEffect(() => () => { blobUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u); } catch { /* noop */ } }); }, []);

    /* ── Countdown (local) ── */
    useEffect(() => {
        if (started && !completed && timeLeft > 0) {
            timerRef.current = window.setTimeout(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) { void handleAutoSubmit(); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, started, completed]);

    /* ── Time warnings (once each) ── */
    useEffect(() => {
        if (!started || completed) return;
        if (timeLeft <= 60 && timeLeft > 0 && !warnedRef.current.one) {
            warnedRef.current.one = true;
            warnedRef.current.five = true;
            messageApi.warning('1 minute left. The quiz will submit automatically.');
        } else if (timeLeft <= 300 && timeLeft > 60 && totalTimeSeconds > 300 && !warnedRef.current.five) {
            warnedRef.current.five = true;
            messageApi.warning('5 minutes left.');
        }
    }, [timeLeft, started, completed, totalTimeSeconds, messageApi]);

    /* ── Server sync: corrects drift, restores answers, detects server-side auto-submit ── */
    useEffect(() => {
        if (!started || !quizId) return;
        const poll = async () => {
            try {
                const resp = await apiCall(`/quizzes/${quizId}/status`);
                if (!resp.ok) return;
                const data = await resp.json();
                if (data?.status === 'in_progress') {
                    if (Array.isArray(data.answers) && quiz?.questions) {
                        const valid = new Set(quiz.questions.map(q => q.id));
                        setAnswers(prev => (prev.length > 0 ? prev : parseSavedAnswers(data.answers, valid)));
                    }
                    if (typeof data.time_left_seconds === 'number') {
                        setTimeLeft(prev => (Math.abs(prev - data.time_left_seconds) > 2 ? data.time_left_seconds : prev));
                    }
                    if (typeof data.duration_minutes === 'number') setTotalTimeSeconds(t => t || data.duration_minutes * 60);
                } else if (data?.status === 'auto_submitted' || data?.status === 'submitted') {
                    stopTimers();
                    setCompleted({ auto: data.status === 'auto_submitted', timeTaken: data.time_taken_minutes ?? null });
                }
            } catch { /* transient — next poll reconciles */ }
        };
        void poll();
        syncIntervalRef.current = window.setInterval(poll, STATUS_POLL_MS);
        return () => { if (syncIntervalRef.current) { clearInterval(syncIntervalRef.current); syncIntervalRef.current = null; } };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, quizId]);

    /* ── Visited questions (navigator colouring) + scroll to top on change ── */
    useEffect(() => {
        const q = quiz?.questions?.[current];
        if (!started || !q) return;
        setVisited(prev => (prev.has(q.id) ? prev : new Set(prev).add(q.id)));
        mainRef.current?.scrollTo({ top: 0 });
    }, [started, quiz, current]);

    /* ── Warn before closing the tab while a quiz is running ── */
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (started && !completed) { e.preventDefault(); e.returnValue = ''; }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [started, completed]);

    /* ── Answers & saving ── */
    const payloadFromAnswers = () => answers.map(a => ({
        question_id: a.question_id,
        answer_text: a.answer_text ?? null,
        selected_options: a.selected_options ?? null,
    }));

    const saveNow = async (): Promise<boolean> => {
        if (!started || completed) return true;
        setSaveState('saving');
        try {
            const response = await apiCall(`/quizzes/${quizId}/auto-save`, {
                method: 'POST',
                body: JSON.stringify({ answers: payloadFromAnswers() }),
            });
            setSaveState(response.ok ? 'saved' : 'error');
            return response.ok;
        } catch {
            setSaveState('error');
            return false;
        }
    };

    // Debounced auto-save whenever answers change.
    useEffect(() => {
        if (!started || completed) return;
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = window.setTimeout(() => { void saveNow(); }, 1500);
        return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answers, started, completed]);

    // A failed save retries on its own.
    useEffect(() => {
        if (saveState !== 'error' || !started || completed) return;
        retryTimerRef.current = window.setTimeout(() => { void saveNow(); }, 5000);
        return () => { if (retryTimerRef.current) clearTimeout(retryTimerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveState, started, completed]);

    const handleAnswerChange = (question: Question, value: any) => {
        setAnswers(prev => {
            const updated: Answer = { question_id: question.id };
            if (question.question_type === 'yes_no') updated.answer_text = value as string;
            else if (question.question_type === 'mcq_single') updated.selected_options = value != null ? [Number(value)] : [];
            else updated.selected_options = Array.isArray(value) ? value.map(Number) : [];
            return prev.some(a => a.question_id === question.id)
                ? prev.map(a => (a.question_id === question.id ? { ...a, ...updated } : a))
                : [...prev, updated];
        });
    };

    const getAnswerForQuestion = (question: Question): any => {
        const a = answers.find(ans => ans.question_id === question.id);
        if (question.question_type === 'yes_no') return a?.answer_text || '';
        if (question.question_type === 'mcq_single') return a?.selected_options?.[0];
        return a?.selected_options || [];
    };

    const toggleMultiple = (question: Question, optionId: number) => {
        const selected = new Set<number>(getAnswerForQuestion(question) as number[]);
        if (selected.has(optionId)) selected.delete(optionId); else selected.add(optionId);
        handleAnswerChange(question, Array.from(selected));
    };

    /* ── Start / submit ── */
    const startQuiz = async () => {
        if (!quiz) return;
        setStarting(true);
        try {
            const response = await apiCall(`/quizzes/${quizId}/start`, { method: 'POST' });
            if (!response.ok) {
                const errJson = await safeJson(response);
                messageApi.error(errJson?.error || 'Failed to start the quiz');
                return;
            }
            const data = await response.json();
            const duration = Number(data.quiz?.duration_minutes ?? quiz.duration_minutes ?? 0);
            let secondsLeft = duration * 60;
            let restored: Answer[] = [];

            // Resuming: restore saved answers and the real time left before showing the questions,
            // so nothing can overwrite the saved answers with an empty set.
            if (data?.submission?.status === 'in_progress' || data?.message === 'Quiz already in progress') {
                const st = await apiCall(`/quizzes/${quizId}/status`).then(res => (res.ok ? res.json() : null)).catch(() => null);
                if (st?.status === 'in_progress') {
                    restored = parseSavedAnswers(st.answers, new Set(quiz.questions.map(q => q.id)));
                    if (typeof st.time_left_seconds === 'number') secondsLeft = st.time_left_seconds;
                }
            }
            setAnswers(restored);
            setTotalTimeSeconds(duration * 60 || secondsLeft);
            setTimeLeft(secondsLeft);
            setQuiz(prev => (prev ? { ...prev, duration_minutes: duration || prev.duration_minutes } : prev));
            setCurrent(0);
            setStarted(true);
            if (restored.length) messageApi.success(`Welcome back — ${plural(restored.length, 'saved answer')} restored.`);
        } catch {
            messageApi.error('Failed to start the quiz');
        } finally {
            setStarting(false);
        }
    };

    const submitQuiz = async (isAuto = false): Promise<boolean> => {
        if (submitting || completed) return false;
        setSubmitting(true);
        try {
            const response = await apiCall(`/quizzes/${quizId}/submit`, {
                method: 'POST',
                body: JSON.stringify({ answers: payloadFromAnswers(), is_auto_submit: isAuto }),
            });
            if (!response.ok) {
                const err = await safeJson(response);
                messageApi.error(err?.error || 'Failed to submit the quiz');
                return false;
            }
            const data = await safeJson(response);
            stopTimers();
            setCompleted({ auto: isAuto, timeTaken: data?.time_taken_minutes ?? null });
            return true;
        } catch {
            messageApi.error('Could not submit — check your connection and try again.');
            return false;
        } finally {
            setSubmitting(false);
            setConfirmOpen(false);
        }
    };

    const handleAutoSubmit = async () => {
        messageApi.warning("Time's up — submitting your answers.");
        await submitQuiz(true);
    };

    useImperativeHandle(ref, () => ({
        submitNow: async (auto?: boolean) => (!started || completed ? false : submitQuiz(!!auto)),
        isStarted: () => started && !completed,
        saveNow,
    }), [started, completed, answers]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Navigation ── */
    const questions = quiz?.questions ?? [];
    const total = questions.length;
    const goTo = (idx: number) => {
        if (idx < 0 || idx >= total) return;
        void saveNow();
        setCurrent(idx);
        setNavOpen(false);
    };
    const goNext = () => goTo(current + 1);
    const goPrev = () => goTo(current - 1);
    const toggleFlag = (id: number) => setFlagged(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const requestExit = () => {
        if (completed) { onComplete?.(); return; }
        if (!started) { onExit?.(); return; }
        setLeaveOpen(true);
    };
    const leaveQuiz = async () => {
        setLeaving(true);
        await saveNow();
        stopTimers();
        setLeaving(false);
        setLeaveOpen(false);
        onExit?.();
    };

    const answeredSet = useMemo(() => new Set(
        answers
            .filter(a => questions.some(q => q.id === a.question_id)
                && ((a.answer_text && a.answer_text !== '') || (Array.isArray(a.selected_options) && a.selected_options.length > 0)))
            .map(a => a.question_id),
    ), [answers, questions]);
    const answered = answeredSet.size;
    const unanswered = questions.map((q, i) => (answeredSet.has(q.id) ? -1 : i)).filter(i => i >= 0);

    /* ── Keyboard: ← → to move, A–H / 1–8 to answer ── */
    useEffect(() => {
        if (!started || completed || confirmOpen || leaveOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const t = e.target as HTMLElement | null;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
            const q = questions[current];
            if (!q) return;
            if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); return; }
            if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); return; }
            let idx = OPTION_KEYS.indexOf(e.key.toUpperCase());
            if (idx < 0 && /^[1-8]$/.test(e.key)) idx = Number(e.key) - 1;
            if (idx < 0) return;
            if (q.question_type === 'yes_no') {
                if (idx <= 1) handleAnswerChange(q, idx === 0 ? 'yes' : 'no');
                return;
            }
            const opt = q.options?.[idx];
            if (!opt) return;
            if (q.question_type === 'mcq_single') handleAnswerChange(q, opt.id);
            else toggleMultiple(q, opt.id);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, completed, confirmOpen, leaveOpen, questions, current, answers]);

    /* ── Formatting ── */
    const formatTime = (seconds: number) => {
        const s = Math.max(0, Math.floor(seconds));
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}` : `${m}:${sec.toString().padStart(2, '0')}`;
    };
    const fmtDateTime = (iso?: string | null) => {
        if (!iso) return null;
        const d = new Date(iso);
        if (isNaN(d.getTime())) return null;
        return new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    };

    /* ═══════════ STATES BEFORE THE QUIZ ═══════════ */
    if (loading) return (
        <div className="qt qt-center">
            {contextHolder}
            <div className="qt-card qt-intro"><Skeleton active paragraph={{ rows: 7 }} /></div>
        </div>
    );

    if (blocked || !quiz) return (
        <div className="qt qt-center">
            {contextHolder}
            <div className="qt-card qt-done">
                <div className="qt-done-icon is-muted"><InfoCircleOutlined /></div>
                <h1 className="qt-done-title">{blocked?.title || 'Quiz not found'}</h1>
                <p className="qt-done-text">{blocked?.text || 'This quiz could not be loaded.'}</p>
                <div className="qt-actions is-center">
                    <Button type="primary" onClick={() => onExit?.()}>Close</Button>
                </div>
            </div>
        </div>
    );

    if (completed) {
        const endLabel = quiz.end_date && new Date(quiz.end_date).getTime() > Date.now() ? fmtDateTime(quiz.end_date) : null;
        return (
            <div className="qt qt-center">
                {contextHolder}
                <div className="qt-card qt-done">
                    <div className="qt-done-icon"><CheckCircleFilled /></div>
                    <h1 className="qt-done-title">{completed.auto ? "Time's up — your quiz was submitted" : 'Quiz submitted'}</h1>
                    <p className="qt-done-text">
                        {total > 0 && <>You answered {answered} of {total} questions{completed.timeTaken != null ? ` in ${plural(completed.timeTaken, 'minute')}` : ''}. </>}
                        Your answers are safely recorded.
                    </p>
                    <div className="qt-done-note">
                        <LockOutlined />
                        {endLabel ? `Your score will be released when the quiz closes on ${endLabel}.` : 'Your score will be available in My Results.'}
                    </div>
                    <div className="qt-actions is-center">
                        <Button onClick={() => { onComplete?.(); navigate('/app/my-results'); }}>View my results</Button>
                        <Button type="primary" onClick={() => onComplete?.()}>Done</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!started) {
        const totalPoints = questions.reduce((sum, q) => sum + (q.points ?? 0), 0);
        const isPreparing = !audioPreloaded && totalAudioClips > 0;
        const limitedAudio = (quiz.audio_clips ?? []).some(c => c.has_audio && c.max_plays > 0);
        const isResume = resumeLeft !== undefined;
        const closes = fmtDateTime(quiz.end_date);
        return (
            <div className="qt qt-center">
                {contextHolder}
                <div className="qt-card qt-intro">
                    <div className="qt-intro-band">
                        <span className="qt-intro-icon"><FileTextOutlined /></span>
                        <div className="qt-intro-head">
                            <div className="qt-overline">{isResume ? 'Resume quiz' : 'Quiz'}</div>
                            <h1 className="qt-intro-title">{quiz.title}</h1>
                        </div>
                    </div>
                    {quiz.description && <p className="qt-intro-desc">{quiz.description}</p>}

                    <dl className="qt-facts">
                        <div><dt><QuestionCircleOutlined /> Questions</dt><dd>{total || quiz.total_questions}</dd></div>
                        <div><dt><ClockCircleOutlined /> Time limit</dt><dd>{quiz.duration_minutes ? `${quiz.duration_minutes} min` : 'None'}</dd></div>
                        <div><dt><TrophyOutlined /> Points</dt><dd>{formatNumber(totalPoints)}</dd></div>
                        {totalAudioClips > 0 && <div><dt><SoundOutlined /> Audio</dt><dd>{plural(totalAudioClips, 'clip')}</dd></div>}
                    </dl>

                    {isResume && (
                        <div className="qt-callout is-info">
                            <ClockCircleOutlined />
                            <span>
                                You started this quiz earlier{typeof resumeLeft === 'number' ? ` — ${formatTime(resumeLeft)} left` : ''}.
                                Your saved answers will be restored.
                            </span>
                        </div>
                    )}

                    {quiz.instructions && (
                        <div className="qt-instructions">
                            <div className="qt-section-label">Teacher's instructions</div>
                            <p>{quiz.instructions}</p>
                        </div>
                    )}

                    <div className="qt-rules">
                        <div className="qt-section-label">Before you start</div>
                        <ul>
                            <li>The timer starts when you begin and keeps running if you leave.</li>
                            <li>Answers save automatically. Move freely between questions and flag any you want to review.</li>
                            <li>The quiz submits itself when time runs out{closes ? `, and it closes on ${closes}` : ''}.</li>
                            {limitedAudio && <li>Some listening passages can only be played a limited number of times.</li>}
                            <li>Use a stable internet connection.</li>
                        </ul>
                    </div>

                    <div className="qt-actions">
                        <Button onClick={() => onExit?.()}>Cancel</Button>
                        <Button type="primary" onClick={startQuiz} loading={isPreparing || starting} disabled={isPreparing}>
                            {isPreparing ? 'Preparing audio…' : isResume ? 'Resume quiz' : 'Start quiz'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    /* ═══════════ RUNNING ═══════════ */
    const currentQ = questions[current];
    if (!currentQ) return (
        <div className="qt qt-center">
            <div className="qt-card qt-done">
                <h1 className="qt-done-title">This quiz has no questions</h1>
                <div className="qt-actions is-center"><Button onClick={() => onExit?.()}>Close</Button></div>
            </div>
        </div>
    );

    const isLast = current === total - 1;
    const isFlagged = flagged.has(currentQ.id);
    const timePct = totalTimeSeconds > 0 ? timeLeft / totalTimeSeconds : 1;
    const timerTone = timeLeft <= 60 ? 'danger' : timeLeft <= 300 || timePct <= 0.2 ? 'warn' : 'normal';
    const typeHint = currentQ.question_type === 'mcq_multiple' ? 'Select all that apply'
        : currentQ.question_type === 'yes_no' ? 'Choose Oui or Non' : 'Choose one answer';
    const currentAnswer = getAnswerForQuestion(currentQ);

    const renderOptions = () => {
        if (currentQ.question_type === 'yes_no') {
            return (
                <div className="qt-options is-binary" role="radiogroup" aria-label="Answer">
                    {[{ v: 'yes', label: 'Oui' }, { v: 'no', label: 'Non' }].map((o, i) => {
                        const sel = currentAnswer === o.v;
                        return (
                            <button key={o.v} type="button" role="radio" aria-checked={sel}
                                className={`qt-option${sel ? ' is-selected' : ''}`} onClick={() => handleAnswerChange(currentQ, o.v)}>
                                <span className="qt-option-key">{OPTION_KEYS[i]}</span>
                                <span className="qt-option-text">{o.label}</span>
                                <span className="qt-option-check">{sel && <CheckOutlined />}</span>
                            </button>
                        );
                    })}
                </div>
            );
        }
        const multiple = currentQ.question_type === 'mcq_multiple';
        return (
            <div className={`qt-options${multiple ? ' is-multiple' : ''}`} role={multiple ? 'group' : 'radiogroup'} aria-label="Answer options">
                {(currentQ.options ?? []).map((o, i) => {
                    const sel = multiple ? (currentAnswer as number[]).includes(o.id) : currentAnswer === o.id;
                    return (
                        <button key={o.id} type="button" role={multiple ? 'checkbox' : 'radio'} aria-checked={sel}
                            className={`qt-option${sel ? ' is-selected' : ''}`}
                            onClick={() => (multiple ? toggleMultiple(currentQ, o.id) : handleAnswerChange(currentQ, o.id))}>
                            <span className="qt-option-key">{OPTION_KEYS[i] ?? i + 1}</span>
                            <span className="qt-option-text">{o.option_text}</span>
                            <span className="qt-option-check">{sel && <CheckOutlined />}</span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderAudio = () => {
        if (!currentQ.audio_clip_id) return null;
        const clip = quiz.audio_clips?.find(c => c.id === currentQ.audio_clip_id);
        if (!clip?.has_audio) return null;
        const plays = audioPlayCounts[clip.id] || 0;
        const maxP = clip.max_plays || 0;
        const isLimited = maxP > 0;
        const remaining = isLimited ? Math.max(0, maxP - plays) : Infinity;
        const isExhausted = isLimited && remaining <= 0;
        const linked = questions.filter(q => q.audio_clip_id === clip.id);
        return (
            <SecureAudioPlayer
                key={clip.id}
                blobUrl={audioBlobUrls[clip.id]}
                unavailable={audioPreloaded && !audioBlobUrls[clip.id]}
                isExhausted={isExhausted}
                isLimited={isLimited}
                remaining={remaining}
                maxPlays={maxP}
                durationSeconds={clip.duration_seconds}
                linkedCount={linked.length}
                currentAudioIdx={linked.findIndex(q => q.id === currentQ.id)}
                onPlay={() => { if (!isExhausted) setAudioPlayCounts(prev => ({ ...prev, [clip.id]: (prev[clip.id] || 0) + 1 })); }}
            />
        );
    };

    const navigator = (
        <div className="qt-navigator">
            <div className="qt-nav-summary">
                <div><strong>{answered}</strong><span>Answered</span></div>
                <div><strong>{total - answered}</strong><span>Left</span></div>
                <div><strong>{flagged.size}</strong><span>Flagged</span></div>
            </div>
            <div className="qt-grid" role="list" aria-label="Questions">
                {questions.map((q, i) => {
                    const cls = [
                        'qt-grid-item',
                        answeredSet.has(q.id) ? 'is-answered' : visited.has(q.id) ? 'is-visited' : '',
                        i === current ? 'is-current' : '',
                        flagged.has(q.id) ? 'is-flagged' : '',
                    ].filter(Boolean).join(' ');
                    return (
                        <button key={q.id} type="button" className={cls} onClick={() => goTo(i)} aria-current={i === current ? 'step' : undefined}
                            aria-label={`Question ${i + 1}${answeredSet.has(q.id) ? ', answered' : ''}${flagged.has(q.id) ? ', flagged' : ''}`}>
                            {i + 1}
                            {q.audio_clip_id && <SoundOutlined className="qt-grid-audio" />}
                            {flagged.has(q.id) && <FlagFilled className="qt-grid-flag" />}
                        </button>
                    );
                })}
            </div>
            <ul className="qt-legend">
                <li><i className="is-answered" />Answered</li>
                <li><i className="is-visited" />Seen</li>
                <li><i />Not seen</li>
                <li><FlagFilled className="qt-legend-flag" />Flagged</li>
            </ul>
            <Button type="primary" block onClick={() => { setNavOpen(false); setConfirmOpen(true); }}>Review &amp; submit</Button>
        </div>
    );

    return (
        <div
            className="qt qt-run"
            onCopy={e => e.preventDefault()}
            onCut={e => e.preventDefault()}
            onPaste={e => e.preventDefault()}
            onContextMenu={e => e.preventDefault()}
        >
            {contextHolder}
            <header className="qt-top">
                <div className="qt-top-info">
                    <div className="qt-top-title" title={quiz.title}>{quiz.title}</div>
                    <div className="qt-top-meta">Question {current + 1} of {total} · {answered} answered</div>
                </div>
                {!r.isMobile && saveState !== 'idle' && (
                    <span className={`qt-save is-${saveState}`} aria-live="polite">
                        {saveState === 'saving' ? <><LoadingOutlined /> Saving…</>
                            : saveState === 'saved' ? <><CheckOutlined /> Saved</>
                            : <><ExclamationCircleOutlined /> Not saved — retrying</>}
                    </span>
                )}
                <div className={`qt-timer is-${timerTone}`} role="timer" aria-label={`Time left ${formatTime(timeLeft)}`}>
                    <ClockCircleOutlined /> {formatTime(timeLeft)}
                </div>
                {isNarrow && (
                    <Button className="qt-icon-btn" icon={<AppstoreOutlined />} onClick={() => setNavOpen(true)} aria-label="All questions" />
                )}
                <Button className="qt-exit" icon={<CloseOutlined />} onClick={requestExit} aria-label="Exit quiz">
                    {!r.isMobile && 'Exit'}
                </Button>
            </header>
            <div className="qt-progress" aria-hidden><span style={{ width: `${total ? (answered / total) * 100 : 0}%` }} /></div>

            <div className="qt-body">
                <div className="qt-main" ref={mainRef}>
                    <article className="qt-question" key={currentQ.id}>
                        <header className="qt-q-head">
                            <span className="qt-q-no">Question {current + 1}</span>
                            <span className="qt-q-pts">{formatNumber(currentQ.points ?? 0)} {currentQ.points === 1 ? 'pt' : 'pts'}</span>
                            <Tooltip title={isFlagged ? 'Remove flag' : 'Flag this question to review before submitting'}>
                                <Button size="small" className={`qt-flag${isFlagged ? ' is-on' : ''}`}
                                    icon={isFlagged ? <FlagFilled /> : <FlagOutlined />} onClick={() => toggleFlag(currentQ.id)}>
                                    {isFlagged ? 'Flagged' : 'Flag'}
                                </Button>
                            </Tooltip>
                        </header>
                        {renderAudio()}
                        <p className="qt-q-text">{currentQ.question_text}</p>
                        <div className="qt-q-hint">{typeHint}</div>
                        {renderOptions()}
                    </article>

                    <footer className="qt-nav-bar">
                        <Button icon={<LeftOutlined />} onClick={goPrev} disabled={current === 0}>Previous</Button>
                        {!isNarrow && <span className="qt-kbd-hint">Use ← → to move, A–{OPTION_KEYS[Math.max(1, (currentQ.options?.length ?? 2) - 1)]} to answer</span>}
                        {isLast
                            ? <Button type="primary" onClick={() => setConfirmOpen(true)}>Review &amp; submit</Button>
                            : <Button type="primary" onClick={goNext}>Next <RightOutlined /></Button>}
                    </footer>
                </div>
                {!isNarrow && <aside className="qt-side" aria-label="Question overview">{navigator}</aside>}
            </div>

            <Drawer
                placement="bottom"
                open={isNarrow && navOpen}
                onClose={() => setNavOpen(false)}
                title="Questions"
                height="auto"
                rootClassName="qt-drawer"
                styles={{ body: { padding: 16 } }}
            >
                {navigator}
            </Drawer>

            {/* Submit confirmation */}
            <Modal open={confirmOpen} onCancel={() => !submitting && setConfirmOpen(false)} footer={null} centered width={440}
                closable={!submitting} maskClosable={!submitting} wrapClassName="qt-modal">
                <div className="qt-confirm">
                    <h2>Submit your quiz?</h2>
                    <p>You answered <strong>{answered}</strong> of <strong>{total}</strong> questions. You can't change your answers after submitting.</p>
                    {unanswered.length > 0 && (
                        <div className="qt-callout is-warn">
                            <ExclamationCircleOutlined />
                            <div>
                                <strong>{plural(unanswered.length, 'question')} not answered</strong> — they will be marked incorrect.
                                <div className="qt-chip-row">
                                    {unanswered.slice(0, 16).map(i => (
                                        <button key={i} type="button" onClick={() => { setConfirmOpen(false); goTo(i); }}>{i + 1}</button>
                                    ))}
                                    {unanswered.length > 16 && <span>+{unanswered.length - 16}</span>}
                                </div>
                            </div>
                        </div>
                    )}
                    {flagged.size > 0 && (
                        <div className="qt-callout is-info"><FlagFilled /><span>{plural(flagged.size, 'question')} flagged for review.</span></div>
                    )}
                    <div className="qt-actions">
                        <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>Keep reviewing</Button>
                        <Button type="primary" loading={submitting} onClick={() => submitQuiz(false)}>Submit now</Button>
                    </div>
                </div>
            </Modal>

            {/* Leave confirmation */}
            <Modal open={leaveOpen} onCancel={() => !leaving && setLeaveOpen(false)} footer={null} centered width={440} wrapClassName="qt-modal">
                <div className="qt-confirm">
                    <h2>Leave this quiz?</h2>
                    <p>
                        Your answers are saved. The timer keeps running while you're away — you can resume from
                        My Quizzes until it reaches zero (<strong>{formatTime(timeLeft)}</strong> left).
                    </p>
                    <div className="qt-actions is-stacked">
                        <Button type="primary" onClick={() => setLeaveOpen(false)} disabled={leaving}>Keep working</Button>
                        <Button onClick={leaveQuiz} loading={leaving}>Leave and resume later</Button>
                        <Button type="text" danger onClick={() => { setLeaveOpen(false); setConfirmOpen(true); }} disabled={leaving}>
                            Submit now instead
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
});

export default QuizTaking;
