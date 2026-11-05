// Explanation cards and the classic exercises: multiple choice, gap fill,
// dictation and conjugation tables.
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BulbOutlined, CheckOutlined, ClockCircleOutlined, CloseOutlined, CompassOutlined, FileTextOutlined, PlayCircleFilled, TrophyOutlined, WarningOutlined } from '@ant-design/icons';
import { speak } from '../audio';
import { imageUrl } from '../categories';
import { gloss, tx, type Lang, type ConceptStep, type ConjugateStep, type DictationStep, type FillStep, type McqStep } from '../types';
import { UI } from '../ui';
import { AccentKeys, AudioButton, Rich, RichBlock, compare, normalize, seededShuffle, wordDiff } from './common';
import type { StepHandle, StepProps } from './stepTypes';

const rise = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

// ── Concept ────────────────────────────────────────────────────────────────

const VARIANT_ICON = { tip: <BulbOutlined />, culture: <CompassOutlined />, exam: <TrophyOutlined />, trap: <WarningOutlined /> };
const VARIANT_LABEL = {
  en: { tip: 'Tip', culture: 'Culture', exam: 'Exam strategy', trap: 'Watch out' },
  fr: { tip: 'Astuce', culture: 'Culture', exam: 'Stratégie d’examen', trap: 'Attention' },
};

