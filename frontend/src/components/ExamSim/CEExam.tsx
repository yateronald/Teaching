import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Image, Modal, Segmented, Skeleton, message } from 'antd';
import {
  AppstoreOutlined, CheckCircleFilled, ClockCircleOutlined, CloseCircleFilled, CloudOutlined, CloudSyncOutlined,
  ExpandOutlined, FileSearchOutlined, FlagFilled, FlagOutlined, LeftOutlined, LoadingOutlined, MinusCircleFilled,
  ReadOutlined, ReloadOutlined, RightOutlined, SendOutlined, TrophyOutlined, WarningOutlined, ZoomInOutlined, ZoomOutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useExamGuard from '../../hooks/useExamGuard';
import ExamFrame from './ExamFrame';
import { clock } from './examModel';
import CeDocument from '../Common/CeDocument';
import { ceDocumentHasImageSlot } from '../Common/ceDocumentModel';
import './CEExam.css';

/* ══════════════════════════════════════════
   TCF — Compréhension écrite, the reading exam room.
   One document per question, 60 minutes, 699 points, levels A1 → C2.
   Answers are saved on the server as the candidate goes (a reload or a lost
   connection resumes the attempt); the server's clock is the reference.
   Documents are downloaded once, in the background, while the briefing is read.
══════════════════════════════════════════ */

type Option = 'A' | 'B' | 'C' | 'D';
interface Question {
  id: number; question_order: number; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string;
  cefr_level: string; points: number | string; has_image: boolean;
  /** The document as text (series imported since documents come as text); otherwise it is an image. */
  passage_text?: string | null;
}
interface Series {
  id: number; name: string; description: string | null; duration_minutes: number; total_questions: number; total_points: number | string;
  questions: Question[];
  best_attempt: { earned_points: number | string; total_points: number | string; cefr_level: string; nclc: number | null } | null;
  attempt_count: number;
  running: { attempt_id: number; remaining_seconds: number; answered: number } | null;
}
interface Graded { question_id: number; selected_answer: Option | null; correct_answer: Option; is_correct: boolean; points: number; cefr_level: string }
interface Level { level: string; questions: number; correct: number; points: number; max_points: number }
interface Result {
  attempt_id: number; correct_count: number; total_questions: number; earned_points: number; total_points: number;
  cefr_level: string; nclc: number | null; time_spent_seconds: number; is_auto_submitted: boolean; late: boolean;
  next: { cefr: { level: string; points: number; missing: number } | null; nclc: { nclc: number; points: number; missing: number } | null };
  levels: Level[]; answers: Graded[];
  /** Why each answer is right, by question id (when the series has explanations). */
  explanations?: Record<number, string>;
}
type Phase = 'loading' | 'brief' | 'exam' | 'review' | 'submitting' | 'results' | 'error';
type SaveState = 'saved' | 'dirty' | 'saving' | 'offline';
interface Props { seriesId: number; open: boolean; onClose: () => void }

const OPTIONS: Option[] = ['A', 'B', 'C', 'D'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LEVEL_NAME: Record<string, string> = { A1: 'Découverte', A2: 'Survie', B1: 'Seuil', B2: 'Avancé', C1: 'Autonome', C2: 'Maîtrise' };
const PRELOAD_CONCURRENCY = 4;
const SAVE_DELAY_MS = 800;
const optionText = (q: Question, k: Option) => ({ A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d }[k]);
const toneOfLevel = (level: string | null | undefined) => (!level ? 'is-none' : ['A1', 'A2'].includes(level) ? 'is-low' : level === 'B1' ? 'is-mid' : level === 'B2' ? 'is-good' : 'is-top');
const minutes = (s: number) => `${Math.max(1, Math.round(s / 60))} min`;
const errorOf = async (res: Response, fallback: string) => (await res.json().catch(() => ({})))?.error || fallback;

/* ── Documents: fetched once as blobs (served as images only to learners the series is open to) ── */
function useDocuments(questions: Question[], active: boolean) {
  const { token } = useAuth();
  const api = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const [urls, setUrls] = useState<Record<number, string>>({});
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const jobs = useRef(new Map<number, Promise<void>>());
  const made = useRef<string[]>([]);

  const load = useCallback((id: number) => {
    const running = jobs.current.get(id);
    if (running) return running;
    const job = (async () => {
      try {
        const res = await fetch(`${api}/tcf/student/ce/questions/${id}/image`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const url = URL.createObjectURL(await res.blob());
        made.current.push(url);
        setUrls(u => ({ ...u, [id]: url }));
        setFailed(f => (f[id] ? { ...f, [id]: false } : f));
      } catch {
        jobs.current.delete(id); // a later attempt may succeed
        setFailed(f => ({ ...f, [id]: true }));
      }
    })();
    jobs.current.set(id, job);
    return job;
  }, [api, token]);

  useEffect(() => () => { made.current.forEach(u => URL.revokeObjectURL(u)); }, []);

  // Background preload, in exam order, a few at a time
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const queue = questions.filter(q => q.has_image).map(q => q.id);
    let next = 0;
    const worker = async () => { while (!cancelled && next < queue.length) await load(queue[next++]); };
    void Promise.all(Array.from({ length: PRELOAD_CONCURRENCY }, worker));
    return () => { cancelled = true; };
  }, [questions, active, load]);

  const total = questions.filter(q => q.has_image).length;
  const done = Object.keys(urls).length;
  return { urls, failed, load, total, done };
}

/* ── Document viewer: fit to width, zoom, full screen ── */
const DocViewer: React.FC<{ q: Question; url?: string; failed?: boolean; onRetry: () => void; compact?: boolean }> = ({ q, url, failed, onRetry, compact }) => {
  const [zoom, setZoom] = useState(1);
  const [full, setFull] = useState(false);
  useEffect(() => { setZoom(1); }, [q.id]);
  if (!q.has_image) return null;
  return (
    <section className={`ce-doc${compact ? ' is-compact' : ''}`} aria-label={`Document de la question ${q.question_order}`}>
      <header className="ce-doc-bar">
        <span className="ce-doc-title"><FileSearchOutlined /> Document {q.question_order}</span>
        {url && (
          <span className="ce-doc-tools">
            <Button size="small" type="text" icon={<ZoomOutOutlined />} disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - 0.25))} aria-label="Réduire" />
            <button type="button" className="ce-doc-zoom" onClick={() => setZoom(1)} aria-label="Ajuster à la largeur">{Math.round(zoom * 100)} %</button>
            <Button size="small" type="text" icon={<ZoomInOutlined />} disabled={zoom >= 2.5} onClick={() => setZoom(z => Math.min(2.5, z + 0.25))} aria-label="Agrandir" />
            <Button size="small" type="text" icon={<ExpandOutlined />} onClick={() => setFull(true)} aria-label="Plein écran" />
          </span>
        )}
      </header>
      <div className="ce-doc-view">
        {url ? (
          <img src={url} alt={`Document de la question ${q.question_order}`} draggable={false} style={zoom > 1 ? { width: `${zoom * 100}%`, maxWidth: 'none', flexShrink: 0 } : undefined}
            onDoubleClick={() => setZoom(z => (z === 1 ? 1.75 : 1))} onContextMenu={e => e.preventDefault()} />
        ) : failed ? (
          <div className="ce-doc-state is-error" role="alert">
            <WarningOutlined /><span>Le document n’a pas pu être chargé.</span>
            <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>Réessayer</Button>
          </div>
        ) : (
          <div className="ce-doc-state"><LoadingOutlined /> Chargement du document…</div>
        )}
      </div>
      {url && (
        <Image src={url} style={{ display: 'none' }} preview={{ visible: full, onVisibleChange: setFull, src: url, getContainer: () => document.body }} />
      )}
    </section>
  );
};

