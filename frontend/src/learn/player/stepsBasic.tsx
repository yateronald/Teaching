// Explanation cards and the classic exercises: multiple choice, gap fill,
// dictation and conjugation tables.
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BookOutlined, BulbOutlined, CheckCircleFilled, CheckOutlined, ClockCircleOutlined, CloseOutlined, CompassOutlined, FileTextOutlined, PauseCircleOutlined, PlayCircleFilled, SoundOutlined, TrophyOutlined, WarningOutlined } from '@ant-design/icons';
import { hasRecording, speak, stop as stopAudio, usePlaying } from '../audio';
import { imageUrl } from '../categories';
import { gloss, tx, type Lang, type ConceptStep, type ConjugateStep, type DictationStep, type FillStep, type McqStep } from '../types';
import { UI } from '../ui';
import { AccentKeys, AudioButton, DocBody, Rich, RichBlock, compare, normalize, seededShuffle, wordDiff } from './common';
import type { StepHandle, StepProps } from './stepTypes';

const rise = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

// ── Concept ────────────────────────────────────────────────────────────────

const VARIANT_ICON = {
  default: <BookOutlined />,
  tip: <BulbOutlined />,
  culture: <CompassOutlined />,
  exam: <TrophyOutlined />,
  trap: <WarningOutlined />,
};
const VARIANT_LABEL = {
  en: { default: 'Key concept', tip: 'Tip', culture: 'Culture', exam: 'Exam strategy', trap: 'Watch out' },
  fr: { default: 'Notion clé', tip: 'Astuce', culture: 'Culture', exam: 'Stratégie d’examen', trap: 'Attention' },
};

function ConceptExampleRow({
  ex,
  index,
  lang,
  heard,
  onPlay,
}: {
  ex: NonNullable<ConceptStep['examples']>[number];
  index: number;
  lang: Lang;
  heard: boolean;
  onPlay: () => void;
}) {
  const playing = usePlaying(ex.fr);
  const canPlay = hasRecording(ex.fr);
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04, duration: 0.25 }}
      className={`lx-ex-card${playing ? ' is-playing' : ''}${heard ? ' is-heard' : ''}`}
      onClick={() => { if (canPlay) onPlay(); }}
    >
      <span className="lx-ex-num" aria-hidden>{String(index + 1).padStart(2, '0')}</span>
      {canPlay && (
        <button
          type="button"
          className={`lx-ex-play${playing ? ' is-playing' : ''}`}
          onClick={e => { e.stopPropagation(); onPlay(); }}
          aria-label={UI[lang].player.listen}
        >
          <SoundOutlined aria-hidden />
          {playing && <span className="lx-audio-wave" aria-hidden><i /><i /><i /></span>}
        </button>
      )}
      <div className="lx-ex-copy">
        <button
          type="button"
          className="lx-ex-fr"
          lang="fr"
          onClick={e => { e.stopPropagation(); if (canPlay) onPlay(); }}
        >
          <Rich text={ex.fr} />
        </button>
        {gloss(ex.tr, lang) && <p className="lx-ex-tr">{gloss(ex.tr, lang)}</p>}
        {ex.note && <p className="lx-ex-note"><Rich text={tx(ex.note, lang)} /></p>}
      </div>
      {heard && <span className="lx-ex-done" aria-hidden><CheckCircleFilled /></span>}
    </motion.li>
  );
}