export const Concept = forwardRef<StepHandle, StepProps<ConceptStep>>(function Concept({ step, lang, onReady }, ref) {
  const ui = UI[lang].player;
  const examples = step.examples ?? [];
  const [shown, setShown] = useState(examples.length ? 1 : 0);
  useImperativeHandle(ref, () => ({ check: () => null }), []);
  useEffect(() => { onReady(shown >= examples.length); }, [shown, examples.length, onReady]);
  const reveal = () => {
    const next = shown + 1;
    setShown(next);
    speak(examples[next - 1].fr);
  };
  const variant = step.variant && step.variant !== 'default' ? step.variant : null;

  return (
    <div className={`lx-concept${variant ? ` is-${variant}` : ''}`}>
      {variant && <p className="lx-concept-tag">{VARIANT_ICON[variant]}{VARIANT_LABEL[lang][variant]}</p>}
      <motion.h2 {...rise} transition={{ duration: 0.4 }}>{tx(step.title, lang)}</motion.h2>
      {step.image && (
        <motion.figure className="lx-concept-img" {...rise} transition={{ delay: 0.08, duration: 0.45 }}>
          <img src={imageUrl(step.image)} alt="" loading="lazy" />
        </motion.figure>
      )}
      {step.body && <motion.div {...rise} transition={{ delay: 0.1, duration: 0.4 }}><RichBlock text={tx(step.body, lang)} className="lx-concept-body" /></motion.div>}
      {step.points && (
        <ul className="lx-points">
          {step.points.map((p, i) => (
            <motion.li key={i} {...rise} transition={{ delay: 0.18 + i * 0.09, duration: 0.35 }}><CheckOutlined aria-hidden /><Rich text={tx(p, lang)} /></motion.li>
          ))}
        </ul>
      )}
      {step.table && (
        <motion.div className="lx-table-wrap" {...rise} transition={{ delay: 0.15, duration: 0.4 }}>
          <table className="lx-table">
            {step.table.caption && <caption>{tx(step.table.caption, lang)}</caption>}
            <thead><tr>{step.table.head.map((h, i) => <th key={i} scope="col">{tx(h, lang)}</th>)}</tr></thead>
            <tbody>
              {step.table.rows.map((row, r) => (
                <motion.tr key={r} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + r * 0.07 }}>
                  {row.map((cell, k) => <td key={k}><Rich text={tx(cell, lang)} /></td>)}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
      {examples.length > 0 && (
        <div className="lx-examples">
          <p className="lx-examples-hint">{ui.tapToHear}</p>
          <ol>
            <AnimatePresence initial={false}>
              {examples.slice(0, shown).map((ex, i) => (
                <motion.li key={i} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35 }}>
                  <AudioButton text={ex.fr} lang={lang} size="sm" />
                  <div>
                    <button type="button" className="lx-ex-fr" onClick={() => speak(ex.fr)}><Rich text={ex.fr} /></button>
                    {gloss(ex.tr, lang) && <p className="lx-ex-tr">{gloss(ex.tr, lang)}</p>}
                    {ex.note && <p className="lx-ex-note"><Rich text={tx(ex.note, lang)} /></p>}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {shown < examples.length && (
            <div className="lx-examples-more">
              <button type="button" className="lx-btn-soft" onClick={reveal}>{ui.next} <span>{shown}/{examples.length}</span></button>
              <button type="button" className="lx-link" onClick={() => setShown(examples.length)}>{ui.showAll}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ── Multiple choice ────────────────────────────────────────────────────────

function Countdown({ seconds, lang, stop }: { seconds: number; lang: Lang; stop: boolean }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (stop) return;
    const id = window.setInterval(() => setLeft(l => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(id);
  }, [stop]);
  const pct = left / seconds;
  return (
    <div className={`lx-timer${left <= 10 ? ' is-low' : ''}`} aria-label={UI[lang].player.timer}>
      <ClockCircleOutlined aria-hidden />
      <span>{Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span>
      <i style={{ transform: `scaleX(${pct})` }} />
    </div>
  );
}

export const Mcq = forwardRef<StepHandle, StepProps<McqStep>>(function Mcq({ step, lang, locked, seed, onReady }, ref) {
  const ui = UI[lang].player;
  // Options appear in a shuffled order (authors may list the right answer first).
  const order = useMemo(() => (step.fixedOrder ? step.options.map((_, i) => i) : seededShuffle(step.options.map((_, i) => i), seed)), [step.options, step.fixedOrder, seed]);
  const [picked, setPicked] = useState<number | null>(null);
  useImperativeHandle(ref, () => ({
    check: () => (picked === null ? null : {
      correct: picked === step.answer,
      answer: tx(step.options[step.answer], lang),
      explain: tx(step.explain, lang) || undefined,
    }),
  }), [picked, step, lang]);
  useEffect(() => { onReady(picked !== null); }, [picked, onReady]);
  // Listening questions start by themselves: the learner just pressed Continue.
  useEffect(() => { if (step.audio && step.listen) { const t = window.setTimeout(() => speak(step.audio!, { voice: step.voice }), 450); return () => window.clearTimeout(t); } }, [step.audio, step.listen, step.voice]);
  useEffect(() => {
    if (locked) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= order.length && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) setPicked(order[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [locked, order]);

  const frParts = step.fr ? step.fr.split('___') : null;
  return (
    <div className="lx-mcq">
      {(step.level || step.timer) && (
        <div className="lx-q-head">
          {step.level && <span className="lx-level-chip">{step.level}</span>}
          {step.timer && <Countdown seconds={step.timer} lang={lang} stop={locked} />}
        </div>
      )}
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang)} /></h2>
      {step.image && <figure className="lx-q-img"><img src={imageUrl(step.image)} alt="" /></figure>}
      {step.audio && step.listen && (
        <div className="lx-listen">
          <button type="button" className="lx-listen-play" onClick={() => speak(step.audio!, { voice: step.voice })} aria-label={ui.listen}><PlayCircleFilled /></button>
          <div className="lx-listen-side">
            <span>{ui.listen}</span>
            <AudioButton text={step.audio} voice={step.voice} lang={lang} slow size="sm" />
          </div>
          {locked && <p className="lx-transcript">« {step.audio} »</p>}
        </div>
      )}
      {step.audio && !step.listen && (
        <p className="lx-q-fr"><AudioButton text={step.audio} voice={step.voice} lang={lang} size="sm" /><span>{step.audio}</span></p>
      )}
      {step.doc && (
        <article className="lx-doc">
          <header><FileTextOutlined aria-hidden />{step.doc.title ? tx(step.doc.title, lang) : 'Document'}</header>
          <RichBlock text={step.doc.text} />
          {step.doc.source && <footer>{tx(step.doc.source, lang)}</footer>}
        </article>
      )}
      {frParts && (
        <p className="lx-q-fr is-gap">
          {frParts.map((part, i) => (
            <span key={i}>{part}{i < frParts.length - 1 && <b className={`lx-gap${picked !== null ? ' is-filled' : ''}`}>{picked !== null ? tx(step.options[picked], lang) : ' '}</b>}</span>
          ))}
        </p>
      )}
      <div className={`lx-options${step.options.length > 4 ? ' is-many' : ''}`} role="radiogroup">
        {order.map((i, k) => {
          const o = step.options[i];
          const state = locked ? (i === step.answer ? 'is-right' : i === picked ? 'is-wrong' : 'is-dim') : picked === i ? 'is-picked' : '';
          return (
            <motion.button
              key={i}
              type="button"
              role="radio"
              aria-checked={picked === i}
              disabled={locked}
              className={`lx-option ${state}`}
              onClick={() => setPicked(i)}
              initial={{ opacity: 0, y: 10 }}
              animate={locked && i === picked && i !== step.answer ? { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] } : { opacity: 1, y: 0 }}
              transition={{ delay: locked ? 0 : 0.05 + k * 0.05, duration: locked ? 0.4 : 0.3 }}
            >
              <kbd>{k + 1}</kbd>
              <span><Rich text={tx(o, lang)} /></span>
              {locked && i === step.answer && <CheckOutlined className="lx-option-mark" />}
              {locked && i === picked && i !== step.answer && <CloseOutlined className="lx-option-mark" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});

// ── Gap fill ───────────────────────────────────────────────────────────────

export const Fill = forwardRef<StepHandle, StepProps<FillStep>>(function Fill({ step, lang, locked, seed, onReady }, ref) {
  const ui = UI[lang].player;
  const parts = step.text.split('___');
  const blanks = parts.length - 1;
  const [values, setValues] = useState<string[]>(() => Array(blanks).fill(''));
  const [states, setStates] = useState<('ok' | 'accents' | 'no')[]>([]);
  const [hint, setHint] = useState(false);
  const focused = useRef<HTMLInputElement | null>(null);
  const firstInput = useRef<HTMLInputElement | null>(null);
  const chips = useMemo(() => step.choices?.map((c, i) => seededShuffle(c, `${seed}-${i}`)), [step.choices, seed]);

  useEffect(() => { onReady(values.every(v => v.trim() !== '')); }, [values, onReady]);
  useEffect(() => { if (!step.choices) window.setTimeout(() => firstInput.current?.focus(), 350); }, [step.choices]);

  useImperativeHandle(ref, () => ({
    check: () => {
      if (values.some(v => !v.trim())) return null;
      const res = values.map((v, i) => compare(v, step.answers[i]));
      const st = res.map(r => (r.match === 'exact' ? 'ok' : r.match === 'accents' && !step.strict ? 'accents' : 'no')) as ('ok' | 'accents' | 'no')[];
      setStates(st);
      const full = parts.map((p, i) => p + (i < blanks ? step.answers[i][0] : '')).join('');
      const correct = st.every(s => s !== 'no');
      const accentFix = st.some(s => s === 'accents');
      return {
        correct,
        answer: full,
        explain: tx(step.explain, lang) || undefined,
        warning: correct && accentFix ? `${ui.accentWarning} ${res.filter((_, i) => st[i] === 'accents').map(r => r.best).join(', ')}` : undefined,
      };
    },
  }), [values, step, parts, blanks, lang, ui.accentWarning]);

  const set = (i: number, v: string) => setValues(prev => prev.map((x, k) => (k === i ? v : x)));

  return (
    <div className="lx-fill">
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang)} /></h2>
      <p className="lx-fill-text">
        {parts.map((p, i) => (
          <span key={i}>
            {p}
            {i < blanks && (chips ? (
              <span className={`lx-blank-chip${values[i] ? ' is-filled' : ''}${locked ? ` is-${states[i] ?? 'ok'}` : ''}`}>{values[i] || ' '}</span>
            ) : (
              <input
                ref={i === 0 ? firstInput : undefined}
                className={`lx-blank${locked ? ` is-${states[i] ?? 'ok'}` : ''}`}
                value={values[i]}
                disabled={locked}
                onFocus={e => { focused.current = e.currentTarget; }}
                onChange={e => set(i, e.target.value)}
                size={Math.max(4, step.answers[i][0].length + 1)}
                autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}
                aria-label={`${ui.typeHere} ${i + 1}`}
              />
            ))}
          </span>
        ))}
      </p>
      {gloss(step.tr, lang) && <p className="lx-tr">{gloss(step.tr, lang)}</p>}
      {chips && !locked && (
        <div className="lx-chip-rows">
          {chips.map((row, i) => (
            <div key={i} className="lx-chips">
              {blanks > 1 && <span className="lx-chips-n">{i + 1}</span>}
              {row.map(ch => (
                <motion.button key={ch} type="button" whileTap={{ scale: 0.94 }} className={`lx-chip${values[i] === ch ? ' is-on' : ''}`} onClick={() => set(i, values[i] === ch ? '' : ch)}>{ch}</motion.button>
              ))}
            </div>
          ))}
        </div>
      )}
      {!chips && !locked && <AccentKeys target={focused} lang={lang} />}
      {step.hint && !locked && (
        hint ? <p className="lx-hint"><BulbOutlined /> <Rich text={tx(step.hint, lang)} /></p>
          : <button type="button" className="lx-link lx-hint-btn" onClick={() => setHint(true)}><BulbOutlined /> {ui.hint}</button>
      )}
    </div>
  );
});

// ── Dictation ──────────────────────────────────────────────────────────────

export const Dictation = forwardRef<StepHandle, StepProps<DictationStep>>(function Dictation({ step, lang, locked, onReady }, ref) {
  const ui = UI[lang].player;
  const [value, setValue] = useState('');
  const [diff, setDiff] = useState<{ word: string; ok: boolean }[] | null>(null);
  const area = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => { onReady(value.trim().length > 0); }, [value, onReady]);
  useEffect(() => { const t = window.setTimeout(() => speak(step.text, { voice: step.voice }), 450); return () => window.clearTimeout(t); }, [step.text, step.voice]);
  useImperativeHandle(ref, () => ({
    check: () => {
      if (!value.trim()) return null;
      const r = compare(value, [step.text]);
      const d = wordDiff(value, step.text, !!step.strict);
      setDiff(d);
      const correct = r.match === 'exact' || (r.match === 'accents' && !step.strict);
      return { correct, answer: step.text, warning: correct && r.match === 'accents' ? `${ui.accentWarning} ${step.text}` : undefined };
    },
  }), [value, step, ui.accentWarning]);

  return (
    <div className="lx-dictation">
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang) || ui.dictation} /></h2>
      <div className="lx-listen">
        <button type="button" className="lx-listen-play" onClick={() => speak(step.text, { voice: step.voice })} aria-label={ui.listen}><PlayCircleFilled /></button>
        <div className="lx-listen-side"><span>{ui.listen}</span><AudioButton text={step.text} voice={step.voice} lang={lang} slow size="sm" /></div>
      </div>
      {locked && diff ? (
        <p className="lx-diff">{diff.map((w, i) => <span key={i} className={w.ok ? 'is-ok' : 'is-miss'}>{w.word} </span>)}</p>
      ) : (
        <>
          <textarea ref={area} className="lx-textarea is-short" value={value} onChange={e => setValue(e.target.value)} placeholder={ui.typeHere} rows={2} disabled={locked} autoCapitalize="off" autoCorrect="off" spellCheck={false} autoFocus />
          <AccentKeys target={area} lang={lang} />
        </>
      )}
      {step.hint && <p className="lx-hint"><BulbOutlined /> <Rich text={tx(step.hint, lang)} /></p>}
    </div>
  );
});

// ── Conjugation table ──────────────────────────────────────────────────────

export const Conjugate = forwardRef<StepHandle, StepProps<ConjugateStep>>(function Conjugate({ step, lang, locked, onReady }, ref) {
  const given = useMemo(() => new Set(step.given ?? []), [step.given]);
  const [values, setValues] = useState<string[]>(() => step.forms.map(([, a], i) => (given.has(i) ? a : '')));
  const [states, setStates] = useState<boolean[]>([]);
  const focused = useRef<HTMLInputElement | null>(null);
  useEffect(() => { onReady(values.every(v => v.trim())); }, [values, onReady]);
  useImperativeHandle(ref, () => ({
    check: () => {
      if (values.some(v => !v.trim())) return null;
      const st = values.map((v, i) => normalize(v) === normalize(step.forms[i][1]) || compare(v, [step.forms[i][1]]).match === 'accents');
      setStates(st);
      return {
        correct: st.every(Boolean),
        answer: step.forms.map(([p, a]) => `${p} ${a}`).join(' · '),
        explain: tx(step.explain, lang) || undefined,
      };
    },
  }), [values, step, lang]);

  return (
    <div className="lx-conj">
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang)} /></h2>
      <div className="lx-conj-card">
        <header><strong>{step.verb}</strong><span>{tx(step.tense, lang)}</span></header>
        <ol>
          {step.forms.map(([pron, ans], i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={locked ? (states[i] ? 'is-ok' : 'is-no') : given.has(i) ? 'is-given' : ''}>
              <span className="lx-conj-pron">{pron}</span>
              <input
                value={values[i]}
                disabled={locked || given.has(i)}
                onFocus={e => { focused.current = e.currentTarget; }}
                onChange={e => setValues(v => v.map((x, k) => (k === i ? e.target.value : x)))}
                autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}
                aria-label={`${step.verb}, ${pron}`}
              />
              {locked && !states[i] && <em className="lx-conj-fix">{ans}</em>}
            </motion.li>
          ))}
        </ol>
      </div>
      {!locked && <AccentKeys target={focused} lang={lang} />}
    </div>
  );
});
