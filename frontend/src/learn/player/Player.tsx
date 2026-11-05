// The lesson player: one activity at a time, a Check button, immediate
// feedback, the mistakes coming back at the end, then the results.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircleFilled, CloseCircleFilled, CloseOutlined, FireFilled, SoundOutlined, StarFilled } from '@ant-design/icons';
import { chime, hasRecording, setMuted, stop as stopAudio } from '../audio';
import { isGraded, tx, type Lang, type Step } from '../types';
import { UI } from '../ui';
import { Rich } from './common';
import { Concept, Conjugate, Dictation, Fill, Mcq } from './stepsBasic';
import { Categorize, Hotspot, Match, Order } from './stepsBuild';
import { Dialogue, Flashcards, Speak, Write } from './stepsVoice';
import type { Result, StepHandle, StepMode } from './stepTypes';

export interface PlayerOutcome {
  /** 0–1, first attempts only. */
  score: number;
  xp: number;
  seconds: number;
  mistakes: { step: Step; answer?: string }[];
  /** Per graded step, in order: first attempt right or wrong. */
  graded: boolean[];
}

interface Props {
  steps: Step[];
  lang: Lang;
  seed: string;
  title: string;
  onExit: () => void;
  onFinish: (o: PlayerOutcome) => void;
  onDemo?: () => void;
  /** Final assessment: no second chance, no explanations until the end. */
  exam?: boolean;
}

const modeOf = (s: Step): StepMode => {
  if (s.kind === 'dialogue') return s.lines.some(l => 'choose' in l) ? 'inline' : 'self';
  if (s.kind === 'match' || s.kind === 'hotspot') return 'inline';
  return isGraded(s) ? 'check' : 'self';
};

function StepView({ step, ...rest }: { step: Step } & Omit<React.ComponentProps<typeof Mcq>, 'step'>) {
  switch (step.kind) {
    case 'concept': return <Concept step={step} {...rest} />;
    case 'mcq': return <Mcq step={step} {...rest} />;
    case 'fill': return <Fill step={step} {...rest} />;
    case 'dictation': return <Dictation step={step} {...rest} />;
    case 'conjugate': return <Conjugate step={step} {...rest} />;
    case 'order': return <Order step={step} {...rest} />;
    case 'match': return <Match step={step} {...rest} />;
    case 'categorize': return <Categorize step={step} {...rest} />;
    case 'hotspot': return <Hotspot step={step} {...rest} />;
    case 'speak': return <Speak step={step} {...rest} />;
    case 'dialogue': return <Dialogue step={step} {...rest} />;
    case 'flashcards': return <Flashcards step={step} {...rest} />;
    case 'write': return <Write step={step} {...rest} />;
  }
}

interface QueueItem { step: Step; index: number; retry: boolean }

/**
 * Steps that need a recording are adapted while a recording is missing: a
 * listening question shows its text, a dictation is left out. Nothing changes
 * once the audio exists (scripts/learn-media.mjs).
 */
export function playableSteps(steps: Step[]): Step[] {
  return steps
    .filter(s => s.kind !== 'dictation' || hasRecording(s.text, s.voice))
    .map(s => (s.kind === 'mcq' && s.audio && s.listen && !hasRecording(s.audio, s.voice) ? { ...s, listen: false } : s));
}