export const Concept = forwardRef<StepHandle, StepProps<ConceptStep>>(function Concept({ step, lang, onReady }, ref) {
  const fr = lang === 'fr';
  const examples = useMemo(() => step.examples ?? [], [step.examples]);
  const [heardSet, setHeardSet] = useState<Set<number>>(() => new Set());
  const [playingAll, setPlayingAll] = useState(false);
  const playAllToken = useRef(0);

  useImperativeHandle(ref, () => ({ check: () => null }), []);
  useEffect(() => { onReady(true); }, [onReady]);
  useEffect(() => () => { playAllToken.current++; }, []);

  const markHeard = (idx: number) => {
    setHeardSet(prev => {
      if (prev.has(idx)) return prev;
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  const playOne = (idx: number) => {
    playAllToken.current++;
    setPlayingAll(false);
    markHeard(idx);
    void speak(examples[idx].fr);
  };

  const togglePlayAll = async () => {
    if (playingAll) {
      playAllToken.current++;
      setPlayingAll(false);
      stopAudio();
      return;
    }
    const token = ++playAllToken.current;
    setPlayingAll(true);
    for (let i = 0; i < examples.length; i++) {
      if (playAllToken.current !== token) return;
      if (!hasRecording(examples[i].fr)) continue;
      markHeard(i);
      await speak(examples[i].fr);
      if (playAllToken.current !== token) return;
      if (i + 1 < examples.length) {
        await new Promise(r => window.setTimeout(r, 380));
      }
    }
    if (playAllToken.current === token) setPlayingAll(false);
  };

  const variantKey = step.variant && step.variant !== 'default' ? step.variant : 'default';
  const hasTheory = !!(step.image || step.body || step.points || step.table);
  const splitWithExamples = hasTheory && examples.length > 0;
  const splitImageWithTheory = !splitWithExamples && !!step.image && !!(step.body || step.points || step.table);
  const isSplit = splitWithExamples || splitImageWithTheory;
  const playableCount = examples.filter(e => hasRecording(e.fr)).length;

  const pointsNode = step.points && (
    <ul className="lx-points">
      {step.points.map((p, i) => (
        <motion.li key={i} {...rise} transition={{ delay: 0.12 + i * 0.05, duration: 0.28 }}><CheckOutlined aria-hidden /><Rich text={tx(p, lang)} /></motion.li>
      ))}
    </ul>
  );

  const tableNode = step.table && (
    <motion.div className="lx-table-wrap" {...rise} transition={{ delay: 0.1, duration: 0.3 }}>
      <table className="lx-table">
        {step.table.caption && <caption>{tx(step.table.caption, lang)}</caption>}
        <thead><tr>{step.table.head.map((h, i) => <th key={i} scope="col">{tx(h, lang)}</th>)}</tr></thead>
        <tbody>
          {step.table.rows.map((row, r) => (
            <motion.tr key={r} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 + r * 0.04 }}>
              {row.map((cell, k) => <td key={k}><Rich text={tx(cell, lang)} /></td>)}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );

  const examplesNode = examples.length > 0 && (
    <div className="lx-examples">
      <div className="lx-examples-head">
        <div className="lx-examples-k">
          <SoundOutlined aria-hidden />
          <span>
            {fr ? `Audio natif · ${examples.length} phrase${examples.length > 1 ? 's' : ''}` : `Native audio · ${examples.length} phrase${examples.length > 1 ? 's' : ''}`}
          </span>
          {heardSet.size > 0 && (
            <em className="lx-examples-heard">{heardSet.size}/{examples.length} ✓</em>
          )}
        </div>
        {playableCount > 1 && (
          <button
            type="button"
            className={`lx-play-all${playingAll ? ' is-playing' : ''}`}
            onClick={() => void togglePlayAll()}
          >
            {playingAll ? <PauseCircleOutlined /> : <PlayCircleFilled />}
            <span>{playingAll ? (fr ? 'Arrêter' : 'Stop') : (fr ? 'Tout écouter' : 'Play all')}</span>
          </button>
        )}
      </div>
      <ol className={examples.length >= 4 && !isSplit ? 'is-two-col' : undefined}>
        {examples.map((ex, i) => (
          <ConceptExampleRow
            key={i}
            ex={ex}
            index={i}
            lang={lang}
            heard={heardSet.has(i)}
            onPlay={() => playOne(i)}
          />
        ))}
      </ol>
    </div>
  );

  const headerNode = (
    <header className="lx-concept-head">
      <p className="lx-concept-tag">{VARIANT_ICON[variantKey]}{VARIANT_LABEL[lang][variantKey]}</p>
      <motion.h2 {...rise} transition={{ duration: 0.3 }}>{tx(step.title, lang)}</motion.h2>
    </header>
  );

  return (
    <div className={`lx-concept is-${variantKey}${isSplit ? ' is-split' : ''}`}>
      {!isSplit && headerNode}
      {isSplit ? (
        <div className="lx-concept-grid">
          <div className="lx-concept-col is-theory">
            {headerNode}
            {step.image && (
              <motion.figure className="lx-concept-img" {...rise} transition={{ delay: 0.05, duration: 0.3 }}>
                <img src={imageUrl(step.image)} alt="" loading="lazy" />
              </motion.figure>
            )}
            {splitWithExamples && step.body && (
              <motion.div className="lx-concept-callout" {...rise} transition={{ delay: 0.07, duration: 0.3 }}>
                <RichBlock text={tx(step.body, lang)} className="lx-concept-body" />
              </motion.div>
            )}
            {splitWithExamples && pointsNode}
            {splitWithExamples && tableNode}
          </div>
          <div className="lx-concept-col is-practice">
            {splitImageWithTheory && step.body && (
              <motion.div className="lx-concept-callout" {...rise} transition={{ delay: 0.07, duration: 0.3 }}>
                <RichBlock text={tx(step.body, lang)} className="lx-concept-body" />
              </motion.div>
            )}
            {splitImageWithTheory && pointsNode}
            {splitImageWithTheory && tableNode}
            {examplesNode}
          </div>
        </div>
      ) : (
        <>
          {step.image && (
            <motion.figure className="lx-concept-img" {...rise} transition={{ delay: 0.05, duration: 0.3 }}>
              <img src={imageUrl(step.image)} alt="" loading="lazy" />
            </motion.figure>
          )}
          {step.body && (
            <motion.div className="lx-concept-callout" {...rise} transition={{ delay: 0.07, duration: 0.3 }}>
              <RichBlock text={tx(step.body, lang)} className="lx-concept-body" />
            </motion.div>
          )}
          {pointsNode}
          {tableNode}
          {examplesNode}
        </>
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
  const hasMedia = !!(step.image || step.doc);
  return (
    <div className={`lx-mcq${hasMedia ? ' is-split' : ''}`}>
      {(step.level || step.timer) && (
        <div className="lx-q-head">
          {step.level && <span className="lx-level-chip">{step.level}</span>}
          {step.timer && <Countdown seconds={step.timer} lang={lang} stop={locked} />}
        </div>
      )}
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang)} /></h2>
      <div className={hasMedia ? 'lx-mcq-grid' : undefined}>
        {hasMedia && (
          <div className="lx-mcq-media">
            {step.image && <figure className="lx-q-img"><img src={imageUrl(step.image)} alt="" /></figure>}
            {step.doc && (
              <article className={`lx-doc${step.doc.look ? ` is-${step.doc.look}` : ''}`}>
                <header><FileTextOutlined aria-hidden />{step.doc.title ? tx(step.doc.title, lang) : 'Document'}</header>
                <DocBody text={step.doc.text} />
                {step.doc.source && <footer>{tx(step.doc.source, lang)}</footer>}
              </article>
            )}
          </div>
        )}
        <div className="lx-mcq-main">
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
          {frParts && (
            <p className="lx-q-fr is-gap">
              {frParts.map((part, i) => (
                <span key={i}>{part}{i < frParts.length - 1 && <b className={`lx-gap${picked !== null ? ' is-filled' : ''}`}>{picked !== null ? tx(step.options[picked], lang) : ' '}</b>}</span>
              ))}
            </p>
          )}
          <div className={`lx-options${step.options.length >= 4 && !hasMedia ? ' is-many' : ''}`} role="radiogroup">
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
