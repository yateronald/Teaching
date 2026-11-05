// Activities built around the voice and memory: speaking with speech
// recognition, animated dialogues, flashcards and guided writing.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'motion/react';
import { AudioOutlined, CheckCircleFilled, CheckOutlined, EditOutlined, PauseCircleFilled, PlayCircleOutlined, ReloadOutlined, RetweetOutlined, SoundOutlined, StopOutlined, TranslationOutlined } from '@ant-design/icons';
import { chime, hasRecording, isMuted, speak, stop as stopAudio } from '../audio';
import { gloss, tx, type DialogueChoice, type DialogueLine, type DialogueStep, type FlashcardsStep, type SpeakStep, type WriteStep } from '../types';
import { UI } from '../ui';
import { AccentKeys, AudioButton, Rich, RichBlock, seededShuffle, speechSupported, useSpeech, wordDiff } from './common';
import type { StepHandle, StepProps } from './stepTypes';

// ── Speaking ───────────────────────────────────────────────────────────────

function Recorder({ lang, onDone }: { lang: 'en' | 'fr'; onDone: () => void }) {
  const ui = UI[lang].player;
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      r.ondataavailable = e => chunks.push(e.data);
      r.onstop = () => { stream.getTracks().forEach(t => t.stop()); setUrl(URL.createObjectURL(new Blob(chunks, { type: r.mimeType }))); };
      r.start();
      setRec(r);
    } catch { setDenied(true); onDone(); }
  };
  const stopRec = () => { rec?.stop(); setRec(null); };
  if (denied) return <p className="lx-note">{ui.micDenied}</p>;
  return (
    <div className="lx-recorder">
      {rec
        ? <button type="button" className="lx-mic is-on" onClick={stopRec}><StopOutlined /> {ui.stopRecording}</button>
        : <button type="button" className="lx-mic" onClick={start}><AudioOutlined /> {ui.record}</button>}
      {url && (
        <div className="lx-recorder-play">
          <button type="button" className="lx-btn-soft" onClick={() => new Audio(url).play()}><PlayCircleOutlined /> {ui.playMine}</button>
          <button type="button" className="lx-btn-soft is-good" onClick={onDone}><CheckOutlined /> {ui.selfGood}</button>
          <button type="button" className="lx-link" onClick={() => setUrl(null)}><ReloadOutlined /> {ui.selfRetry}</button>
        </div>
      )}
    </div>
  );
}

