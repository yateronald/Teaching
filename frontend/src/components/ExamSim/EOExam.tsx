import { useCallback, useEffect, useRef, useState } from 'react';
import useExamGuard from '../../hooks/useExamGuard';
import { Button, Modal, Switch, message } from 'antd';
import {
  AudioOutlined, CheckCircleFilled, ClockCircleOutlined, CustomerServiceOutlined, EditOutlined, InfoCircleOutlined,
  LoadingOutlined, ReloadOutlined, SafetyCertificateOutlined, SoundOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import ExamFrame, { type FrameStep } from './ExamFrame';
import ExamReport from './ExamReport';
import { ExamAudio, LiveExaminer } from './liveExaminer';
import { clock, errorText, type DialogueTurn, type ExamReport as Report } from './examModel';

// ============================================================
// EXPRESSION ORALE — TCF Canada. Three tasks with an AI examiner over Gemini
// Live (ephemeral tokens, instructions locked server-side). Every transition is
// driven by one ticker reading refs, so no timer ever acts on stale state.
// ============================================================

interface Session {
  simulationId: number;
  firstName: string;
  partie: { id: number; name: string; monthName: string; year: number } | null;
  examiner: { label: string };
  timing: { t1: number; t2Prep: number; t2: number; t3: number };
  tache1: { prompt: string; points: { number: number; title: string; subtitle?: string | null }[] };
  tache2: { prompt: string };
  tache3: { prompt: string };
}
type Phase = 'intro' | 'check' | 'starting' | 'task' | 'between' | 'evaluating' | 'failed' | 'results';
type Stage = 'prep' | 'connecting' | 'opening' | 'live';
interface Props { open: boolean; onClose: () => void; partieId?: number | null; onCreditConsumed?: () => void; onOutOfCredits?: () => void }

const TASKS = [
  { n: 1, title: 'Entretien dirigé', format: '2 min · sans préparation', hint: 'L’examinateur vous pose des questions sur vous. Répondez par des phrases complètes et développez : exemples, raisons, détails.' },
  { n: 2, title: 'Exercice en interaction', format: '2 min de préparation · 3 min 30', hint: 'C’est vous qui menez l’échange : posez des questions variées pour obtenir les informations, réagissez aux réponses.' },
  { n: 3, title: 'Expression d’un point de vue', format: '4 min 30 · sans préparation', hint: 'Donnez votre opinion et défendez-la sans attendre les questions : arguments, exemples, nuances, conclusion.' },
];
const SILENCE_NUDGE_MS = { 1: 11000, 2: 12000, 3: 15000 } as Record<number, number>;
const BETWEEN_SECONDS = 8;
// Safety net: if the examiner starts talking about the next task anyway, the platform moves on at once.
const NEXT_TASK_TALK: Record<number, RegExp> = {
  1: /(deuxième|seconde|2e)\s+tâche|tâche\s+(2|deux)\b|exercice en interaction|passons (maintenant )?à la (suite|tâche|deuxième)/i,
  2: /(troisième|dernière|3e)\s+tâche|tâche\s+(3|trois)\b|passons (maintenant )?à la (suite|tâche|troisième)/i,
};
const NETWORK_ERROR = /failed to fetch|networkerror|load failed|network request failed/i;
const humanError = (e: unknown, fallback: string) => {
  const m = (e as Error)?.message || '';
  return NETWORK_ERROR.test(m) ? 'Le serveur est injoignable. Vérifiez votre connexion internet, puis réessayez.' : (m || fallback);
};
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
type FailKind = 'connect' | 'upload' | 'evaluate';
interface Upload { form: FormData; ok: boolean; promise: Promise<boolean> }

export default function EOExam({ open, onClose, partieId, onCreditConsumed, onOutOfCredits }: Props) {
  const { apiCall } = useAuth();
  const [msg, msgHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  useExamGuard(open, t => msg.warning({ content: t, key: 'exam-guard' }));
  const [phase, setPhase] = useState<Phase>('intro');
  const [stage, setStage] = useState<Stage>('connecting');
  const [task, setTask] = useState(1);
  const [session, setSession] = useState<Session | null>(null);
  const [now, setNow] = useState(Date.now());
  const [deadline, setDeadline] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [level, setLevel] = useState(0);
  const [micOk, setMicOk] = useState(false);
  const [checkError, setCheckError] = useState('');
  const [captions, setCaptions] = useState(false);
  const [lines, setLines] = useState<{ examiner: string; candidate: string }>({ examiner: '', candidate: '' });
  const [notes, setNotes] = useState('');
  const [banner, setBanner] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [failure, setFailure] = useState('');
  const [failKind, setFailKind] = useState<FailKind>('connect');
  const [early, setEarly] = useState<Record<number, number>>({});
  const [exitOpen, setExitOpen] = useState(false);
  const [recordings, setRecordings] = useState<(string | null)[]>([null, null, null]);

  const audioRef = useRef<ExamAudio | null>(null);
  const liveRef = useRef<LiveExaminer | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const phaseRef = useRef<Phase>('intro');
  const stageRef = useRef<Stage>('connecting');
  const taskRef = useRef(1);
  const deadlineRef = useRef(0);
  const openingSinceRef = useRef(0);
  const turnsRef = useRef<Record<number, DialogueTurn[]>>({ 1: [], 2: [], 3: [] });
  const uploadsRef = useRef<Record<number, Upload>>({});
  const endPendingRef = useRef(0);
  const voiceAtRef = useRef(0);
  const nudgesRef = useRef({ count: 0, at: 0 });
  const reconnectsRef = useRef(0);
  const doneRef = useRef<Set<number>>(new Set());
  const blobUrlsRef = useRef<string[]>([]);
  const voiceMsRef = useRef(0);

  const go = (p: Phase) => { phaseRef.current = p; setPhase(p); };
  const toStage = (s: Stage) => { stageRef.current = s; setStage(s); };
  const setClock = (seconds: number) => { const d = Date.now() + seconds * 1000; deadlineRef.current = d; setDeadline(d); setNow(Date.now()); };

  /** POST with retries on network errors (and on 5xx when asked): the exam survives a short outage. */
  const post = async (path: string, body?: BodyInit, opts: { tries?: number; retry5xx?: boolean; quiet?: boolean } = {}): Promise<Response> => {
    const tries = opts.tries ?? 3;
    let last: unknown = null;
    for (let i = 0; i < tries; i++) {
      try {
        const res = await apiCall(path, { method: 'POST', body });
        if (!(opts.retry5xx && res.status >= 500 && i < tries - 1)) return res;
        last = new Error(await errorText(res, 'Erreur du serveur.'));
      } catch (e) {
        last = e;
      }
      if (i < tries - 1) {
        if (!opts.quiet) setBanner(`Connexion au serveur… nouvel essai (${i + 2}/${tries})`);
        await sleep([1500, 3000, 6000, 10000][i] || 10000);
      }
    }
    throw last;
  };

  // ── Teardown ──
  const teardown = useCallback(() => {
    liveRef.current?.close();
    liveRef.current = null;
    audioRef.current?.close();
    audioRef.current = null;
  }, []);
  useEffect(() => () => {
    teardown();
    blobUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
  }, [teardown]);

  // ── Leaving the page mid-exam ──
  useEffect(() => {
    if (phase !== 'task' && phase !== 'between') return;
    const onUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [phase]);

  // ── Device check ──
  const checkDevices = async () => {
    setCheckError('');
    if (!navigator.mediaDevices?.getUserMedia || !(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext) || !window.WebSocket) {
      setCheckError('Ce navigateur ne permet pas l’épreuve orale. Utilisez une version récente de Chrome, Edge, Firefox ou Safari.');
      return;
    }
    try {
      const audio = audioRef.current || new ExamAudio();
      audioRef.current = audio;
      await audio.open();
      voiceMsRef.current = 0;
      let raf = 0;
      audio.onFrame((_pcm, rms) => {
        if (rms > 0.035) {
          voiceAtRef.current = Date.now();
          if (phaseRef.current === 'check') {
            voiceMsRef.current += 80;
            if (voiceMsRef.current > 700) setMicOk(true);
          }
        }
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; setLevel(rms); });
      });
    } catch (e) {
      const name = (e as DOMException)?.name;
      setCheckError(name === 'NotAllowedError'
        ? 'L’accès au microphone a été refusé. Autorisez-le dans la barre d’adresse du navigateur, puis réessayez.'
        : name === 'NotFoundError' ? 'Aucun microphone détecté. Branchez un casque-micro, puis réessayez.'
          : 'Le microphone n’a pas pu être ouvert.');
    }
  };

  // ── Start (consumes the credit) ──
  const startExam = async () => {
    go('starting');
    try {
      const res = await apiCall('/eo-simulation/start', { method: 'POST', body: JSON.stringify({ partieId: partieId || null }) });
      if (res.status === 402) { teardown(); onClose(); onOutOfCredits?.(); return; }
      if (!res.ok) throw new Error(await errorText(res, 'La simulation n’a pas pu démarrer.'));
      const s: Session = await res.json();
      sessionRef.current = s;
      setSession(s);
      onCreditConsumed?.();
      beginTask(1);
    } catch (e) {
      msg.error((e as Error).message);
      go('check');
    }
  };

  // ── Tasks ──
  const beginTask = (n: number) => {
    taskRef.current = n;
    setTask(n);
    nudgesRef.current = { count: 0, at: 0 };
    reconnectsRef.current = 0;
    setLines({ examiner: '', candidate: '' });
    setBanner('');
    go('task');
    if (n === 2) {
      toStage('prep');
      setClock(sessionRef.current?.timing.t2Prep || 120);
    } else {
      connect(n, false);
    }
  };

  const connect = async (n: number, resume: boolean) => {
    const s = sessionRef.current;
    const audio = audioRef.current;
    if (!s || !audio) return;
    if (!resume) toStage('connecting');
    const sujet = n === 2 ? s.tache2.prompt : n === 3 ? s.tache3.prompt : undefined;
    const attempt = async (fallback: boolean) => {
      const res = await post(`/eo-simulation/${s.simulationId}/live-token`, JSON.stringify({ tache: n, sujet, fallback }), { retry5xx: true });
      if (!res.ok) throw new Error(await errorText(res, 'La connexion avec l’examinateur n’a pas pu être préparée.'));
      const { token, model, wsUrl, tools, endTool } = await res.json();
      const live = new LiveExaminer(audio, {
        onExaminerSpeaking: (on) => setSpeaking(on),
        onTurnComplete: () => {
          if (stageRef.current === 'opening' && taskRef.current === n) startSpeakingClock(n);
        },
        onTranscript: (turns) => {
          const lastOf = (role: DialogueTurn['role']) => [...turns].reverse().find(t => t.role === role)?.text || '';
          const said = lastOf('examiner');
          setLines({ examiner: said, candidate: lastOf('candidate') });
          if (stageRef.current === 'live' && taskRef.current === n && NEXT_TASK_TALK[n]?.test(said)) {
            audio.stopPlayback();
            finishEarly(n);
          }
        },
        onEndRequested: () => {
          if (taskRef.current === n && phaseRef.current === 'task' && !endPendingRef.current) endPendingRef.current = Date.now();
        },
        onClose: (unexpected) => { if (unexpected && liveRef.current === live) handleDrop(n); },
      });
      live.turns = turnsRef.current[n];
      await live.connect(token, wsUrl, model, { tools, endTool });
      return live;
    };
    try {
      let live: LiveExaminer;
      try {
        live = await attempt(false);
      } catch (e) {
        // The fallback model only helps when the Live model itself refused; not when our server is unreachable.
        if (NETWORK_ERROR.test((e as Error)?.message || '')) throw e;
        live = await attempt(true);
      }
      if (taskRef.current !== n || phaseRef.current !== 'task') { live.close(); return; }
      liveRef.current = live;
      setBanner('');
      if (resume && stageRef.current === 'live') {
        const recent = turnsRef.current[n].slice(-4).map(t => `${t.role === 'examiner' ? 'Examinateur' : 'Candidat'} : ${t.text}`).join(' / ');
        live.sendText(`[REPRISE] La connexion a été brièvement coupée. Ne recommence pas la tâche : reprends l’échange naturellement là où il s’était arrêté, en une phrase. Derniers échanges : ${recent || 'aucun'}`);
      } else {
        toStage('opening');
        openingSinceRef.current = Date.now();
        live.sendText('[DÉBUT]');
      }
    } catch (e) {
      if (resume) { setBanner('La connexion avec l’examinateur est perdue. Continuez à parler : votre réponse est enregistrée.'); return; }
      setBanner('');
      setFailure(humanError(e, 'La connexion avec l’examinateur a échoué.'));
      setFailKind('connect');
      liveRef.current?.close();
      liveRef.current = null;
      go('failed');
    }
  };

  /** The task ends before its time: the candidate or the examiner said it is over. */
  const finishEarly = (n: number) => {
    if (doneRef.current.has(n) || phaseRef.current !== 'task') return;
    endPendingRef.current = 0;
    const left = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
    if (stageRef.current === 'live' && left > 0) setEarly(prev => ({ ...prev, [n]: left }));
    endTask(n);
    nextAfter(n);
  };

  const confirmFinish = () => {
    const n = taskRef.current;
    const left = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
    if (left <= 15) { finishEarly(n); return; }
    modal.confirm({
      title: n < 3 ? 'Passer à la tâche suivante ?' : 'Terminer l’épreuve ?',
      icon: <InfoCircleOutlined />,
      content: `Il reste ${clock(left)} pour cette tâche. À l’examen, le temps prévu est entièrement utilisé : l’examinateur vous relance jusqu’au bout, et une production plus longue permet de mieux montrer votre niveau.`,
      okText: n < 3 ? 'Passer à la suite' : 'Terminer et être évalué',
      cancelText: 'Continuer à parler',
      centered: true,
      onOk: () => finishEarly(n),
    });
  };

  const startSpeakingClock = (n: number) => {
    const s = sessionRef.current;
    if (!s) return;
    toStage('live');
    audioRef.current?.startRecording();
    voiceAtRef.current = Date.now();
    setClock(n === 1 ? s.timing.t1 : n === 2 ? s.timing.t2 : s.timing.t3);
  };

  const handleDrop = (n: number) => {
    if (phaseRef.current !== 'task' || taskRef.current !== n) return;
    if (reconnectsRef.current >= 2) { setBanner('La connexion avec l’examinateur est perdue. Continuez à parler : votre réponse est enregistrée.'); return; }
    reconnectsRef.current++;
    setBanner('Connexion interrompue — reconnexion à l’examinateur…');
    liveRef.current = null;
    connect(n, true);
  };

  /** Closes the task: stops the examiner and the recorder, uploads in the background. */
  const endTask = (n: number) => {
    if (doneRef.current.has(n)) return;
    doneRef.current.add(n);
    liveRef.current?.close();
    liveRef.current = null;
    setSpeaking(false);
    const s = sessionRef.current;
    const wav = audioRef.current?.stopRecording() || null;
    if (wav) {
      const url = URL.createObjectURL(wav);
      blobUrlsRef.current.push(url);
      setRecordings(prev => { const next = [...prev]; next[n - 1] = url; return next; });
    }
    if (s) {
      const form = new FormData();
      form.append('dialogue', JSON.stringify(turnsRef.current[n]));
      form.append('sujet', n === 2 ? s.tache2.prompt : n === 3 ? s.tache3.prompt : '');
      if (wav) form.append('audio', wav, `tache${n}.wav`);
      sendTask(n, form);
    }
  };

  /** Uploads one task in the background; kept in memory so a failed upload can be sent again. */
  const sendTask = (n: number, form: FormData) => {
    const s = sessionRef.current;
    if (!s) return;
    const entry: Upload = { form, ok: false, promise: Promise.resolve(false) };
    entry.promise = post(`/eo-simulation/${s.simulationId}/task/${n}`, form, { tries: 4, retry5xx: true, quiet: true })
      .then(res => { entry.ok = res.ok; return res.ok; })
      .catch(() => false);
    uploadsRef.current[n] = entry;
  };

  const evaluate = async () => {
    const s = sessionRef.current;
    if (!s) return;
    go('evaluating');
    setFailure('');
    // Every finished task must reach the server before it can be corrected.
    await Promise.all(Object.values(uploadsRef.current).map(u => u.promise));
    Object.entries(uploadsRef.current).forEach(([n, u]) => { if (!u.ok) sendTask(Number(n), u.form); });
    await Promise.all(Object.values(uploadsRef.current).map(u => u.promise));
    const missing = Object.entries(uploadsRef.current).filter(([, u]) => !u.ok).map(([n]) => n);
    if (missing.length) {
      setFailure(`Les réponses de la tâche ${missing.join(' et ')} n’ont pas pu être envoyées au serveur. Elles sont conservées sur cette page : vérifiez votre connexion, puis réessayez.`);
      setFailKind('upload');
      go('failed');
      return;
    }
    try {
      const res = await post(`/eo-simulation/${s.simulationId}/evaluate`, undefined, { tries: 2, quiet: true });
      if (!res.ok) throw new Error(await errorText(res, 'L’évaluation n’a pas pu être réalisée.'));
      setReport(await res.json());
      go('results');
      audioRef.current?.close();
      audioRef.current = null;
    } catch (e) {
      setFailure(humanError(e, 'L’évaluation n’a pas pu être réalisée.'));
      setFailKind('evaluate');
      go('failed');
    }
  };

  const retryConnection = () => {
    setFailure('');
    go('task');
    connect(taskRef.current, false);
  };

  const nextAfter = (n: number) => {
    if (n >= 3) { evaluate(); return; }
    taskRef.current = n;
    go('between');
    setClock(BETWEEN_SECONDS);
  };

  // ── One ticker drives every transition ──
  const tickRef = useRef<() => void>(() => {});
  tickRef.current = () => {
    const t = Date.now();
    setNow(t);
    const n = taskRef.current;
    const p = phaseRef.current;
    const left = deadlineRef.current - t;
    if (p === 'between' && left <= 0) { beginTask(n + 1); return; }
    if (p !== 'task') return;
    const st = stageRef.current;
    if (st === 'prep' && left <= 0) { connect(2, false); return; }
    // The examiner's opening should take a few seconds; never wait forever for it.
    if (st === 'opening' && t - openingSinceRef.current > 30000) { startSpeakingClock(n); return; }
    if (endPendingRef.current && (st === 'live' || st === 'opening')) {
      const since = t - endPendingRef.current;
      if ((since > 400 && !audioRef.current?.speaking) || since > 4000) { finishEarly(n); return; }
    }
    if (st === 'live') {
      if (left <= 0) { endTask(n); nextAfter(n); return; }
      const quiet = t - voiceAtRef.current;
      const nudge = nudgesRef.current;
      if (liveRef.current && !audioRef.current?.speaking && quiet > SILENCE_NUDGE_MS[n] && nudge.count < 3 && t - nudge.at > 20000) {
        liveRef.current.sendText('[SILENCE]');
        nudgesRef.current = { count: nudge.count + 1, at: t };
      }
    }
  };
  useEffect(() => {
    if (phase !== 'task' && phase !== 'between') return;
    const id = window.setInterval(() => tickRef.current(), 250);
    return () => window.clearInterval(id);
  }, [phase]);

  // ── Exit ──
  const requestExit = () => {
    if (phase === 'task' || phase === 'between') { setExitOpen(true); return; }
    if (phase === 'evaluating' || phase === 'starting') return;
    teardown();
    onClose();
  };
  const evaluateNow = () => {
    setExitOpen(false);
    if (phaseRef.current === 'task' && stageRef.current !== 'prep') endTask(taskRef.current);
    evaluate();
  };
  const quitWithoutEvaluation = () => {
    setExitOpen(false);
    teardown();
    onClose();
  };

  if (!open) return null;
  const s = session;
  const left = Math.max(0, Math.round((deadline - now) / 1000));
  const steps: FrameStep[] = [
    ...TASKS.map(t => ({ key: t.n, label: t.title, state: (doneRef.current.has(t.n) ? 'done' : phase === 'task' && task === t.n ? 'current' : 'todo') as FrameStep['state'] })),
    { key: 'r', label: 'Résultats', state: phase === 'results' ? 'current' : 'todo' },
  ];
  const timer = phase === 'task' && stage === 'prep' ? { seconds: left, total: s?.timing.t2Prep || 120, label: 'Préparation' }
    : phase === 'task' && stage === 'live' ? { seconds: left, total: (task === 1 ? s?.timing.t1 : task === 2 ? s?.timing.t2 : s?.timing.t3) || 120, label: `Tâche ${task}` }
      : null;
  const info = TASKS[task - 1];

  return (
    <ExamFrame
      skill="eo"
      title={s?.partie ? s.partie.name : 'Expression orale'}
      subtitle={`TCF Canada · Expression orale${s?.partie ? ` · ${s.partie.monthName} ${s.partie.year}` : ''}`}
      steps={phase === 'intro' || phase === 'check' ? undefined : steps}
      timer={timer}
      onExit={requestExit}
      exitLabel={phase === 'task' || phase === 'between' ? 'Interrompre l’épreuve' : 'Fermer'}
    >
      {msgHolder}{modalHolder}

      {phase === 'intro' && (
        <div className="xs-brief">
          <div className="xs-brief-main">
            <span className="xs-eyebrow">Épreuve d’expression orale · format TCF Canada</span>
            <h1>Douze minutes face à l’examinateur.</h1>
            <p className="xs-lead">Trois tâches enchaînées, minutées comme le jour de l’examen. L’examinateur vous parle, vous écoute et vous relance ; il ne vous corrige pas pendant l’épreuve.</p>
            <ol className="xs-brief-tasks">
              {TASKS.map(t => (
                <li key={t.n}>
                  <span className="xs-brief-n">{t.n}</span>
                  <div><strong>{t.title}</strong><span className="xs-brief-meta">{t.format}</span><p>{t.hint}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="xs-brief-side">
            <div className="xs-card">
              <h3 className="xs-side-title">Avant de commencer</h3>
              <ul className="xs-rules">
                <li><CustomerServiceOutlined /><span>Un <b>casque avec micro</b> donne les meilleurs résultats ; installez-vous au calme.</span></li>
                <li><ClockCircleOutlined /><span>Le chronomètre ne s’arrête pas : une tâche terminée passe automatiquement à la suivante.</span></li>
                <li><AudioOutlined /><span>Votre voix est enregistrée pour l’évaluation (prononciation, aisance), puis <b>supprimée</b> après la correction.</span></li>
                <li><SafetyCertificateOutlined /><span>Correction selon la grille du TCF Canada, avec votre niveau CECR et NCLC.</span></li>
              </ul>
            </div>
            <div className="xs-card">
              <p className="xs-side-text">Vous allez d’abord vérifier votre micro et votre son. Le crédit n’est utilisé qu’au lancement de l’épreuve.</p>
              <Button type="primary" block size="large" onClick={() => go('check')}>Vérifier mon équipement</Button>
            </div>
          </aside>
        </div>
      )}

      {(phase === 'check' || phase === 'starting') && (
        <div className="xs-check">
          <span className="xs-eyebrow">Vérification de l’équipement</span>
          <h1>Micro et son</h1>
          <div className="xs-check-grid">
            <div className={`xs-card xs-check-item${micOk ? ' is-ok' : ''}`}>
              <div className="xs-check-head"><AudioOutlined /><strong>Microphone</strong>{micOk && <CheckCircleFilled className="xs-ok" />}</div>
              {!audioRef.current?.ready ? (
                <>
                  <p>Autorisez l’accès au micro, puis dites quelques mots.</p>
                  <Button type="primary" onClick={checkDevices}>Activer le micro</Button>
                </>
              ) : (
                <>
                  <p>{micOk ? 'Votre voix est bien captée.' : 'Parlez normalement : « Bonjour, je m’appelle… »'}</p>
                  <LevelMeter level={level} />
                </>
              )}
              {checkError && <p className="xs-check-error"><WarningOutlined /> {checkError}</p>}
            </div>
            <div className="xs-card xs-check-item">
              <div className="xs-check-head"><SoundOutlined /><strong>Haut-parleurs ou casque</strong></div>
              <p>Vous devez entendre un signal sonore clair.</p>
              <Button onClick={() => audioRef.current ? audioRef.current.chime() : checkDevices()} disabled={!audioRef.current?.ready}>Tester le son</Button>
            </div>
          </div>
          <div className="xs-actions">
            <Button onClick={() => go('intro')} disabled={phase === 'starting'}>Retour</Button>
            <Button type="primary" size="large" disabled={!micOk} loading={phase === 'starting'} onClick={startExam}>Commencer l’épreuve · 1 crédit</Button>
          </div>
        </div>
      )}

      {phase === 'task' && s && (
        <div className="xs-oral">
          <section className="xs-oral-main">
            <span className="xs-eyebrow">Tâche {task} · {info.title}</span>
            {stage === 'prep' ? (
              <div className="xs-prep">
                <h2>Préparation</h2>
                <p className="xs-lead">Lisez le sujet et préparez vos questions. Vous pouvez prendre des notes : elles resteront affichées pendant l’échange.</p>
                <Button type="primary" size="large" onClick={() => connect(2, false)}>Je suis prêt·e, commencer l’échange</Button>
              </div>
            ) : (
              <>
                <div className={`xs-examiner${speaking ? ' is-speaking' : ''}`}>
                  <span className="xs-avatar" aria-hidden>{s.examiner.label.slice(0, 2).toUpperCase()}</span>
                  <div className="xs-examiner-id">
                    <strong>{s.examiner.label}</strong>
                    <span>{stage === 'connecting' ? 'Connexion…' : speaking ? 'Parle' : stage === 'opening' ? 'Va commencer' : 'Vous écoute'}</span>
                  </div>
                  <Equalizer active={speaking} />
                </div>
                <div className="xs-you">
                  <span className="xs-you-label"><AudioOutlined /> Vous</span>
                  <LevelMeter level={level} />
                  <span className="xs-you-state">{stage === 'live' ? 'Enregistrement' : 'Micro actif'}</span>
                </div>
                {banner && <p className="xs-banner"><LoadingOutlined /> {banner}</p>}
                {stage === 'connecting' && <p className="xs-hint"><LoadingOutlined /> Connexion à l’examinateur…</p>}
                {stage === 'opening' && <p className="xs-hint">Écoutez la consigne : le chronomètre démarre à la fin de l’introduction.</p>}
                {stage === 'live' && <p className="xs-hint">{info.hint}</p>}
                {stage === 'live' && (
                  <Button className="xs-finish" onClick={confirmFinish}>
                    {task < 3 ? 'J’ai terminé — passer à la tâche suivante' : 'J’ai terminé — terminer l’épreuve'}
                  </Button>
                )}
                {captions && (lines.examiner || lines.candidate) && (
                  <div className="xs-captions" aria-live="polite">
                    {lines.examiner && <p><b>{s.examiner.label}</b>{lines.examiner}</p>}
                    {lines.candidate && <p><b>Vous</b>{lines.candidate}</p>}
                  </div>
                )}
                <label className="xs-caption-toggle"><Switch size="small" checked={captions} onChange={setCaptions} /> Sous-titres (désactivés à l’examen réel)</label>
              </>
            )}
          </section>
          <aside className="xs-oral-side">
            {task === 1 ? (
              <div className="xs-card">
                <h3 className="xs-side-title">Thèmes de l’entretien</h3>
                <ul className="xs-points">{s.tache1.points.map(p => <li key={p.number}><b>{p.title}</b>{p.subtitle && <span>{p.subtitle}</span>}</li>)}</ul>
              </div>
            ) : (
              <div className="xs-card xs-oral-sujet">
                <h3 className="xs-side-title">Sujet</h3>
                <p>{task === 2 ? s.tache2.prompt : s.tache3.prompt}</p>
              </div>
            )}
            {task === 2 && (
              <div className="xs-card">
                <h3 className="xs-side-title"><EditOutlined /> Brouillon</h3>
                <textarea className="xs-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Vos idées de questions…" spellCheck={false} aria-label="Brouillon" />
              </div>
            )}
          </aside>
        </div>
      )}

      {phase === 'between' && (
        <div className="xs-center">
          <div className="xs-state is-ok"><CheckCircleFilled /></div>
          <h2>Tâche {task} terminée</h2>
          {early[task] > 0 && <p className="xs-early">Terminée avec {clock(early[task])} d’avance. Le jour de l’examen, utilisez tout le temps prévu : c’est en parlant davantage que vous montrez votre niveau.</p>}
          {TASKS[task] && (
            <>
              <p className="xs-lead">Prochaine étape : <b>tâche {task + 1} — {TASKS[task].title}</b> ({TASKS[task].format}). {TASKS[task].hint}</p>
              <p className="xs-countdown">Début dans {left} s</p>
              <Button type="primary" size="large" onClick={() => beginTask(task + 1)}>Commencer maintenant</Button>
            </>
          )}
        </div>
      )}

      {phase === 'evaluating' && <Evaluating />}

      {phase === 'failed' && (
        <div className="xs-center">
          <div className="xs-state is-warn"><WarningOutlined /></div>
          <h2>{failKind === 'connect' ? `La connexion avec l’examinateur a échoué` : failKind === 'upload' ? 'L’envoi de vos réponses a échoué' : 'L’évaluation n’a pas abouti'}</h2>
          <p className="xs-lead">
            {failure}
            {failKind === 'connect' && ` Votre progression est conservée : vous reprendrez à la tâche ${taskRef.current}.`}
            {failKind === 'evaluate' && ' Vos réponses sont enregistrées ; aucun crédit supplémentaire ne sera utilisé.'}
          </p>
          <div className="xs-actions">
            <Button onClick={() => { teardown(); onClose(); }}>Fermer</Button>
            {failKind === 'connect' && doneRef.current.size > 0 && <Button onClick={evaluate}>Faire évaluer les tâches passées</Button>}
            {failKind === 'connect'
              ? <Button type="primary" icon={<ReloadOutlined />} onClick={retryConnection}>Réessayer la tâche {taskRef.current}</Button>
              : <Button type="primary" icon={<ReloadOutlined />} onClick={evaluate}>{failKind === 'upload' ? 'Renvoyer mes réponses' : 'Relancer l’évaluation'}</Button>}
          </div>
        </div>
      )}

      {phase === 'results' && report && (
        <ExamReport
          report={report}
          recordings={recordings}
          footer={<div className="xs-actions is-end"><Button onClick={() => { teardown(); onClose(); }}>Fermer</Button></div>}
        />
      )}

      <Modal open={exitOpen} onCancel={() => setExitOpen(false)} title="Interrompre l’épreuve ?" centered width={460}
        footer={[
          <Button key="q" danger onClick={quitWithoutEvaluation}>Quitter sans évaluation</Button>,
          <Button key="e" onClick={evaluateNow} disabled={!doneRef.current.size && !(phase === 'task' && stage === 'live')}>Faire évaluer maintenant</Button>,
          <Button key="c" type="primary" onClick={() => setExitOpen(false)}>Continuer l’épreuve</Button>,
        ]}>
        <p className="xs-modal-text"><InfoCircleOutlined /> Le crédit de cette simulation est déjà utilisé. Vous pouvez faire évaluer les tâches déjà passées ; les tâches non passées compteront 0.</p>
      </Modal>
    </ExamFrame>
  );
}

function LevelMeter({ level }: { level: number }) {
  const lit = Math.round(Math.min(1, level * 9) * 16);
  return (
    <span className="xs-meter" role="meter" aria-label="Niveau du micro" aria-valuemin={0} aria-valuemax={16} aria-valuenow={lit}>
      {Array.from({ length: 16 }, (_, i) => <i key={i} className={i < lit ? (i > 12 ? 'is-hot' : 'is-on') : ''} />)}
    </span>
  );
}

const Equalizer = ({ active }: { active: boolean }) => (
  <span className={`xs-eq${active ? ' is-on' : ''}`} aria-hidden>{[0, 1, 2, 3, 4].map(i => <i key={i} />)}</span>
);

function Evaluating() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setElapsed(e => e + 1), 1000); return () => window.clearInterval(id); }, []);
  const steps = ['Enregistrements transmis', 'Écoute et double correction de chaque tâche', 'Calcul du score, du niveau CECR et du NCLC'];
  const current = elapsed < 4 ? 0 : elapsed < 35 ? 1 : 2;
  return (
    <div className="xs-center">
      <div className="xs-state is-busy"><AudioOutlined /></div>
      <h2>Évaluation en cours</h2>
      <p className="xs-lead">Vos trois tâches sont écoutées et corrigées deux fois, indépendamment, selon la grille du TCF Canada. Comptez 30 secondes à une minute.</p>
      <ol className="xs-progress-steps">{steps.map((s, i) => <li key={i} className={i < current ? 'is-done' : i === current ? 'is-current' : ''}>{s}</li>)}</ol>
    </div>
  );
}