export default function Player({ steps: rawSteps, lang, seed, title, onExit, onFinish, onDemo, exam = false }: Props) {
  const steps = useMemo(() => playableSteps(rawSteps), [rawSteps]);
  const ui = UI[lang].player;
  const [queue, setQueue] = useState<QueueItem[]>(() => steps.map((step, index) => ({ step, index, retry: false })));
  const [pos, setPos] = useState(0);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [sound, setSound] = useState(true);
  const handle = useRef<StepHandle | null>(null);
  const inlineScore = useRef<number | null>(null);
  const first = useRef<Map<number, number>>(new Map());
  const mistakes = useRef<{ step: Step; answer?: string }[]>([]);
  const started = useRef(Date.now());
  const footRef = useRef<HTMLButtonElement | null>(null);

  const item = queue[pos];
  const mode = item ? modeOf(item.step) : 'self';
  const total = queue.length;
  const gradedCount = useMemo(() => steps.filter(s => modeOf(s) !== 'self').length, [steps]);
  const praise = useMemo(() => ui.correct[(pos * 7 + seed.length) % ui.correct.length], [pos, seed, ui.correct]);

  useEffect(() => { setMuted(!sound); }, [sound]);
  useEffect(() => () => { stopAudio(); }, []);

  const onReady = useCallback((r: boolean) => setReady(r), []);
  const onScore = useCallback((f: number) => { inlineScore.current = f; }, []);

  const finish = useCallback(() => {
    const graded = steps.map((s, i) => (modeOf(s) === 'self' ? null : (first.current.get(i) ?? 0) >= 0.999)).filter((x): x is boolean => x !== null);
    const sum = steps.reduce((acc, s, i) => acc + (modeOf(s) === 'self' ? 0 : first.current.get(i) ?? 0), 0);
    const score = gradedCount ? sum / gradedCount : 1;
    const bonus = exam ? 0 : 20 + (score >= 0.999 ? 15 : 0);
    chime('done');
    onFinish({ score, xp: xp + bonus, seconds: Math.round((Date.now() - started.current) / 1000), mistakes: mistakes.current, graded });
  }, [steps, gradedCount, xp, exam, onFinish]);

  const advance = useCallback(() => {
    stopAudio();
    setResult(null);
    setReady(false);
    inlineScore.current = null;
    if (pos + 1 >= queue.length) finish();
    else setPos(p => p + 1);
  }, [pos, queue.length, finish]);

  const check = useCallback(() => {
    if (!item) return;
    if (mode === 'self') { advance(); return; }
    if (mode === 'inline') {
      const f = inlineScore.current ?? 1;
      if (!item.retry && !first.current.has(item.index)) first.current.set(item.index, f);
      setXp(x => x + Math.round(f * 10));
      advance();
      return;
    }
    const r = handle.current?.check();
    if (!r) return;
    setResult(r);
    if (!item.retry && !first.current.has(item.index)) first.current.set(item.index, r.correct ? 1 : 0);
    if (r.correct) {
      chime('right');
      setXp(x => x + (item.retry ? 5 : 10));
      setCombo(c => c + 1);
    } else {
      chime('wrong');
      setCombo(0);
      if (!item.retry) mistakes.current.push({ step: item.step, answer: r.answer });
      // A missed question comes back once, at the end (not in the final assessment).
      if (!exam && !item.retry) setQueue(q => [...q, { ...item, retry: true }]);
    }
    window.setTimeout(() => footRef.current?.focus(), 30);
  }, [item, mode, advance, exam]);

  // Enter: check, then continue.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLButtonElement && e.target !== footRef.current) return;
      e.preventDefault();
      if (result) advance();
      else if (ready) check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [result, ready, check, advance]);

  const exit = () => { if (pos === 0 || window.confirm(ui.exitConfirm)) { stopAudio(); onExit(); } };

  if (!item) return null;
  const locked = !!result;
  const buttonLabel = result ? ui.continue : mode === 'check' ? ui.check : item.step.kind === 'concept' ? ui.gotIt : ui.continue;

  return (
    <div className="lx-player" role="dialog" aria-modal="true" aria-label={title}>
      <header className="lx-ptop">
        <button type="button" className="lx-icon-btn" onClick={exit} aria-label={ui.exit} title={ui.exit}><CloseOutlined /></button>
        <div className="lx-pbar" role="progressbar" aria-label={ui.progress} aria-valuemin={0} aria-valuemax={total} aria-valuenow={pos}>
          <motion.i animate={{ scaleX: (pos + (result ? 1 : 0)) / total }} transition={{ type: 'spring', stiffness: 160, damping: 26 }} />
        </div>
        <AnimatePresence>
          {combo >= 3 && (
            <motion.span key="combo" className="lx-combo" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <FireFilled /> {combo}
            </motion.span>
          )}
        </AnimatePresence>
        <span className="lx-xp" aria-label={`${xp} ${ui.xp}`}><StarFilled /> <motion.b key={xp} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{xp}</motion.b></span>
        <button type="button" className={`lx-icon-btn${sound ? '' : ' is-off'}`} onClick={() => setSound(s => !s)} aria-pressed={sound} aria-label={sound ? ui.soundOn : ui.soundOff} title={sound ? ui.soundOn : ui.soundOff}><SoundOutlined /></button>
      </header>

      <main className="lx-pstage">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${pos}-${item.index}`}
            className={`lx-step is-${item.step.kind}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {item.retry && <p className="lx-retry-tag">↺ {lang === 'fr' ? 'Deuxième essai' : 'Second try'}</p>}
            <StepView
              ref={handle as never}
              step={item.step}
              lang={lang}
              locked={locked}
              seed={`${seed}-${item.index}`}
              onReady={onReady}
              onScore={onScore}
              onDemo={onDemo}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className={`lx-pfoot${result ? (result.correct ? ' is-right' : ' is-wrong') : ''}`}>
        <div className="lx-pfoot-in">
          {result ? (
            <motion.div key={`fb-${pos}`} className="lx-feedback" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
              <span className="lx-fb-icon">{result.correct ? <CheckCircleFilled /> : <CloseCircleFilled />}</span>
              <div>
                <strong>{result.correct ? praise : ui.wrong}</strong>
                {!result.correct && result.answer && <p><span>{ui.answerWas}</span> <Rich text={result.answer} /></p>}
                {result.warning && <p className="lx-fb-warn">{result.warning}</p>}
                {result.explain && <p className="lx-fb-explain"><Rich text={result.explain} /></p>}
                {!result.correct && !exam && !item.retry && <p className="lx-fb-again">{ui.comeBack}</p>}
              </div>
            </motion.div>
          ) : (
            <p className="lx-pfoot-kind">{UI[lang].kinds[item.step.kind]}</p>
          )}
          <motion.button
            ref={footRef}
            type="button"
            className={`lx-pbtn${result ? (result.correct ? ' is-right' : ' is-wrong') : ''}`}
            disabled={!result && !ready}
            onClick={() => (result ? advance() : check())}
            whileTap={{ scale: 0.97 }}
          >
            {buttonLabel}
          </motion.button>
        </div>
      </footer>
    </div>
  );
}

export { modeOf };
export const stepTitle = (s: Step, lang: Lang): string => {
  switch (s.kind) {
    case 'concept': return tx(s.title, lang);
    case 'dialogue': return tx(s.title, lang);
    case 'flashcards': return tx(s.title, lang);
    default: return tx(s.prompt, lang);
  }
};