export const Speak = forwardRef<StepHandle, StepProps<SpeakStep>>(function Speak({ step, lang, onReady }, ref) {
  const ui = UI[lang].player;
  const supported = useMemo(() => speechSupported(), []);
  const { listening, transcript, error, start, stop } = useSpeech();
  const [attempted, setAttempted] = useState(false);
  useImperativeHandle(ref, () => ({ check: () => null }), []);
  useEffect(() => { onReady(attempted); }, [attempted, onReady]);
  useEffect(() => { const t = window.setTimeout(() => speak(step.text), 400); return () => window.clearTimeout(t); }, [step.text]);

  const diff = transcript ? wordDiff(transcript, step.text) : null;
  const pct = diff ? Math.round((diff.filter(w => w.ok).length / diff.length) * 100) : 0;
  useEffect(() => {
    if (!listening && transcript) { setAttempted(true); if (pct >= 80) chime('right'); }
  }, [listening, transcript, pct]);
  useEffect(() => { if (error) setAttempted(true); }, [error]);

  return (
    <div className="lx-speak">
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang)} /></h2>
      <div className="lx-speak-card">
        <div className="lx-speak-target">
          {diff && !listening
            ? <p>{diff.map((w, i) => <span key={i} className={w.ok ? 'is-ok' : 'is-miss'}>{w.word} </span>)}</p>
            : <p>{step.text}</p>}
          {gloss(step.tr, lang) && <span className="lx-tr">{gloss(step.tr, lang)}</span>}
        </div>
        <div className="lx-speak-audio">
          <AudioButton text={step.text} lang={lang} />
          <AudioButton text={step.text} lang={lang} slow />
        </div>
      </div>
      {supported && error !== 'not-allowed' && error !== 'service-not-allowed' ? (
        <div className="lx-speak-mic">
          <motion.button
            type="button"
            className={`lx-mic-big${listening ? ' is-on' : ''}`}
            onClick={() => { if (listening) stop(); else { stopAudio(); start(); } }}
            animate={listening ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={listening ? { repeat: Infinity, duration: 1.2 } : {}}
            aria-label={listening ? ui.speakListening : ui.speakTap}
          >
            <AudioOutlined />
          </motion.button>
          <p className="lx-mic-label">{listening ? ui.speakListening : ui.speakTap}</p>
          <AnimatePresence>
            {transcript && !listening && (
              <motion.div className={`lx-speak-result${pct >= 80 ? ' is-good' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <p><span>{ui.speakHeard}</span> « {transcript} »</p>
                <strong>{ui.speakScore(pct)}</strong>
                <em>{pct >= 80 ? ui.speakGreat : ui.speakRetry}</em>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="lx-speak-mic">
          <p className="lx-note">{ui.speakUnsupported}</p>
          <Recorder lang={lang} onDone={() => setAttempted(true)} />
        </div>
      )}
      {step.tip && <p className="lx-hint"><SoundOutlined /> <Rich text={tx(step.tip, lang)} /></p>}
      {!attempted && <button type="button" className="lx-link lx-skip-speak" onClick={() => setAttempted(true)}>{ui.skip}</button>}
    </div>
  );
});

// ── Dialogue ───────────────────────────────────────────────────────────────

const isChoice = (l: DialogueLine | DialogueChoice): l is DialogueChoice => 'choose' in l;
const wait = (ms: number) => new Promise(r => window.setTimeout(r, ms));

export const Dialogue = forwardRef<StepHandle, StepProps<DialogueStep>>(function Dialogue({ step, lang, seed, onReady, onScore }, ref) {
  const ui = UI[lang].player;
  const [shown, setShown] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState<Record<number, boolean>>({});
  const [showTr, setShowTr] = useState(lang === 'en');
  const [auto, setAuto] = useState(true);
  const cancel = useRef({ cancelled: false });
  const end = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => ({ check: () => null }), []);

  const textOf = useCallback((i: number) => {
    const l = step.lines[i];
    return isChoice(l) ? l.choose.options[l.choose.answer] : l.fr;
  }, [step.lines]);

  // Plays lines from `from` until the next choice (or the end).
  const run = useCallback(async (from: number) => {
    cancel.current.cancelled = true;
    const token = { cancelled: false };
    cancel.current = token;
    for (let i = from; i < step.lines.length; i++) {
      if (token.cancelled) return;
      const line = step.lines[i];
      if (isChoice(line) && answers[i] === undefined) { setShown(i + 1); return; }
      setShown(i + 1);
      const spk = step.speakers[line.s];
      const started = Date.now();
      await speak(textOf(i), { voice: spk.voice });
      const minMs = isMuted() || !hasRecording(textOf(i), spk.voice) ? 700 + textOf(i).length * 35 : 250;
      await wait(Math.max(0, minMs - (Date.now() - started)) + 250);
    }
  }, [step.lines, step.speakers, answers, textOf]);

  useEffect(() => {
    if (!auto) return;
    const t = window.setTimeout(() => run(0), 400);
    return () => { window.clearTimeout(t); cancel.current.cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [shown]);

  const choices = step.lines.map((l, i) => (isChoice(l) ? i : -1)).filter(i => i >= 0);
  const finished = shown >= step.lines.length && choices.every(i => answers[i] !== undefined);
  useEffect(() => {
    if (finished) {
      if (choices.length) onScore?.(choices.filter(i => firstTry[i]).length / choices.length);
      onReady(true);
    } else onReady(false);
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (lineIdx: number, opt: number) => {
    const line = step.lines[lineIdx] as DialogueChoice;
    if (firstTry[lineIdx] === undefined) setFirstTry(f => ({ ...f, [lineIdx]: opt === line.choose.answer }));
    if (opt !== line.choose.answer) {
      setWrongPick(opt);
      chime('wrong');
      window.setTimeout(() => setWrongPick(null), 700);
      return;
    }
    chime('right');
    setAnswers(a => ({ ...a, [lineIdx]: opt }));
    // Continue the conversation after the chosen reply is spoken.
    window.setTimeout(async () => {
      await speak(line.choose.options[opt], { voice: step.speakers[line.s].voice });
      await wait(250);
      run(lineIdx + 1);
    }, 50);
  };

  const pending = step.lines.findIndex((l, i) => i < shown && isChoice(l) && answers[i] === undefined);

  return (
    <div className="lx-dialogue">
      <header className="lx-dlg-head">
        <div>
          <h2>{tx(step.title, lang)}</h2>
          {step.scene && <p>{tx(step.scene, lang)}</p>}
        </div>
        <div className="lx-dlg-tools">
          <button type="button" className={`lx-toggle${showTr ? ' is-on' : ''}`} onClick={() => setShowTr(s => !s)} aria-pressed={showTr}><TranslationOutlined /> {ui.dialogueTranslate}</button>
          <button type="button" className="lx-toggle" onClick={() => { setAuto(true); setShown(0); setTimeout(() => run(0), 50); }}><RetweetOutlined /> {ui.replay}</button>
        </div>
      </header>
      <div className="lx-chat">
        {step.lines.slice(0, shown).map((line, i) => {
          const spk = step.speakers[line.s];
          if (isChoice(line) && answers[i] === undefined) return null;
          const text = textOf(i);
          const tr = isChoice(line) ? undefined : gloss(line.tr, lang);
          return (
            <motion.div key={i} className={`lx-bubble-row is-${spk.side}`} initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }}>
              <span className="lx-avatar" aria-hidden>{spk.name.charAt(0)}</span>
              <div className={`lx-bubble${isChoice(line) ? ' is-mine' : ''}`}>
                <span className="lx-bubble-name">{spk.name}</span>
                <button type="button" onClick={() => speak(text, { voice: spk.voice })}>{text}</button>
                {showTr && tr && <em>{tr}</em>}
              </div>
            </motion.div>
          );
        })}
        <AnimatePresence>
          {pending >= 0 && (() => {
            const line = step.lines[pending] as DialogueChoice;
            return (
              <motion.div key={`c${pending}`} className="lx-dlg-choose" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p>{ui.dialogueChoose}</p>
                {seededShuffle(line.choose.options.map((_, k) => k), `${seed}-${pending}`).map(k => (
                  <motion.button key={k} type="button" className={`lx-reply${wrongPick === k ? ' is-wrong' : ''}`} onClick={() => pick(pending, k)}
                    animate={wrongPick === k ? { x: [0, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
                    {line.choose.options[k]}
                  </motion.button>
                ))}
                {wrongPick !== null && line.choose.explain && <p className="lx-hint"><Rich text={tx(line.choose.explain, lang)} /></p>}
              </motion.div>
            );
          })()}
        </AnimatePresence>
        <div ref={end} />
      </div>
    </div>
  );
});

// ── Flashcards ─────────────────────────────────────────────────────────────

export const Flashcards = forwardRef<StepHandle, StepProps<FlashcardsStep>>(function Flashcards({ step, lang, onReady }, ref) {
  const ui = UI[lang].player;
  const [queue, setQueue] = useState<number[]>(() => step.cards.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const [exit, setExit] = useState<1 | -1>(1);
  useImperativeHandle(ref, () => ({ check: () => null }), []);
  useEffect(() => { onReady(queue.length === 0); }, [queue, onReady]);
  const current = queue[0];
  useEffect(() => { if (current !== undefined) { const t = window.setTimeout(() => speak(step.cards[current].fr), 300); return () => window.clearTimeout(t); } }, [current, step.cards]);

  const answer = (knew: boolean) => {
    setExit(knew ? 1 : -1);
    setFlipped(false);
    setQueue(q => (knew ? q.slice(1) : [...q.slice(1), q[0]]));
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110) answer(true);
    else if (info.offset.x < -110) answer(false);
  };

  return (
    <div className="lx-cards">
      <h2 className="lx-prompt">{tx(step.title, lang)}</h2>
      <p className="lx-sub">{queue.length ? `${ui.flip} · ${ui.cardsLeft(queue.length)}` : ''}</p>
      <div className="lx-deck">
        <AnimatePresence custom={exit}>
          {current !== undefined ? (
            <motion.div
              key={`${current}-${queue.length}`}
              className="lx-card3d"
              custom={exit}
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              variants={{ out: (d: number) => ({ opacity: 0, x: d * 260, rotate: d * 12, transition: { duration: 0.32 } }) }}
              exit="out"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.9}
              onDragEnd={onDragEnd}
            >
              <motion.div className="lx-card-inner" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }} onClick={() => setFlipped(f => !f)}>
                <div className="lx-card-face is-front">
                  <span className="lx-card-kicker">FR</span>
                  <strong>{step.cards[current].fr}</strong>
                  <AudioButton text={step.cards[current].fr} lang={lang} />
                </div>
                <div className="lx-card-face is-back">
                  <span className="lx-card-kicker">{lang === 'en' ? 'EN' : 'Sens'}</span>
                  <strong>{gloss(step.cards[current].tr, lang) || tx(step.cards[current].tr as never, 'en')}</strong>
                  {step.cards[current].ex && <p><Rich text={step.cards[current].ex!} /></p>}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="done" className="lx-deck-done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <CheckCircleFilled /> {ui.deckDone}
            </motion.div>
          )}
        </AnimatePresence>
        {queue.length > 1 && <div className="lx-deck-under" aria-hidden />}
      </div>
      {current !== undefined && (
        <div className="lx-cards-actions">
          <button type="button" className="lx-btn-soft is-again" onClick={() => answer(false)}><ReloadOutlined /> {ui.again}</button>
          <button type="button" className="lx-btn-soft is-good" onClick={() => answer(true)}><CheckOutlined /> {ui.knew}</button>
        </div>
      )}
    </div>
  );
});

// ── Guided writing ─────────────────────────────────────────────────────────

const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).filter(w => /[\p{L}\d]/u.test(w)).length : 0);

export const Write = forwardRef<StepHandle, StepProps<WriteStep>>(function Write({ step, lang, onReady, onDemo }, ref) {
  const ui = UI[lang].player;
  const [text, setText] = useState('');
  const [ticks, setTicks] = useState<boolean[]>(() => step.checklist.map(() => false));
  const [model, setModel] = useState(false);
  const area = useRef<HTMLTextAreaElement | null>(null);
  const n = countWords(text);
  useImperativeHandle(ref, () => ({ check: () => null }), []);
  useEffect(() => { onReady(model || n >= Math.ceil(step.min / 2)); }, [model, n, step.min, onReady]);

  const insert = (p: string) => {
    const el = area.current;
    const start = el?.selectionStart ?? text.length;
    const next = text.slice(0, start) + (start && !/\s$/.test(text.slice(0, start)) ? ' ' : '') + p + ' ' + text.slice(start);
    setText(next);
    el?.focus();
  };
  const state = n === 0 ? '' : n < step.min ? 'is-low' : n > step.max ? 'is-high' : 'is-ok';
  const fill = Math.min(1, n / step.max);

  return (
    <div className="lx-write">
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang)} /></h2>
      {step.task && <div className="lx-task"><EditOutlined aria-hidden /><RichBlock text={tx(step.task, lang)} /></div>}
      <div className="lx-editor">
        <textarea ref={area} value={text} onChange={e => setText(e.target.value)} placeholder={ui.writePlaceholder} rows={8} spellCheck={false} lang="fr" />
        <div className={`lx-wordbar ${state}`}>
          <span>{ui.words(n)}</span>
          <i><b style={{ transform: `scaleX(${fill})` }} /><u style={{ left: `${(step.min / step.max) * 100}%` }} /></i>
          <span>{ui.wordRange(step.min, step.max)}</span>
        </div>
      </div>
      <AccentKeys target={area} lang={lang} />
      {step.phrases && (
        <div className="lx-phrases">
          <p>{ui.phrases}</p>
          <div>{step.phrases.map(p => <button key={p} type="button" className="lx-chip" onClick={() => insert(p)}>{p}</button>)}</div>
        </div>
      )}
      <div className="lx-checklist">
        <p>{ui.checklist}</p>
        {step.checklist.map((c, i) => (
          <label key={i} className={ticks[i] ? 'is-on' : ''}>
            <input type="checkbox" checked={ticks[i]} onChange={() => setTicks(t => t.map((x, k) => (k === i ? !x : x)))} />
            <span><Rich text={tx(c, lang)} /></span>
          </label>
        ))}
      </div>
      {!model ? (
        <button type="button" className="lx-btn-soft" onClick={() => setModel(true)}><PauseCircleFilled /> {ui.showModel}</button>
      ) : (
        <motion.div className="lx-model" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="lx-model-title">{ui.model}</p>
          <RichBlock text={step.model} className="lx-model-text" />
          {step.modelNote && <p className="lx-model-note"><Rich text={tx(step.modelNote, lang)} /></p>}
        </motion.div>
      )}
      {onDemo && (
        <div className="lx-upsell">
          <span>{ui.teacherCorrection}</span>
          <button type="button" className="lx-link" onClick={onDemo}>{ui.teacherCorrectionCta} →</button>
        </div>
      )}
    </div>
  );
});