/* ── Text document: the text itself, with a reading size the learner chooses (kept on this device) ── */
const DOC_SIZES = [15, 16.5, 18, 20];
const DOC_SIZE_KEY = 'ce-doc-size';
function useDocSize() {
  const [size, setSize] = useState<number>(() => {
    try { const v = Number(localStorage.getItem(DOC_SIZE_KEY)); return DOC_SIZES.includes(v) ? v : DOC_SIZES[1]; } catch { return DOC_SIZES[1]; }
  });
  const change = (dir: 1 | -1) => setSize(cur => {
    const next = DOC_SIZES[Math.min(DOC_SIZES.length - 1, Math.max(0, DOC_SIZES.indexOf(cur) + dir))] ?? cur;
    try { localStorage.setItem(DOC_SIZE_KEY, String(next)); } catch { /* size stays for this visit */ }
    return next;
  });
  return { size, change };
}

const TextDocument: React.FC<{
  q: Question; size: number; onSize?: (dir: 1 | -1) => void; compact?: boolean;
  imageUrl?: string; imageFailed?: boolean; onRetry?: () => void;
}> = ({ q, size, onSize, compact, imageUrl, imageFailed, onRetry }) => {
  // The document's image (when it needs one) sits where the text says, or after it.
  const image = () => (imageUrl
    ? <img src={imageUrl} alt={`Image du document ${q.question_order}`} draggable={false} />
    : imageFailed
      ? <span className="ce-doc-state is-error" role="alert"><WarningOutlined /> L’image n’a pas pu être chargée. <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>Réessayer</Button></span>
      : <span className="ce-doc-state"><LoadingOutlined /> Chargement de l’image…</span>);
  return (
    <section className={`ce-doc is-text${compact ? ' is-compact' : ''}`} aria-label={`Document de la question ${q.question_order}`}>
      <header className="ce-doc-bar">
        <span className="ce-doc-title"><FileSearchOutlined /> Document {q.question_order}</span>
        {onSize && (
          <span className="ce-doc-tools" role="group" aria-label="Taille du texte">
            <Button size="small" type="text" onClick={() => onSize(-1)} disabled={size <= DOC_SIZES[0]} aria-label="Texte plus petit">A−</Button>
            <Button size="small" type="text" onClick={() => onSize(1)} disabled={size >= DOC_SIZES[DOC_SIZES.length - 1]} aria-label="Texte plus grand"><b>A+</b></Button>
          </span>
        )}
      </header>
      <div className="ce-doc-text" style={{ fontSize: size }} onContextMenu={e => e.preventDefault()}>
        <CeDocument text={q.passage_text || ''} renderImage={q.has_image ? image : undefined} />
        {q.has_image && !ceDocumentHasImageSlot(q.passage_text || '') && <div className="cedoc-image">{image()}</div>}
      </div>
    </section>
  );
};

