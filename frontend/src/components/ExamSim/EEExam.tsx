import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useExamGuard from '../../hooks/useExamGuard';
import { Button, Modal, Skeleton, message } from 'antd';
import {
  CheckCircleFilled, ClockCircleOutlined, CloudOutlined, CloudSyncOutlined, EditOutlined, FileTextOutlined,
  InfoCircleOutlined, LockOutlined, ReloadOutlined, SendOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import ExamFrame from './ExamFrame';
import ExamReport, { type EETaskExtra } from './ExamReport';
import { clock, countWords, errorText, nclcOf, type ExamReport as Report } from './examModel';

// ============================================================
// EXPRESSION ÉCRITE — TCF Canada. One 60-minute clock for three tasks, owned
// by the server; drafts autosave; the copy is handed in automatically at 0:00.
// ============================================================

interface Task {
  id: number; task_number: number; task_type: string; task_type_label: string;
  title: string | null; consigne: string; documents: string[];
  min_words: number; max_words: number; duration_minutes: number;
}
interface Combination {
  combinaison: { id: number; name: string; month_name: string; year: number };
  taches: Task[];
  total_duration_minutes: number;
  attempt_count: number;
  in_progress: { simulation_id: number; status: string; remaining_seconds: number; words: number } | null;
}
interface ResultTask { task_number: number; student_answer: string; consigne?: string; title?: string | null; documents?: string[]; min_words: number; max_words: number; correction_text: string | null; score: number; level: string; positives: string[]; improvements: string[] }
interface Result { id: number; status: string; report: Report | null; tasks: ResultTask[]; average_score: number; overall_level: string }

interface Props { combinaisonId: number; open: boolean; onClose: () => void; onCreditConsumed?: () => void; onOutOfCredits?: () => void }
type View = 'loading' | 'overview' | 'exam' | 'submitting' | 'results' | 'failed';
type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'offline';

const TASK_GUIDE: Record<number, { label: string; expect: string }> = {
  1: { label: 'Message', expect: 'Un courriel ou une lettre à un destinataire : répondez à tous les points de la consigne, avec les formules d’ouverture et de clôture adaptées.' },
  2: { label: 'Récit et impressions', expect: 'Racontez une expérience de façon organisée (temps du passé) et donnez vos impressions personnelles.' },
  3: { label: 'Point de vue argumenté', expect: 'Présentez et comparez les deux documents en les reformulant (40–60 mots), puis donnez votre opinion argumentée (80–120 mots).' },
};
const ACCENTS = ['é', 'è', 'ê', 'ë', 'à', 'â', 'ù', 'û', 'ü', 'ô', 'î', 'ï', 'ç', 'œ', 'æ', 'É', 'È', 'À', 'Ç', 'Ê', '« ', ' »', '’'];

export default function EEExam({ combinaisonId, open, onClose, onCreditConsumed, onOutOfCredits }: Props) {
  const { apiCall } = useAuth();
  const [msg, msgHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  useExamGuard(open, t => msg.warning({ content: t, key: 'exam-guard' }));
  const [view, setView] = useState<View>('loading');
  const [data, setData] = useState<Combination | null>(null);
  const [simId, setSimId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [active, setActive] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [save, setSave] = useState<{ state: SaveState; at: number | null }>({ state: 'idle', at: null });
  const [result, setResult] = useState<Result | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [failure, setFailure] = useState('');
  const [starting, setStarting] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const answersRef = useRef(answers);
  const submittedRef = useRef(false);
  const warnedRef = useRef(false);
  answersRef.current = answers;

  const total = (data?.total_duration_minutes || 60) * 60;
  const remaining = view === 'exam' ? Math.max(0, Math.round((deadline - now) / 1000)) : total;

  // ── Load ──
  // Parents pass new callbacks on every render (e.g. after the credit balance
  // refreshes); reloading on those would wipe the exam, so only `open` and the
  // combinaison trigger a load.
  const loadRef = useRef<() => Promise<void>>(async () => {});
  loadRef.current = async () => {
    setView('loading');
    try {
      const res = await apiCall(`/tcf/ee/simulation/combinaison/${combinaisonId}`);
      if (!res.ok) throw new Error(await errorText(res, 'Sujet indisponible.'));
      setData(await res.json());
      setResult(null);
      setReport(null);
      setView('overview');
    } catch (e) {
      msg.error((e as Error).message);
      onClose();
    }
  };
  const load = useCallback(() => loadRef.current(), []);
  useEffect(() => { if (open) loadRef.current(); }, [open, combinaisonId]);

  // ── Clock ──
  useEffect(() => {
    if (view !== 'exam') return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [view]);

  // ── Leaving the page mid-exam ──
  useEffect(() => {
    if (view !== 'exam') return;
    const onUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [view]);

  // ── Autosave ──
  const saveDraft = useCallback(async () => {
    if (!simId || submittedRef.current) return;
    setSave(s => ({ ...s, state: 'saving' }));
    try {
      const res = await apiCall(`/tcf/ee/simulation/${simId}/draft`, { method: 'PUT', body: JSON.stringify({ answers: answersRef.current }) });
      if (!res.ok) throw new Error(String(res.status));
      setSave({ state: 'saved', at: Date.now() });
    } catch {
      setSave(s => ({ ...s, state: 'offline' }));
    }
  }, [apiCall, simId]);
  useEffect(() => {
    if (view !== 'exam' || save.state !== 'dirty') return;
    const id = window.setTimeout(saveDraft, 3000);
    return () => window.clearTimeout(id);
  }, [answers, save.state, view, saveDraft]);
  useEffect(() => {
    if (view !== 'exam') return;
    const id = window.setInterval(() => { if (save.state === 'offline') saveDraft(); }, 10000);
    return () => window.clearInterval(id);
  }, [view, save.state, saveDraft]);

  // ── Submit ──
  const finishWith = useCallback(async (res: Response, id: number) => {
    const body = await res.json();
    const rr = await apiCall(`/tcf/ee/simulation/${id}/result`);
    const full: Result | null = rr.ok ? await rr.json() : null;
    setResult(full);
    setReport(body.report || full?.report || (full ? legacyReport(full) : null));
    setView('results');
  }, [apiCall]);

  const submit = useCallback(async (id: number, withAnswers: boolean) => {
    submittedRef.current = true;
    setView('submitting');
    setFailure('');
    try {
      const res = await apiCall(`/tcf/ee/simulation/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(withAnswers ? { answers: answersRef.current } : {}),
      });
      if (!res.ok) throw new Error(await errorText(res, 'La correction a échoué.'));
      await finishWith(res, id);
    } catch (e) {
      setFailure((e as Error).message);
      setView('failed');
    }
  }, [apiCall, finishWith]);

  // Time is up → the copy is handed in, as in the real exam.
  useEffect(() => {
    if (view === 'exam' && remaining <= 0 && simId && !submittedRef.current) {
      msg.info('Temps écoulé : votre copie est remise.');
      submit(simId, true);
    }
    if (view === 'exam' && remaining <= 300 && remaining > 0 && !warnedRef.current) {
      warnedRef.current = true;
      msg.warning('Plus que 5 minutes. Pensez à vous relire.');
    }
  }, [remaining, view, simId, submit, msg]);

  // ── Start ──
  const begin = async (forceNew = false) => {
    if (!data) return;
    setStarting(true);
    try {
      const res = await apiCall('/tcf/ee/simulation/start', { method: 'POST', body: JSON.stringify({ combinaison_id: combinaisonId, force_new: forceNew }) });
      if (res.status === 402) { onClose(); onOutOfCredits?.(); return; }
      if (res.status === 409) {
        const body = await res.json().catch(() => ({}));
        if (body.error === 'EXPIRED_ATTEMPT') {
          modal.confirm({
            title: 'Votre simulation précédente a expiré',
            icon: <ClockCircleOutlined />,
            content: `Le temps est écoulé, mais elle contient ${body.words} mot${body.words > 1 ? 's' : ''} enregistré${body.words > 1 ? 's' : ''}. Vous pouvez la faire corriger telle quelle, sans crédit supplémentaire, ou commencer une nouvelle simulation (1 crédit).`,
            okText: 'Faire corriger cette copie',
            cancelText: 'Nouvelle simulation',
            onOk: () => { setSimId(body.simulation_id); submit(body.simulation_id, false); },
            onCancel: () => { void begin(true); },
          });
          return;
        }
      }
      if (!res.ok) throw new Error(await errorText(res, 'Impossible de démarrer.'));
      const body = await res.json();
      setSimId(body.simulation_id);
      if (body.needs_correction) { setAnswers(body.answers); submit(body.simulation_id, false); return; }
      setAnswers(body.answers || ['', '', '']);
      setDeadline(Date.now() + Number(body.remaining_seconds) * 1000);
      setNow(Date.now());
      submittedRef.current = false;
      warnedRef.current = Number(body.remaining_seconds) <= 300;
      setSave({ state: body.resumed ? 'saved' : 'idle', at: body.resumed ? Date.now() : null });
      setActive(0);
      setView('exam');
      if (!body.resumed) onCreditConsumed?.();
      else msg.success('Simulation reprise là où vous l’aviez laissée.');
    } catch (e) {
      msg.error((e as Error).message);
    } finally {
      setStarting(false);
    }
  };

  // ── Editing ──
  const setAnswer = (i: number, value: string) => {
    setAnswers(prev => { const next = [...prev]; next[i] = value; return next; });
    setSave(s => ({ ...s, state: 'dirty' }));
  };
  const insert = (ch: string) => {
    const ta = editorRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    setAnswer(active, value.slice(0, s) + ch + value.slice(e));
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + ch.length; });
  };
  const blocked = (e: React.SyntheticEvent) => { e.preventDefault(); msg.warning({ content: 'Le copier-coller est désactivé pendant l’épreuve.', key: 'paste' }); };

  const confirmSubmit = () => {
    if (!simId || !data) return;
    const lines = data.taches.map((t, i) => {
      const w = countWords(answers[i]);
      const status = w === 0 ? 'vide' : w < t.min_words ? `trop court (${w}/${t.min_words} min.)` : w > t.max_words ? `trop long (${w}/${t.max_words} max.)` : `${w} mots`;
      return { n: t.task_number, status, warn: w === 0 || w < t.min_words || w > t.max_words };
    });
    modal.confirm({
      title: 'Remettre votre copie ?',
      icon: <SendOutlined />,
      width: 460,
      content: (
        <div className="xs-confirm">
          <p>Il vous reste {clock(remaining)}. Une fois remise, la copie ne peut plus être modifiée.</p>
          <ul>{lines.map(l => <li key={l.n} className={l.warn ? 'is-warn' : ''}>Tâche {l.n} : {l.status}</li>)}</ul>
        </div>
      ),
      okText: 'Remettre ma copie',
      cancelText: 'Continuer à écrire',
      // Close the dialog at once: the correction screen takes over (returning the promise would keep it open for the whole correction).
      onOk: () => { void submit(simId, true); },
    });
  };

  const exit = () => {
    if (view === 'exam') {
      modal.confirm({
        title: 'Quitter l’épreuve ?',
        icon: <WarningOutlined />,
        content: 'Votre copie est enregistrée et le chronomètre continue de tourner. Vous pourrez reprendre tant que le temps n’est pas écoulé.',
        okText: 'Quitter',
        cancelText: 'Rester',
        onOk: async () => { await saveDraft(); onClose(); },
      });
      return;
    }
    if (view === 'submitting') return;
    onClose();
  };

  const extras: EETaskExtra[] | undefined = useMemo(() => result?.tasks.map(t => ({
    answer: t.student_answer, consigne: t.consigne, title: t.title, documents: t.documents,
    minWords: t.min_words, maxWords: t.max_words, correction: t.correction_text,
  })), [result]);

  if (!open) return null;
  const label = data ? `${data.combinaison.name}` : 'Expression écrite';
  const sub = data ? `TCF Canada · Expression écrite · ${data.combinaison.month_name} ${data.combinaison.year}` : 'TCF Canada · Expression écrite';

  return (
    <ExamFrame
      skill="ee"
      title={label}
      subtitle={sub}
      onExit={exit}
      exitLabel={view === 'exam' ? 'Quitter (le temps continue)' : 'Fermer'}
      timer={view === 'exam' ? { seconds: remaining, total } : null}
      right={view === 'exam' ? (
        <>
          <SaveBadge state={save.state} at={save.at} />
          <Button type="primary" icon={<SendOutlined />} onClick={confirmSubmit} className="xs-submit">Remettre</Button>
        </>
      ) : null}
    >
      {msgHolder}{modalHolder}

      {view === 'loading' && <div className="xs-pad"><Skeleton active paragraph={{ rows: 8 }} /></div>}

      {view === 'overview' && data && (
        <div className="xs-brief">
          <div className="xs-brief-main">
            <span className="xs-eyebrow">Épreuve d’expression écrite · format TCF Canada</span>
            <h1>Trois textes, une heure.</h1>
            <p className="xs-lead">Vous gérez librement votre temps entre les trois tâches, comme le jour de l’examen. La durée indiquée pour chaque tâche est une recommandation.</p>
            <ol className="xs-brief-tasks">
              {data.taches.map(t => (
                <li key={t.id}>
                  <span className="xs-brief-n">{t.task_number}</span>
                  <div>
                    <strong>{TASK_GUIDE[t.task_number]?.label || t.task_type_label}</strong>
                    <span className="xs-brief-meta">{t.min_words}–{t.max_words} mots · environ {t.duration_minutes} min</span>
                    <p>{TASK_GUIDE[t.task_number]?.expect}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="xs-brief-side">
            <div className="xs-card">
              <h3 className="xs-side-title">Conditions d’examen</h3>
              <ul className="xs-rules">
                <li><ClockCircleOutlined /><span><b>{data.total_duration_minutes} minutes</b> pour l’ensemble. À 0:00, la copie est remise automatiquement.</span></li>
                <li><CloudOutlined /><span>Sauvegarde automatique : une coupure ou une fermeture n’efface rien, le temps continue.</span></li>
                <li><LockOutlined /><span>Copier-coller et correcteur orthographique désactivés. Clavier d’accents disponible.</span></li>
                <li><EditOutlined /><span>Le compteur de mots suit la règle de l’examen : un mot = une suite de caractères entre deux espaces.</span></li>
              </ul>
            </div>
            {data.in_progress && data.in_progress.status === 'in_progress' && data.in_progress.remaining_seconds > 0 ? (
              <div className="xs-card is-accent">
                <h3 className="xs-side-title">Simulation en cours</h3>
                <p className="xs-side-text">{data.in_progress.words} mots rédigés · {clock(data.in_progress.remaining_seconds)} restantes.</p>
                <Button type="primary" block size="large" loading={starting} onClick={() => begin()}>Reprendre l’épreuve</Button>
              </div>
            ) : data.in_progress && data.in_progress.status === 'error' ? (
              <div className="xs-card is-accent">
                <h3 className="xs-side-title">Copie en attente de correction</h3>
                <p className="xs-side-text">La correction précédente n’a pas abouti. Relancez-la sans crédit supplémentaire.</p>
                <Button type="primary" block size="large" loading={starting} onClick={() => begin()}>Relancer la correction</Button>
              </div>
            ) : (
              <div className="xs-card">
                <p className="xs-side-text">{data.attempt_count ? `${data.attempt_count} simulation${data.attempt_count > 1 ? 's' : ''} corrigée${data.attempt_count > 1 ? 's' : ''} sur ce sujet.` : 'Première simulation sur ce sujet.'} Démarrer l’épreuve utilise 1 crédit d’expression écrite.</p>
                <Button type="primary" block size="large" loading={starting} onClick={() => begin()}>Commencer l’épreuve</Button>
              </div>
            )}
          </aside>
        </div>
      )}

      {view === 'exam' && data && (
        <div className="xs-write">
          <div className="xs-wtabs" role="tablist" aria-label="Tâches">
            {data.taches.map((t, i) => {
              const w = countWords(answers[i]);
              const state = w === 0 ? 'empty' : w < t.min_words ? 'short' : w > t.max_words ? 'long' : 'ok';
              return (
                <button key={t.id} type="button" role="tab" aria-selected={active === i} className={`xs-wtab${active === i ? ' is-active' : ''}`} onClick={() => setActive(i)}>
                  <span className="xs-wtab-n">Tâche {t.task_number}</span>
                  <span className="xs-wtab-label">{TASK_GUIDE[t.task_number]?.label || t.task_type_label}</span>
                  <span className={`xs-wtab-count is-${state}`}>{state === 'ok' && <CheckCircleFilled />}{w} / {t.min_words}–{t.max_words}</span>
                </button>
              );
            })}
          </div>
          {(() => {
            const t = data.taches[active];
            const w = countWords(answers[active]);
            const state = w === 0 ? 'empty' : w < t.min_words ? 'short' : w > t.max_words ? 'long' : 'ok';
            return (
              <div className="xs-wgrid">
                <section className="xs-sujet" aria-label="Sujet">
                  <span className="xs-eyebrow">Tâche {t.task_number} · {TASK_GUIDE[t.task_number]?.label}</span>
                  {t.title && <h2 className="xs-sujet-title">{t.title}</h2>}
                  <p className="xs-sujet-text">{t.consigne}</p>
                  {t.documents.map((d, i) => (
                    <article key={i} className="xs-doc">
                      <span className="xs-doc-label">Document {i + 1}</span>
                      <p>{d}</p>
                    </article>
                  ))}
                  <p className="xs-sujet-meta"><InfoCircleOutlined /> {t.min_words} à {t.max_words} mots · environ {t.duration_minutes} minutes recommandées</p>
                </section>
                <section className="xs-editor">
                  <textarea
                    ref={editorRef}
                    className="xs-textarea"
                    value={answers[active]}
                    onChange={e => setAnswer(active, e.target.value)}
                    onPaste={blocked}
                    onDrop={blocked}
                    onCopy={blocked}
                    onCut={blocked}
                    placeholder="Rédigez votre texte ici…"
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    aria-label={`Votre réponse à la tâche ${t.task_number}`}
                  />
                  <div className="xs-editor-foot">
                    <div className="xs-keys" aria-label="Caractères français">
                      {ACCENTS.map(ch => (
                        <button key={ch} type="button" onMouseDown={e => e.preventDefault()} onClick={() => insert(ch)} aria-label={`Insérer ${ch.trim()}`}>{ch.trim()}</button>
                      ))}
                    </div>
                    <WordGauge words={w} min={t.min_words} max={t.max_words} state={state} />
                  </div>
                </section>
              </div>
            );
          })()}
        </div>
      )}

      {view === 'submitting' && <Correcting />}

      {view === 'failed' && (
        <div className="xs-center">
          <div className="xs-state is-warn"><WarningOutlined /></div>
          <h2>La correction n’a pas abouti</h2>
          <p className="xs-lead">{failure || 'Le service de correction est momentanément indisponible.'} Votre copie est bien enregistrée.</p>
          <div className="xs-actions">
            <Button onClick={onClose}>Fermer</Button>
            {simId && <Button type="primary" icon={<ReloadOutlined />} onClick={() => submit(simId, false)}>Relancer la correction</Button>}
          </div>
        </div>
      )}

      {view === 'results' && report && (
        <ExamReport
          report={report}
          eeTasks={extras}
          footer={<div className="xs-actions is-end"><Button onClick={onClose}>Fermer</Button><Button type="primary" icon={<ReloadOutlined />} onClick={load}>Nouvelle simulation</Button></div>}
        />
      )}
    </ExamFrame>
  );
}

function SaveBadge({ state, at }: { state: SaveState; at: number | null }) {
  const text = state === 'saving' ? 'Enregistrement…'
    : state === 'offline' ? 'Hors ligne — nouvel essai'
      : state === 'dirty' ? 'Modifications…'
        : at ? `Enregistré ${new Date(at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : 'Sauvegarde auto';
  return <span className={`xs-save is-${state}`} aria-live="polite">{state === 'saving' ? <CloudSyncOutlined /> : <CloudOutlined />}{text}</span>;
}

function WordGauge({ words, min, max, state }: { words: number; min: number; max: number; state: string }) {
  const scaleMax = Math.max(max * 1.25, words);
  const pct = (v: number) => `${Math.min(100, (v / scaleMax) * 100)}%`;
  const text = state === 'empty' ? `Objectif : ${min} à ${max} mots`
    : state === 'short' ? `Encore ${min - words} mot${min - words > 1 ? 's' : ''} pour le minimum`
      : state === 'long' ? `${words - max} mot${words - max > 1 ? 's' : ''} au-delà du maximum : pénalisé`
        : 'Dans la fourchette demandée';
  return (
    <div className={`xs-gauge is-${state}`}>
      <div className="xs-gauge-top"><strong>{words}</strong><span>mots</span><em>{text}</em></div>
      <div className="xs-gauge-track" aria-hidden>
        <span className="xs-gauge-zone" style={{ left: pct(min), width: `calc(${pct(max)} - ${pct(min)})` }} />
        <span className="xs-gauge-fill" style={{ width: pct(words) }} />
      </div>
    </div>
  );
}

function Correcting() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setElapsed(e => e + 1), 1000); return () => window.clearInterval(id); }, []);
  const steps = [
    { label: 'Copie remise et enregistrée', done: true },
    { label: 'Double correction de chaque tâche', done: elapsed > 18 },
    { label: 'Vérification des erreurs citées et calcul du score', done: false },
  ];
  return (
    <div className="xs-center">
      <div className="xs-state is-busy"><FileTextOutlined /></div>
      <h2>Correction en cours</h2>
      <p className="xs-lead">Chaque tâche est corrigée deux fois selon la grille du TCF Canada. Cela prend généralement 20 à 40 secondes.</p>
      <ol className="xs-progress-steps">
        {steps.map((s, i) => <li key={i} className={s.done ? 'is-done' : i === steps.findIndex(x => !x.done) ? 'is-current' : ''}>{s.label}</li>)}
      </ol>
    </div>
  );
}

/** Older simulations (or a database without migration 019) only have per-task scores. */
function legacyReport(r: Result): Report {
  const tasks = r.tasks.map(t => ({
    n: t.task_number, title: TASK_GUIDE[t.task_number]?.label || `Tâche ${t.task_number}`, score: t.score, cefr: (t.level || null) as Report['global']['cefr'],
    words: countWords(t.student_answer), evaluated: true, criteria: [], strengths: t.positives, improvements: t.improvements, errors: [], adjustments: [],
  }));
  return {
    version: 1, exam: 'tcf_canada', skill: 'ee', generatedAt: '',
    global: { score: Math.round(r.average_score), precise: r.average_score, cefr: (r.overall_level || null) as Report['global']['cefr'], nclc: nclcOf(r.average_score), next: null, weights: { 1: 0.25, 2: 0.35, 3: 0.4 } },
    summary: { headline: `Niveau estimé ${r.overall_level}.`, text: '', priorities: [], strengths: [] },
    criteria: [], tasks, reliability: { corrections: 1, arbitrated: false },
  };
}
