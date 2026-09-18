import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Modal, Skeleton, message } from 'antd';
import {
  SoundOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined, CheckOutlined, CloseOutlined,
  AppstoreOutlined, LoadingOutlined, TrophyOutlined, CheckCircleFilled, CloseCircleFilled,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import useExamGuard from '../../hooks/useExamGuard';
import './COQuizTaking.css';

/* ══════════════════════════════════════════
   TCF — Compréhension orale player.
   Behaviour kept from the previous version: attempt started on the server,
   local countdown with auto-submit, media fetched as blobs (served as
   octet-stream to discourage download managers), copy/context menu blocked.
   New: the whole series' audio/images download in the background (4 at a
   time) while the student reads the intro, so questions open instantly.
══════════════════════════════════════════ */

interface Question { id: number; question_order: number; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; cefr_level: string; points: number; has_audio: boolean; has_image: boolean; }
interface SeriesInfo { id: number; name: string; description?: string; duration_minutes: number; total_questions: number; total_points: number; questions: Question[]; best_attempt: any; attempt_count: number; max_attempts: number; intro_audio_kdrive_file_id?: number; }
interface GradedAnswer { question_id: number; selected_answer: string | null; correct_answer: string; is_correct: boolean; points: number; cefr_level: string; }
interface SubmitResult { attempt_id: number; correct_count: number; total_questions: number; earned_points: number; total_points: number; score_percentage: number; cefr_level: string; time_spent_seconds: number; answers: GradedAnswer[]; is_auto_submitted: boolean; }
interface Props { seriesId: number; onBack: () => void; }

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;
const PRELOAD_CONCURRENCY = 4;
const fmtClock = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

const COQuizTaking: React.FC<Props> = ({ seriesId, onBack }) => {
  const { apiCall, token } = useAuth();
  const r = useResponsive();
  const isNarrow = r.width < 1024;
  const [messageApi, contextHolder] = message.useMessage();
  useExamGuard(true, t => messageApi.warning({ content: t, key: 'exam-guard' }));
  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const [phase, setPhase] = useState<'loading' | 'intro' | 'quiz' | 'results'>('loading');
  const [series, setSeries] = useState<SeriesInfo | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [cur, setCur] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState<'submit' | 'exit' | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [media, setMedia] = useState<Record<string, string>>({});
  const [preload, setPreload] = useState({ done: 0, total: 0 });

  const timerRef = useRef<number | null>(null);
  const autoRef = useRef(false);
  const submitRef = useRef<(auto: boolean) => void>(() => {});
  const mediaJobs = useRef(new Map<string, Promise<string>>());
  const blobUrls = useRef<string[]>([]);

  /* ── Media: fetched once per file, shared by the preloader and the current question ── */
  const loadMedia = useCallback((key: string, url: string, mime?: string) => {
    const existing = mediaJobs.current.get(key);
    if (existing) return existing;
    const job = (async () => {
      try {
        const res = await fetch(`${API}${url}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const blob = new Blob([await res.arrayBuffer()], mime ? { type: mime } : undefined);
        const objectUrl = URL.createObjectURL(blob);
        blobUrls.current.push(objectUrl);
        setMedia(m => ({ ...m, [key]: objectUrl }));
        return objectUrl;
      } catch {
        mediaJobs.current.delete(key); // allow a retry when the question is opened
        return '';
      }
    })();
    mediaJobs.current.set(key, job);
    return job;
  }, [API, token]);

  useEffect(() => () => { blobUrls.current.forEach(u => URL.revokeObjectURL(u)); }, []);

  /* ── Load the series ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiCall(`/tcf/student/co/series/${seriesId}`);
        if (!res.ok) throw new Error();
        const data: SeriesInfo = await res.json();
        if (cancelled) return;
        setSeries(data);
        setPhase('intro');
      } catch {
        if (!cancelled) { message.error('This series could not be loaded.'); onBack(); }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesId]);

  /* ── Background preload: intro first, then every question's media ── */
  useEffect(() => {
    if (!series) return;
    let cancelled = false;
    if (series.intro_audio_kdrive_file_id) void loadMedia('intro', `/tcf/student/co/series/${seriesId}/intro-audio`, 'audio/mpeg');
    const jobs: [string, string, string?][] = [];
    series.questions.forEach(q => {
      if (q.has_audio) jobs.push([`a${q.id}`, `/tcf/student/co/questions/${q.id}/audio`, 'audio/mpeg']);
      if (q.has_image) jobs.push([`i${q.id}`, `/tcf/student/co/questions/${q.id}/image`]);
    });
    setPreload({ done: 0, total: jobs.length });
    let next = 0;
    const worker = async () => {
      while (!cancelled && next < jobs.length) {
        const [key, url, mime] = jobs[next++];
        await loadMedia(key, url, mime);
        if (!cancelled) setPreload(p => ({ ...p, done: Math.min(p.total, p.done + 1) }));
      }
    };
    void Promise.all(Array.from({ length: PRELOAD_CONCURRENCY }, worker));
    return () => { cancelled = true; };
  }, [series, seriesId, loadMedia]);

  // The question on screen always jumps the queue.
  useEffect(() => {
    if (phase !== 'quiz' || !series) return;
    const q = series.questions[cur];
    if (!q) return;
    if (q.has_audio) void loadMedia(`a${q.id}`, `/tcf/student/co/questions/${q.id}/audio`, 'audio/mpeg');
    if (q.has_image) void loadMedia(`i${q.id}`, `/tcf/student/co/questions/${q.id}/image`);
  }, [phase, series, cur, loadMedia]);

  /* ── Start / timer / submit ── */
  const startQuiz = async () => {
    if (!series) return;
    setStarting(true);
    try {
      const res = await apiCall(`/tcf/student/co/series/${seriesId}/start`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setAttemptId(d.attempt_id);
      setTimeLeft(series.duration_minutes * 60);
      setAnswers({});
      setCur(0);
      autoRef.current = false;
      setPhase('quiz');
    } catch {
      messageApi.error('The exam could not be started. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || !series || !attemptId) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const res = await apiCall(`/tcf/student/co/series/${seriesId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attemptId,
          answers: series.questions.map(q => ({ question_id: q.id, selected_answer: answers[q.id] || null })),
          is_auto_submitted: auto,
        }),
      });
      if (!res.ok) throw new Error();
      setResult(await res.json());
      setConfirm(null);
      setPhase('results');
    } catch {
      messageApi.error('Submission failed — check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, series, attemptId, answers, apiCall, seriesId, messageApi]);

  useEffect(() => { submitRef.current = handleSubmit; }, [handleSubmit]);

  useEffect(() => {
    if (phase !== 'quiz' || !series) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!autoRef.current) { autoRef.current = true; submitRef.current(true); }
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, series]);

  const answered = useMemo(() => (series ? series.questions.filter(q => answers[q.id]).length : 0), [answers, series]);
  const goTo = (i: number) => { if (series && i >= 0 && i < series.questions.length) { setCur(i); setNavOpen(false); } };

  /* ── Keyboard: ← → to move, A–D to answer ── */
  useEffect(() => {
    if (phase !== 'quiz' || !series || confirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const q = series.questions[cur];
      if (!q) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(cur - 1); return; }
      const k = e.key.toUpperCase();
      const idx = OPTION_KEYS.indexOf(k as typeof OPTION_KEYS[number]) >= 0 ? k : /^[1-4]$/.test(e.key) ? OPTION_KEYS[Number(e.key) - 1] : null;
      if (idx) setAnswers(p => ({ ...p, [q.id]: idx }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, series, cur, confirm]);

  /* ═══════════ LOADING ═══════════ */
  if (phase === 'loading' || !series) return (
    <Modal open centered width={560} footer={null} closable={false} wrapClassName="co-modal">
      <div className="co-pad"><Skeleton active paragraph={{ rows: 6 }} /></div>
    </Modal>
  );

  /* ═══════════ INTRO ═══════════ */
  if (phase === 'intro') {
    const pct = preload.total ? Math.round((preload.done / preload.total) * 100) : 100;
    const ready = preload.done >= preload.total;
    return (
      <Modal open centered width={580} footer={null} onCancel={onBack} wrapClassName="co-modal" closable={false}>
        {contextHolder}
        <div className="co-intro">
          <div className="co-overline"><SoundOutlined /> Compréhension orale</div>
          <h2 className="co-intro-title">{series.name}</h2>
          {series.description && <p className="co-intro-desc">{series.description}</p>}

          <dl className="co-facts">
            <div><dt>Questions</dt><dd>{series.total_questions}</dd></div>
            <div><dt>Duration</dt><dd>{series.duration_minutes} min</dd></div>
            <div><dt>Points</dt><dd>{series.total_points}</dd></div>
          </dl>

          {series.intro_audio_kdrive_file_id ? (
            <div className="co-audio">
              <div className="co-label">Introduction</div>
              {media.intro
                ? <audio controls controlsList="nodownload noplaybackrate" onContextMenu={e => e.preventDefault()} src={media.intro} />
                : <div className="co-audio-wait"><LoadingOutlined /> Loading the introduction…</div>}
            </div>
          ) : null}

          <div className="co-rules">
            <div className="co-label">Before you start</div>
            <ul>
              <li>Questions get harder as you go, from A1 to C2.</li>
              <li>Listen carefully to each recording before answering.</li>
              <li>The timer starts as soon as you begin.</li>
              <li>Your answers are submitted automatically when time runs out.</li>
            </ul>
          </div>

          {series.best_attempt && (
            <div className="co-best">
              <TrophyOutlined />
              <span>Best result: <strong>{series.best_attempt.score_percentage}%</strong> · {series.best_attempt.earned_points}/{series.best_attempt.total_points} pts</span>
              <span className="co-level">{series.best_attempt.cefr_level}</span>
            </div>
          )}

          {preload.total > 0 && (
            <div className="co-preload" aria-live="polite">
              <div className="co-preload-text">
                {ready ? <><CheckOutlined /> Audio ready</> : <><LoadingOutlined /> Preparing audio · {preload.done}/{preload.total}</>}
              </div>
              <div className="co-bar"><span style={{ width: `${pct}%` }} /></div>
            </div>
          )}

          <div className="co-actions">
            <Button onClick={onBack}>Back</Button>
            <Button type="primary" onClick={startQuiz} loading={starting}>Start the exam</Button>
          </div>
          <div className="co-attempt">Attempt {Number(series.attempt_count) + 1} of {series.max_attempts}</div>
        </div>
      </Modal>
    );
  }

  /* ═══════════ QUIZ (full screen) ═══════════ */
  if (phase === 'quiz') {
    const q = series.questions[cur];
    const total = series.questions.length;
    const totalSeconds = series.duration_minutes * 60;
    const tone = timeLeft <= 60 ? 'danger' : timeLeft <= 300 || (totalSeconds && timeLeft / totalSeconds <= 0.2) ? 'warn' : 'normal';
    const audioUrl = media[`a${q.id}`];
    const imageUrl = media[`i${q.id}`];
    const options = [q.option_a, q.option_b, q.option_c, q.option_d];

    const navigator = (
      <div className="co-navigator">
        <div className="co-nav-summary">
          <div><strong>{answered}</strong><span>Answered</span></div>
          <div><strong>{total - answered}</strong><span>Left</span></div>
        </div>
        <div className="co-grid">
          {series.questions.map((qq, i) => (
            <button key={qq.id} type="button" onClick={() => goTo(i)} aria-current={i === cur ? 'step' : undefined}
              className={`co-grid-item${answers[qq.id] ? ' is-answered' : ''}${i === cur ? ' is-current' : ''}`}>
              {i + 1}
            </button>
          ))}
        </div>
        <Button type="primary" block onClick={() => { setNavOpen(false); setConfirm('submit'); }}>Submit the exam</Button>
      </div>
    );

    return (
      <Modal open footer={null} closable={false} keyboard={false} maskClosable={false} width="100%"
        wrapClassName="co-modal co-full" styles={{ content: { padding: 0, borderRadius: 0 }, body: { padding: 0 } }}>
        {contextHolder}
        <div className="co-run" onContextMenu={e => e.preventDefault()} onCopy={e => e.preventDefault()}>
          <header className="co-top">
            <div className="co-top-info">
              <div className="co-top-title">{series.name}</div>
              <div className="co-top-meta">Question {cur + 1} of {total} · {answered} answered</div>
            </div>
            <div className={`co-timer is-${tone}`} role="timer"><ClockCircleOutlined /> {fmtClock(timeLeft)}</div>
            {isNarrow && <Button icon={<AppstoreOutlined />} onClick={() => setNavOpen(true)} aria-label="All questions" />}
            {!isNarrow && <Button type="primary" onClick={() => setConfirm('submit')}>Submit</Button>}
            <Button icon={<CloseOutlined />} onClick={() => setConfirm('exit')} aria-label="Leave the exam">{!r.isMobile && 'Leave'}</Button>
          </header>
          <div className="co-progress"><span style={{ width: `${(answered / total) * 100}%` }} /></div>

          <div className="co-body">
            <main className="co-main">
              <article className="co-question" key={q.id}>
                <header className="co-q-head">
                  <span className="co-q-no">Question {cur + 1}</span>
                  <span className="co-level">{q.cefr_level}</span>
                  <span className="co-q-pts">{q.points} pts</span>
                </header>
                {q.has_image && (
                  <div className="co-image">
                    {imageUrl
                      ? <img src={imageUrl} alt="" draggable={false} onContextMenu={e => e.preventDefault()} />
                      : <div className="co-media-wait"><LoadingOutlined /> Loading image…</div>}
                  </div>
                )}
                {q.has_audio && (
                  <div className="co-audio">
                    <div className="co-label"><SoundOutlined /> Recording</div>
                    {audioUrl
                      ? <audio key={audioUrl} controls controlsList="nodownload noplaybackrate" onContextMenu={e => e.preventDefault()} src={audioUrl} />
                      : <div className="co-audio-wait"><LoadingOutlined /> Loading the recording…</div>}
                  </div>
                )}
                {q.question_text && <p className="co-q-text">{q.question_text}</p>}
                <div className="co-options" role="radiogroup" aria-label="Answer">
                  {OPTION_KEYS.map((k, i) => {
                    const sel = answers[q.id] === k;
                    return (
                      <button key={k} type="button" role="radio" aria-checked={sel}
                        className={`co-option${sel ? ' is-selected' : ''}`} onClick={() => setAnswers(p => ({ ...p, [q.id]: k }))}>
                        <span className="co-option-key">{k}</span>
                        <span className="co-option-text">{options[i]}</span>
                        <span className="co-option-check">{sel && <CheckOutlined />}</span>
                      </button>
                    );
                  })}
                </div>
              </article>
              <footer className="co-nav-bar">
                <Button icon={<LeftOutlined />} onClick={() => goTo(cur - 1)} disabled={cur === 0}>Previous</Button>
                {!isNarrow && <span className="co-hint">Use ← → to move, A–D to answer</span>}
                {cur === total - 1
                  ? <Button type="primary" onClick={() => setConfirm('submit')}>Review &amp; submit</Button>
                  : <Button type="primary" onClick={() => goTo(cur + 1)}>Next <RightOutlined /></Button>}
              </footer>
            </main>
            {!isNarrow && <aside className="co-side">{navigator}</aside>}
          </div>

          <Drawer placement="bottom" open={isNarrow && navOpen} onClose={() => setNavOpen(false)} title="Questions" height="auto"
            rootClassName="co-modal" styles={{ body: { padding: 16 } }}>
            {navigator}
          </Drawer>

          <Modal open={confirm !== null} onCancel={() => !submitting && setConfirm(null)} footer={null} centered width={420}
            wrapClassName="co-modal" closable={!submitting}>
            {confirm === 'submit' ? (
              <div className="co-confirm">
                <h3>Submit the exam?</h3>
                <p>You answered <strong>{answered}</strong> of <strong>{total}</strong> questions. Unanswered questions score zero.</p>
                <div className="co-actions">
                  <Button onClick={() => setConfirm(null)} disabled={submitting}>Keep going</Button>
                  <Button type="primary" loading={submitting} onClick={() => handleSubmit(false)}>Submit now</Button>
                </div>
              </div>
            ) : (
              <div className="co-confirm">
                <h3>Leave the exam?</h3>
                <p>Your answers will not be saved and this attempt will not count.</p>
                <div className="co-actions">
                  <Button onClick={() => setConfirm(null)}>Stay</Button>
                  <Button danger type="primary" onClick={() => { if (timerRef.current) clearInterval(timerRef.current); onBack(); }}>Leave</Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </Modal>
    );
  }

  /* ═══════════ RESULTS ═══════════ */
  if (phase === 'results' && result) {
    const pct = result.score_percentage;
    return (
      <Modal open centered width={680} footer={null} closable={false} wrapClassName="co-modal">
        <div className="co-results">
          <div className="co-results-head">
            <div className="co-overline">{result.is_auto_submitted ? "Time's up — submitted automatically" : 'Exam submitted'}</div>
            <div className="co-score">
              <strong>{pct}%</strong>
              <span className="co-level is-lg">{result.cefr_level}</span>
            </div>
            <dl className="co-facts">
              <div><dt>Correct</dt><dd>{result.correct_count}/{result.total_questions}</dd></div>
              <div><dt>Points</dt><dd>{result.earned_points}/{result.total_points}</dd></div>
              <div><dt>Time</dt><dd>{fmtClock(result.time_spent_seconds)}</dd></div>
            </dl>
          </div>
          <div className="co-correction">
            <div className="co-label">Correction</div>
            <ol>
              {result.answers.map((a, i) => {
                const q = series.questions.find(x => x.id === a.question_id) ?? series.questions[i];
                return (
                  <li key={a.question_id} className={a.is_correct ? 'is-correct' : 'is-wrong'}>
                    <span className="co-corr-icon">{a.is_correct ? <CheckCircleFilled /> : <CloseCircleFilled />}</span>
                    <span className="co-corr-main">
                      <span className="co-corr-q">{i + 1}. {q?.question_text || `Question ${i + 1}`}</span>
                      <span className="co-corr-a">
                        Your answer: <strong>{a.selected_answer || '—'}</strong>
                        {!a.is_correct && <> · Correct: <strong>{a.correct_answer}</strong></>}
                      </span>
                    </span>
                    <span className="co-level">{a.cefr_level}</span>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="co-actions">
            <Button onClick={onBack}>Back to the series</Button>
            <Button type="primary" onClick={() => { setResult(null); setPhase('intro'); }}>Try again</Button>
          </div>
        </div>
      </Modal>
    );
  }
  return null;
};

export default COQuizTaking;