/** The document of a question, whichever form it has. */
const QuestionDocument: React.FC<{
  q: Question; docs: ReturnType<typeof useDocuments>; size: number; onSize?: (dir: 1 | -1) => void; compact?: boolean;
}> = ({ q, docs, size, onSize, compact }) => (q.passage_text
  ? <TextDocument q={q} size={size} onSize={onSize} compact={compact} imageUrl={docs.urls[q.id]} imageFailed={docs.failed[q.id]} onRetry={() => void docs.load(q.id)} />
  : <DocViewer q={q} url={docs.urls[q.id]} failed={docs.failed[q.id]} onRetry={() => void docs.load(q.id)} compact={compact} />);

/* ── Question navigator, grouped by level like the exam's progression ── */
const Navigator: React.FC<{
  questions: Question[]; answers: Record<number, Option>; flags: Set<number>; cur: number; onGo: (i: number) => void;
}> = ({ questions, answers, flags, cur, onGo }) => (
  <div className="ce-nav" role="navigation" aria-label="Questions">
    {LEVELS.map(level => {
      const items = questions.map((q, i) => ({ q, i })).filter(x => x.q.cefr_level === level);
      if (!items.length) return null;
      return (
        <div key={level} className="ce-nav-group">
          <span className="ce-nav-level">{level}</span>
          <div className="ce-nav-cells">
            {items.map(({ q, i }) => (
              <button key={q.id} type="button" onClick={() => onGo(i)} aria-current={i === cur ? 'step' : undefined}
                aria-label={`Question ${q.question_order}${answers[q.id] ? ', répondue' : ', sans réponse'}${flags.has(q.id) ? ', à relire' : ''}`}
                className={`ce-cell${answers[q.id] ? ' is-answered' : ''}${flags.has(q.id) ? ' is-flagged' : ''}${i === cur ? ' is-current' : ''}`}>
                {q.question_order}
              </button>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const SaveBadge: React.FC<{ state: SaveState }> = ({ state }) => (
  <span className={`xs-save is-${state}`} aria-live="polite">
    {state === 'saving' ? <CloudSyncOutlined /> : <CloudOutlined />}
    {state === 'saving' ? 'Enregistrement…' : state === 'offline' ? 'Hors ligne — nouvel essai' : state === 'dirty' ? 'Modifications…' : 'Réponses enregistrées'}
  </span>
);

/* ══════════════════════════════════════════ */
export default function CEExam({ seriesId, open, onClose }: Props) {
  const { apiCall } = useAuth();
  const [msg, msgHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  useExamGuard(open, t => msg.warning({ content: t, key: 'exam-guard' }));

  const [phase, setPhase] = useState<Phase>('loading');
  const [series, setSeries] = useState<Series | null>(null);
  const [loadError, setLoadError] = useState('');
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, Option>>({});
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [cur, setCur] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [save, setSave] = useState<SaveState>('saved');
  const [starting, setStarting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [narrow, setNarrow] = useState(() => window.innerWidth < 960);

  const questions = useMemo(() => series?.questions || [], [series]);
  const docs = useDocuments(questions, open && !!series);
  const docSize = useDocSize();
  const submitted = useRef(false);
  const saveTimer = useRef<number | null>(null);
  const saveSeq = useRef(0);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 960);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* ── Load the series ── */
  const loadSeries = useCallback(async () => {
    setPhase('loading');
    setLoadError('');
    try {
      const res = await apiCall(`/tcf/student/ce/series/${seriesId}`);
      if (!res.ok) throw new Error(await errorOf(res, 'Cette série n’a pas pu être ouverte.'));
      setSeries(await res.json());
      setPhase('brief');
    } catch (e) {
      setLoadError((e as Error).message);
      setPhase('error');
    }
  }, [apiCall, seriesId]);

  useEffect(() => {
    if (!open) return;
    submitted.current = false;
    setResult(null); setAnswers({}); setFlags(new Set()); setCur(0); setSubmitError('');
    loadSeries();
  }, [open, loadSeries]);

  /* ── Start or resume ── */
  const start = async (restart = false) => {
    if (!series) return;
    setStarting(true);
    try {
      const res = await apiCall(`/tcf/student/ce/series/${seriesId}/start`, { method: 'POST', body: JSON.stringify({ restart }) });
      if (!res.ok) throw new Error(await errorOf(res, 'L’épreuve n’a pas pu démarrer.'));
      const d: { attempt_id: number; remaining_seconds: number; answers: { question_id: number; selected_answer: Option | null; flagged: boolean }[]; resumed: boolean } = await res.json();
      const given: Record<number, Option> = {};
      const flagged = new Set<number>();
      d.answers.forEach(a => { if (a.selected_answer) given[a.question_id] = a.selected_answer; if (a.flagged) flagged.add(a.question_id); });
      setAttemptId(d.attempt_id);
      setAnswers(given);
      setFlags(flagged);
      const firstOpen = series.questions.findIndex(q => !given[q.id]);
      setCur(d.resumed && firstOpen > 0 ? firstOpen : 0);
      setDeadline(Date.now() + d.remaining_seconds * 1000);
      setNow(Date.now());
      setSave('saved');
      submitted.current = false;
      setPhase('exam');
      if (d.resumed) msg.info(`Épreuve reprise : ${Object.keys(given).length} réponse(s) retrouvée(s).`);
    } catch (e) {
      msg.error((e as Error).message);
    } finally {
      setStarting(false);
    }
  };

  const confirmRestart = () => modal.confirm({
    title: 'Recommencer à zéro ?',
    content: 'Les réponses de votre tentative en cours seront effacées et un nouveau chronomètre de 60 minutes démarrera.',
    okText: 'Recommencer', cancelText: 'Annuler', okButtonProps: { danger: true },
    onOk: () => start(true),
  });

  /* ── Autosave (debounced) ── */
  const draft = useCallback(() => questions
    .filter(q => answers[q.id] || flags.has(q.id))
    .map(q => ({ question_id: q.id, selected_answer: answers[q.id] || null, flagged: flags.has(q.id) })), [questions, answers, flags]);

  const pushSave = useCallback(async () => {
    if (!attemptId || submitted.current) return;
    const seq = ++saveSeq.current;
    setSave('saving');
    try {
      const res = await apiCall(`/tcf/student/ce/attempts/${attemptId}/progress`, { method: 'PUT', body: JSON.stringify({ answers: draft() }) });
      if (res.status === 409) { submitRef.current(true); return; } // time is up on the server
      if (!res.ok) throw new Error();
      const d = await res.json().catch(() => null);
      if (d && typeof d.remaining_seconds === 'number') setDeadline(Date.now() + d.remaining_seconds * 1000); // follow the server clock
      if (seq === saveSeq.current) setSave('saved');
    } catch {
      if (seq === saveSeq.current) setSave('offline');
    }
  }, [attemptId, apiCall, draft]);

  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current || (phase !== 'exam' && phase !== 'review')) return;
    setSave('dirty');
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(pushSave, SAVE_DELAY_MS);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [answers, flags]); // eslint-disable-line react-hooks/exhaustive-deps

  // Offline: keep trying every 10 seconds
  useEffect(() => {
    if (save !== 'offline') return;
    const id = window.setInterval(pushSave, 10_000);
    return () => window.clearInterval(id);
  }, [save, pushSave]);

  // Warn before leaving the page while answers are not saved yet
  useEffect(() => {
    if (!open || save === 'saved') return;
    const onBefore = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, [open, save]);

  const choose = (q: Question, k: Option) => { touched.current = true; setAnswers(a => ({ ...a, [q.id]: k })); };
  const clearAnswer = (q: Question) => { touched.current = true; setAnswers(a => { const n = { ...a }; delete n[q.id]; return n; }); };
  const toggleFlag = (q: Question) => { touched.current = true; setFlags(f => { const n = new Set(f); if (n.has(q.id)) n.delete(q.id); else n.add(q.id); return n; }); };
  const goTo = (i: number) => { if (i >= 0 && i < questions.length) { setCur(i); setNavOpen(false); } };

  /* ── Submit ── */
  const submit = useCallback(async (auto: boolean) => {
    if (!attemptId || submitted.current) return;
    submitted.current = true;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    setPhase('submitting');
    setSubmitError('');
    const body = JSON.stringify({ attempt_id: attemptId, is_auto_submitted: auto, answers: questions.map(q => ({ question_id: q.id, selected_answer: answers[q.id] || null })) });
    for (let i = 0; i < 3; i++) {
      try {
        const res = await apiCall(`/tcf/student/ce/series/${seriesId}/submit`, { method: 'POST', body });
        if (!res.ok) throw new Error(await errorOf(res, 'La copie n’a pas pu être remise.'));
        setResult(await res.json());
        setSave('saved');
        setPhase('results');
        return;
      } catch (e) {
        if (i === 2) { setSubmitError((e as Error).message || 'La copie n’a pas pu être remise.'); submitted.current = false; setPhase('review'); return; }
        await new Promise(r => setTimeout(r, 1500 * (i + 1)));
      }
    }
  }, [attemptId, apiCall, seriesId, questions, answers]);
  const submitRef = useRef(submit);
  submitRef.current = submit;

  /* ── Clock ── */
  const remaining = Math.max(0, Math.round((deadline - now) / 1000));
  useEffect(() => {
    if (phase !== 'exam' && phase !== 'review') return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase]);
  useEffect(() => {
    if ((phase === 'exam' || phase === 'review') && deadline && remaining <= 0 && !submitted.current) {
      msg.warning('Temps écoulé : votre copie est remise automatiquement.');
      submitRef.current(true);
    }
  }, [remaining, phase, deadline, msg]);

  /* ── Keyboard: ← → to move, A–D (or 1–4) to answer, R to flag ── */
  useEffect(() => {
    if (phase !== 'exam') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || (e.target as HTMLElement)?.closest?.('input, textarea, .ant-modal, .ant-image-preview-root')) return;
      const q = questions[cur];
      if (!q) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(cur + 1); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(cur - 1); return; }
      const k = e.key.toUpperCase();
      if (k === 'R') { toggleFlag(q); return; }
      const pick = (OPTIONS as string[]).includes(k) ? k as Option : /^[1-4]$/.test(e.key) ? OPTIONS[Number(e.key) - 1] : null;
      if (pick) choose(q, pick);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // re-bound each render: always sees the current question

  // The question on screen jumps the download queue
  useEffect(() => {
    const q = questions[cur];
    if (phase === 'exam' && q?.has_image && !docs.urls[q.id]) void docs.load(q.id);
  }, [phase, cur, questions]); // eslint-disable-line react-hooks/exhaustive-deps

  const exit = () => {
    if (phase === 'exam' || phase === 'review') {
      modal.confirm({
        title: 'Quitter l’épreuve ?',
        content: 'Vos réponses sont enregistrées. Vous pourrez reprendre tant que le temps n’est pas écoulé — le chronomètre continue pendant votre absence.',
        okText: 'Quitter', cancelText: 'Rester',
        onOk: async () => { await pushSave(); onClose(); },
      });
      return;
    }
    onClose();
  };

  if (!open) return null;

  const total = (series?.duration_minutes || 60) * 60;
  const answeredCount = questions.filter(q => answers[q.id]).length;
  const q = questions[cur];
  const inExam = phase === 'exam' || phase === 'review';

  return (
    <ExamFrame
      skill="ce"
      title={series?.name || 'Compréhension écrite'}
      subtitle={`TCF Canada · Compréhension écrite${series ? ` · ${series.total_questions} questions` : ''}`}
      onExit={exit}
      exitLabel={inExam ? 'Quitter (le temps continue)' : 'Fermer'}
      timer={inExam ? { seconds: remaining, total } : null}
      right={inExam ? (
        <>
          <SaveBadge state={save} />
          {phase === 'exam' && <Button type="primary" icon={<SendOutlined />} onClick={() => setPhase('review')} className="xs-submit">Terminer</Button>}
        </>
      ) : null}
    >
      {msgHolder}{modalHolder}

      {phase === 'loading' && <div className="xs-pad"><Skeleton active paragraph={{ rows: 8 }} /></div>}

      {phase === 'error' && (
        <div className="xs-pad ce-center">
          <WarningOutlined className="ce-big-icon is-bad" />
          <h2>La série n’a pas pu être ouverte</h2>
          <p className="xs-lead">{loadError}</p>
          <div className="xs-actions"><Button onClick={onClose}>Fermer</Button><Button type="primary" icon={<ReloadOutlined />} onClick={loadSeries}>Réessayer</Button></div>
        </div>
      )}

      {/* ═══════════ BRIEFING ═══════════ */}
      {phase === 'brief' && series && (
        <div className="xs-brief">
          <div className="xs-brief-main">
            <span className="xs-eyebrow">Épreuve de compréhension écrite · format TCF Canada</span>
            <h1>{series.total_questions} documents, {series.duration_minutes} minutes.</h1>
            <p className="xs-lead" style={{ whiteSpace: 'pre-line' }}>
              {series.description?.trim() || 'Lisez chaque document et choisissez la bonne réponse parmi quatre propositions. Les documents deviennent plus longs et plus complexes au fil de l’épreuve.'}
            </p>
            <div className="ce-facts">
              <div><b>{series.total_questions}</b><span>questions</span></div>
              <div><b>{series.duration_minutes} min</b><span>au total</span></div>
              <div><b>{Math.round(Number(series.total_points))}</b><span>points</span></div>
              <div><b>A1 → C2</b><span>niveaux</span></div>
            </div>
            <ol className="ce-ladder" aria-label="Progression de l’épreuve">
              {LEVELS.map(level => {
                const items = series.questions.filter(x => x.cefr_level === level);
                if (!items.length) return null;
                return (
                  <li key={level} className={toneOfLevel(level)}>
                    <b>{level}</b>
                    <span>Questions {items[0].question_order}–{items[items.length - 1].question_order}</span>
                    <em>{Number(items[0].points)} pts chacune</em>
                  </li>
                );
              })}
            </ol>
          </div>

          <aside className="xs-brief-side">
            {series.running ? (
              <div className="xs-card is-accent">
                <h3 className="xs-side-title"><ClockCircleOutlined /> Une épreuve est en cours</h3>
                <p className="xs-side-text">
                  {series.running.answered} réponse{series.running.answered > 1 ? 's' : ''} enregistrée{series.running.answered > 1 ? 's' : ''} ·
                  il reste <b>{clock(series.running.remaining_seconds)}</b> au chronomètre.
                </p>
                <Button type="primary" block size="large" loading={starting} onClick={() => start(false)}>Reprendre l’épreuve</Button>
                <Button block type="text" className="ce-restart" disabled={starting} onClick={confirmRestart}>Recommencer à zéro</Button>
              </div>
            ) : (
              <div className="xs-card is-accent">
                <h3 className="xs-side-title"><ReadOutlined /> Prêt ?</h3>
                <p className="xs-side-text">Le chronomètre démarre dès que vous commencez et continue même si vous quittez la page. Vos réponses sont enregistrées au fur et à mesure.</p>
                <Button type="primary" block size="large" loading={starting} onClick={() => start(false)}>Commencer l’épreuve</Button>
              </div>
            )}

            <div className="xs-card">
              <h3 className="xs-side-title"><FileSearchOutlined /> Consignes</h3>
              <ul className="xs-rules">
                <li><CheckCircleFilled /><span><b>Une seule bonne réponse</b> par question. Une réponse fausse ne retire pas de points.</span></li>
                <li><CheckCircleFilled /><span><b>Naviguez librement</b> et marquez les questions à relire.</span></li>
                <li><CheckCircleFilled /><span>Raccourcis : <b>A–D</b> pour répondre, <b>← →</b> pour changer de question, <b>R</b> pour marquer.</span></li>
                <li><CheckCircleFilled /><span>À la fin du temps, <b>votre copie est remise automatiquement</b>.</span></li>
              </ul>
              {docs.total > 0 && (
                <div className="ce-preload" aria-live="polite">
                  <span>{docs.done >= docs.total ? <><CheckCircleFilled /> Documents prêts</> : <><LoadingOutlined /> Préparation des documents · {docs.done}/{docs.total}</>}</span>
                  <i><b style={{ width: `${docs.total ? (docs.done / docs.total) * 100 : 100}%` }} /></i>
                </div>
              )}
            </div>

            {series.best_attempt && (
              <div className="xs-card ce-best">
                <TrophyOutlined />
                <div>
                  <span>Meilleur résultat · {series.attempt_count} tentative{series.attempt_count > 1 ? 's' : ''}</span>
                  <b>{Math.round(Number(series.best_attempt.earned_points))} / {Math.round(Number(series.best_attempt.total_points)) || 699}</b>
                </div>
                <span className={`xs-badge ${toneOfLevel(series.best_attempt.cefr_level)}`}>{series.best_attempt.cefr_level}</span>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ═══════════ EXAM ═══════════ */}
      {phase === 'exam' && q && (
        <div className={`ce-room${q.has_image || q.passage_text ? '' : ' is-textonly'}`}>
          <div className="ce-progress" aria-hidden><b style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>

          <QuestionDocument q={q} docs={docs} size={docSize.size} onSize={docSize.change} compact={narrow} />

          <section className="ce-question" aria-labelledby={`ce-q-${q.id}`}>
            <header className="ce-q-head">
              <span className="ce-q-no" id={`ce-q-${q.id}`}>Question {q.question_order} <em>/ {questions.length}</em></span>
              <span className={`xs-badge ${toneOfLevel(q.cefr_level)}`}>{q.cefr_level}</span>
              <span className="ce-q-pts">{Number(q.points)} pts</span>
              <button type="button" className={`ce-flag${flags.has(q.id) ? ' is-on' : ''}`} onClick={() => toggleFlag(q)} aria-pressed={flags.has(q.id)}>
                {flags.has(q.id) ? <FlagFilled /> : <FlagOutlined />}<span>{flags.has(q.id) ? 'À relire' : 'Marquer'}</span>
              </button>
            </header>

            {q.question_text?.trim()
              ? <p className="ce-q-text">{q.question_text}</p>
              : q.passage_text
                ? <p className="ce-q-text is-hint"><FileSearchOutlined /> Lisez le document, puis choisissez la bonne réponse.</p>
                : <p className="ce-q-text is-hint"><FileSearchOutlined /> La question est écrite sous le document.</p>}

            <div className="ce-options" role="radiogroup" aria-label="Réponses">
              {OPTIONS.map(k => {
                const on = answers[q.id] === k;
                return (
                  <button key={k} type="button" role="radio" aria-checked={on} className={`ce-option${on ? ' is-on' : ''}`} onClick={() => choose(q, k)}>
                    <span className="ce-option-key">{k}</span>
                    <span className="ce-option-text">{optionText(q, k)}</span>
                  </button>
                );
              })}
            </div>
            {answers[q.id] && <button type="button" className="ce-clear" onClick={() => clearAnswer(q)}>Effacer ma réponse</button>}

            <footer className="ce-q-foot">
              <Button icon={<LeftOutlined />} onClick={() => goTo(cur - 1)} disabled={cur === 0}>Précédente</Button>
              {narrow && <Button icon={<AppstoreOutlined />} onClick={() => setNavOpen(true)}>{answeredCount}/{questions.length}</Button>}
              {cur === questions.length - 1
                ? <Button type="primary" onClick={() => setPhase('review')}>Vérifier ma copie <RightOutlined /></Button>
                : <Button type="primary" onClick={() => goTo(cur + 1)}>Suivante <RightOutlined /></Button>}
            </footer>
          </section>

          {!narrow && (
            <div className="ce-nav-bar">
              <div className="ce-nav-summary"><b>{answeredCount}</b> / {questions.length} répondues{flags.size > 0 && <> · <FlagFilled /> {flags.size} à relire</>}</div>
              <Navigator questions={questions} answers={answers} flags={flags} cur={cur} onGo={goTo} />
            </div>
          )}
          <Drawer placement="bottom" open={narrow && navOpen} onClose={() => setNavOpen(false)} title={`${answeredCount} / ${questions.length} répondues`} height="auto" rootClassName="ce-drawer">
            <Navigator questions={questions} answers={answers} flags={flags} cur={cur} onGo={goTo} />
          </Drawer>
        </div>
      )}

      {/* ═══════════ REVIEW BEFORE HANDING IN ═══════════ */}
      {(phase === 'review' || phase === 'submitting') && series && (
        <div className="xs-pad ce-review">
          <span className="xs-eyebrow">Avant de remettre votre copie</span>
          <h1>{answeredCount === questions.length ? 'Toutes les questions ont une réponse.' : `${questions.length - answeredCount} question${questions.length - answeredCount > 1 ? 's' : ''} sans réponse.`}</h1>
          <p className="xs-lead">Une question sans réponse rapporte 0 point, comme une réponse fausse : mieux vaut toujours choisir. Cliquez sur un numéro pour y revenir.</p>
          <div className="ce-review-stats">
            <div className="is-ok"><b>{answeredCount}</b><span>répondues</span></div>
            <div className={questions.length - answeredCount ? 'is-warn' : ''}><b>{questions.length - answeredCount}</b><span>sans réponse</span></div>
            <div className={flags.size ? 'is-flag' : ''}><b>{flags.size}</b><span>à relire</span></div>
            <div><b>{clock(remaining)}</b><span>restantes</span></div>
          </div>
          <div className="xs-card"><Navigator questions={questions} answers={answers} flags={flags} cur={-1} onGo={i => { goTo(i); setPhase('exam'); }} /></div>
          {submitError && <p className="xs-note is-warn" role="alert"><WarningOutlined /> {submitError} Vos réponses restent enregistrées : réessayez.</p>}
          <div className="xs-actions">
            <Button size="large" onClick={() => setPhase('exam')} disabled={phase === 'submitting'}>Revenir à l’épreuve</Button>
            <Button size="large" type="primary" icon={<SendOutlined />} loading={phase === 'submitting'} onClick={() => submit(false)}>Remettre ma copie</Button>
          </div>
        </div>
      )}

      {/* ═══════════ RESULTS ═══════════ */}
      {phase === 'results' && result && series && (
        <Results result={result} series={series} docs={docs} onClose={onClose} onRetry={() => { setResult(null); setAnswers({}); setFlags(new Set()); loadSeries(); }} />
      )}
    </ExamFrame>
  );
}

/* ══════════ Results and correction ══════════ */
const Results: React.FC<{
  result: Result; series: Series; docs: ReturnType<typeof useDocuments>; onClose: () => void; onRetry: () => void;
}> = ({ result, series, docs, onClose, onRetry }) => {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'blank'>('wrong');
  const docSize = useDocSize();
  const [openId, setOpenId] = useState<number | null>(null);
  const byId = useMemo(() => new Map(series.questions.map(q => [q.id, q])), [series]);
  const earned = Math.round(Number(result.earned_points));
  const max = Math.round(Number(result.total_points)) || 699;
  const wrong = result.answers.filter(a => !a.is_correct && a.selected_answer).length;
  const blank = result.answers.filter(a => !a.selected_answer).length;
  const shown = result.answers.filter(a => filter === 'all' || (filter === 'wrong' ? !a.is_correct && a.selected_answer : !a.selected_answer));

  return (
    <div className="xs-report">
      <section className="xs-hero" aria-label="Résultat">
        <div className="xs-hero-score">
          <span className="xs-eyebrow">Score · Compréhension écrite</span>
          <div className="xs-bigscore"><strong>{earned}</strong><span>/ {max}</span></div>
          <div className="xs-badges">
            <span className={`xs-badge ${toneOfLevel(result.cefr_level)}`}>CECR {result.cefr_level}<em>{LEVEL_NAME[result.cefr_level]}</em></span>
            <span className="xs-badge is-nclc">{result.nclc ? `NCLC ${result.nclc}` : 'Sous NCLC 4'}</span>
          </div>
        </div>
        <div className="xs-hero-text">
          <h2>{result.correct_count} bonne{result.correct_count > 1 ? 's' : ''} réponse{result.correct_count > 1 ? 's' : ''} sur {result.total_questions}</h2>
          <p>Temps utilisé : {minutes(result.time_spent_seconds)} sur {series.duration_minutes}. {wrong ? `${wrong} erreur${wrong > 1 ? 's' : ''}` : 'Aucune erreur'}{blank ? ` et ${blank} question${blank > 1 ? 's' : ''} sans réponse.` : '.'}</p>
          {result.late && <p className="xs-note is-warn"><WarningOutlined /> Copie remise après la fin du temps : ce sont les réponses enregistrées à temps qui ont été corrigées.</p>}
          {!result.late && result.is_auto_submitted && <p className="xs-note is-warn"><ClockCircleOutlined /> Temps écoulé : copie remise automatiquement.</p>}
          <ul className="ce-next">
            {result.next.cefr && <li><TrophyOutlined /> Encore <b>{result.next.cefr.missing} points</b> pour atteindre <b>{result.next.cefr.level}</b> ({result.next.cefr.points} points).</li>}
            {result.next.nclc && <li><TrophyOutlined /> Encore <b>{result.next.nclc.missing} points</b> pour <b>NCLC {result.next.nclc.nclc}</b> ({result.next.nclc.points} points).</li>}
            {!result.next.cefr && !result.next.nclc && <li><TrophyOutlined /> Niveau maximal de l’épreuve atteint.</li>}
          </ul>
        </div>
      </section>

      <section className="xs-card">
        <header className="xs-card-head"><TrophyOutlined /><h3>Résultat par niveau</h3><span className="xs-card-note">Points obtenus sur les points possibles</span></header>
        <div className="ce-levels">
          {result.levels.map(l => (
            <div key={l.level} className={`ce-level ${toneOfLevel(l.level)}`}>
              <b className="ce-level-tag">{l.level}</b>
              <span className="ce-level-name">{LEVEL_NAME[l.level]}<em>{l.correct}/{l.questions} bonnes réponses</em></span>
              <i className="ce-level-bar"><b style={{ width: `${l.max_points ? (l.points / l.max_points) * 100 : 0}%` }} /></i>
              <span className="ce-level-pts">{l.points}<em> / {l.max_points}</em></span>
            </div>
          ))}
        </div>
      </section>

      <section className="xs-card">
        <header className="xs-card-head ce-corr-head">
          <FileSearchOutlined /><h3>Correction</h3>
          <Segmented size="small" value={filter} onChange={v => setFilter(v as typeof filter)} options={[
            { value: 'wrong', label: `Erreurs ${wrong}` },
            { value: 'blank', label: `Sans réponse ${blank}` },
            { value: 'all', label: `Toutes ${result.answers.length}` },
          ]} />
        </header>
        {shown.length === 0 ? (
          <p className="ce-empty">{filter === 'wrong' ? 'Aucune erreur : bravo !' : filter === 'blank' ? 'Vous avez répondu à toutes les questions.' : 'Aucune question.'}</p>
        ) : (
          <ol className="ce-corr">
            {shown.map(a => {
              const qq = byId.get(a.question_id);
              if (!qq) return null;
              const status = !a.selected_answer ? 'blank' : a.is_correct ? 'ok' : 'ko';
              const isOpen = openId === qq.id;
              return (
                <li key={qq.id} className={`ce-corr-item is-${status}${isOpen ? ' is-open' : ''}`}>
                  <button type="button" className="ce-corr-row" aria-expanded={isOpen} onClick={() => { setOpenId(isOpen ? null : qq.id); if (!isOpen && qq.has_image) void docs.load(qq.id); }}>
                    <span className="ce-corr-icon">{status === 'ok' ? <CheckCircleFilled /> : status === 'ko' ? <CloseCircleFilled /> : <MinusCircleFilled />}</span>
                    <span className="ce-corr-main">
                      <strong>Question {qq.question_order}</strong>
                      <em>{status === 'blank' ? 'Sans réponse' : `Votre réponse : ${a.selected_answer}`}{status !== 'ok' && ` · Bonne réponse : ${a.correct_answer}`}</em>
                    </span>
                    <span className={`xs-badge ${toneOfLevel(qq.cefr_level)}`}>{qq.cefr_level}</span>
                    <span className="ce-corr-pts">{a.is_correct ? `+${a.points}` : '0'} pt{a.is_correct && a.points > 1 ? 's' : ''}</span>
                    <RightOutlined className="ce-corr-chev" />
                  </button>
                  {isOpen && (
                    <div className="ce-corr-body">
                      <QuestionDocument q={qq} docs={docs} size={docSize.size} compact />
                      {qq.question_text?.trim() && <p className="ce-q-text">{qq.question_text}</p>}
                      <ul className="ce-corr-options">
                        {OPTIONS.map(k => (
                          <li key={k} className={`${k === a.correct_answer ? 'is-correct' : ''}${k === a.selected_answer && !a.is_correct ? ' is-picked' : ''}`}>
                            <span className="ce-option-key">{k}</span>
                            <span>{optionText(qq, k)}</span>
                            {k === a.correct_answer && <em>Bonne réponse</em>}
                            {k === a.selected_answer && !a.is_correct && <em>Votre réponse</em>}
                          </li>
                        ))}
                      </ul>
                      {result.explanations?.[qq.id] && (
                        <div className="ce-expl"><span>Explication</span><p>{result.explanations[qq.id]}</p></div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="xs-actions is-end">
        <Button size="large" onClick={onClose}>Fermer</Button>
        <Button size="large" type="primary" icon={<ReloadOutlined />} onClick={onRetry}>Refaire la série</Button>
      </div>
    </div>
  );
};
