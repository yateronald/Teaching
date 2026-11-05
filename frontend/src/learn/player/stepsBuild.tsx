// Activities where the learner moves things: sentence builder, matching,
// sorting into categories, and the explorable picture.
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'motion/react';
import { CheckOutlined } from '@ant-design/icons';
import { speak } from '../audio';
import { imageUrl } from '../categories';
import { gloss, tx, type CategorizeStep, type HotspotStep, type MatchStep, type OrderStep } from '../types';
import { UI } from '../ui';
import { AudioButton, Rich, normalize, seededShuffle } from './common';
import type { StepHandle, StepProps } from './stepTypes';

const spring = { type: 'spring' as const, stiffness: 520, damping: 38, mass: 0.7 };

// ── Sentence builder ───────────────────────────────────────────────────────

export const Order = forwardRef<StepHandle, StepProps<OrderStep>>(function Order({ step, lang, locked, seed, onReady }, ref) {
  const ui = UI[lang].player;
  const tokens = useMemo(() => {
    const all = [...step.words, ...(step.extra ?? [])].map((w, i) => ({ id: `${seed}-w${i}`, w }));
    let shuffled = seededShuffle(all, seed);
    // Never offer the words already in the right order.
    if (shuffled.slice(0, step.words.length).map(t => t.w).join(' ') === step.words.join(' ')) shuffled = [...shuffled.slice(1), shuffled[0]];
    return shuffled;
  }, [step, seed]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  useEffect(() => { onReady(answer.length > 0); }, [answer, onReady]);

  const sentence = (ids: string[]) => ids.map(id => tokens.find(t => t.id === id)!.w).join(' ');
  useImperativeHandle(ref, () => ({
    check: () => {
      if (!answer.length) return null;
      const given = normalize(sentence(answer));
      const ok = [step.words, ...(step.alt ?? [])].some(ws => normalize(ws.join(' ')) === given);
      setVerdict(ok);
      if (ok) speak(step.words.join(' '));
      return { correct: ok, answer: step.words.join(' '), explain: tx(step.explain, lang) || undefined };
    },
  }), [answer, step, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) => {
    if (locked) return;
    setAnswer(a => (a.includes(id) ? a.filter(x => x !== id) : [...a, id]));
  };

  return (
    <div className="lx-order">
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang)} /></h2>
      {gloss(step.tr, lang) && <p className="lx-order-tr">{gloss(step.tr, lang)}</p>}
      <LayoutGroup id={seed}>
        <div className={`lx-order-line${locked ? (verdict ? ' is-ok' : ' is-no') : ''}`} aria-label={ui.chooseWords}>
          {answer.length === 0 && <span className="lx-order-placeholder">{ui.chooseWords}</span>}
          {answer.map(id => (
            <motion.button layout layoutId={id} transition={spring} key={id} type="button" className="lx-word is-placed" onClick={() => toggle(id)} disabled={locked}>
              {tokens.find(t => t.id === id)!.w}
            </motion.button>
          ))}
        </div>
        <div className="lx-order-bank">
          {tokens.map(t => (
            <span key={t.id} className="lx-word-slot">
              {!answer.includes(t.id) && (
                <motion.button layout layoutId={t.id} transition={spring} type="button" className="lx-word" onClick={() => toggle(t.id)} disabled={locked} whileTap={{ scale: 0.92 }}>
                  {t.w}
                </motion.button>
              )}
              <span className="lx-word-ghost" aria-hidden>{t.w}</span>
            </span>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
});

// ── Matching pairs ─────────────────────────────────────────────────────────

export const Match = forwardRef<StepHandle, StepProps<MatchStep>>(function Match({ step, lang, seed, onReady, onScore }, ref) {
  const ui = UI[lang].player;
  const left = useMemo(() => seededShuffle(step.pairs.map((p, i) => ({ i, text: p[0] })), `${seed}-l`), [step.pairs, seed]);
  const right = useMemo(() => seededShuffle(step.pairs.map((p, i) => ({ i, text: tx(p[1], lang) })), `${seed}-r`), [step.pairs, seed, lang]);
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  useImperativeHandle(ref, () => ({ check: () => null }), []);

  useEffect(() => {
    if (selL === null || selR === null) return;
    if (selL === selR) {
      setMatched(m => [...m, selL]);
      speak(step.pairs[selL][0]);
    } else {
      setWrong([selL, selR]);
      setMistakes(n => n + 1);
      window.setTimeout(() => setWrong(null), 650);
    }
    setSelL(null);
    setSelR(null);
  }, [selL, selR, step.pairs]);

  useEffect(() => {
    if (matched.length === step.pairs.length) {
      onScore?.(step.pairs.length / (step.pairs.length + mistakes));
      onReady(true);
    } else onReady(false);
  }, [matched, step.pairs.length, mistakes, onReady, onScore]);

  const cls = (side: 'l' | 'r', i: number) => {
    if (matched.includes(i)) return 'is-matched';
    if (wrong && wrong[side === 'l' ? 0 : 1] === i) return 'is-wrong';
    if ((side === 'l' ? selL : selR) === i) return 'is-selected';
    return '';
  };

  return (
    <div className="lx-match">
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang) || ui.tapToMatch} /></h2>
      <p className="lx-sub">{ui.tapToMatch}</p>
      <div className="lx-match-cols">
        <div>
          {left.map(({ i, text }) => (
            <motion.button key={i} type="button" className={`lx-tile is-fr ${cls('l', i)}`} disabled={matched.includes(i)} onClick={() => { setSelL(i); speak(text); }}
              animate={cls('l', i) === 'is-wrong' ? { x: [0, -6, 6, -4, 4, 0] } : cls('l', i) === 'is-matched' ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.4 }}>
              {text}{matched.includes(i) && <CheckOutlined />}
            </motion.button>
          ))}
        </div>
        <div>
          {right.map(({ i, text }) => (
            <motion.button key={i} type="button" className={`lx-tile ${cls('r', i)}`} disabled={matched.includes(i)} onClick={() => setSelR(i)}
              animate={cls('r', i) === 'is-wrong' ? { x: [0, -6, 6, -4, 4, 0] } : cls('r', i) === 'is-matched' ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.4 }}>
              {text}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
});

// ── Sorting into categories ────────────────────────────────────────────────

export const Categorize = forwardRef<StepHandle, StepProps<CategorizeStep>>(function Categorize({ step, lang, locked, seed, onReady }, ref) {
  const ui = UI[lang].player;
  const items = useMemo(() => seededShuffle(step.items.map((it, i) => ({ ...it, id: `${seed}-c${i}` })), seed), [step.items, seed]);
  const [where, setWhere] = useState<Record<string, number>>({});
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { onReady(Object.keys(where).length === items.length); }, [where, items.length, onReady]);
  useImperativeHandle(ref, () => ({
    check: () => {
      if (Object.keys(where).length < items.length) return null;
      const ok = items.every(it => where[it.id] === it.bucket);
      return {
        correct: ok,
        answer: step.buckets.map((bk, b) => `${tx(bk, lang)}: ${items.filter(it => it.bucket === b).map(it => it.text).join(', ')}`).join(' · '),
        explain: tx(step.explain, lang) || undefined,
      };
    },
  }), [where, items, step, lang]);

  const place = (id: string, b: number) => { setWhere(w => ({ ...w, [id]: b })); setSel(null); };
  const unplace = (id: string) => setWhere(w => { const n = { ...w }; delete n[id]; return n; });
  const bucketAt = (x: number, y: number) => {
    const el = document.elementsFromPoint(x, y).find(e => (e as HTMLElement).dataset?.bucket !== undefined) as HTMLElement | undefined;
    return el ? Number(el.dataset.bucket) : null;
  };

  const chip = (it: typeof items[number], placed: boolean) => {
    const verdict = locked && placed ? (where[it.id] === it.bucket ? ' is-ok' : ' is-no') : '';
    return (
      <motion.button
        key={it.id}
        layout
        layoutId={it.id}
        transition={spring}
        type="button"
        className={`lx-word${sel === it.id ? ' is-selected' : ''}${placed ? ' is-placed' : ''}${verdict}`}
        disabled={locked}
        drag={!locked}
        dragSnapToOrigin
        whileDrag={{ scale: 1.08, zIndex: 5 }}
        onDragEnd={(e: MouseEvent | TouchEvent | PointerEvent) => {
          const p = 'changedTouches' in e ? e.changedTouches[0] : (e as MouseEvent);
          const b = bucketAt(p.clientX, p.clientY);
          if (b !== null) place(it.id, b);
        }}
        onClick={() => (placed ? unplace(it.id) : setSel(s => (s === it.id ? null : it.id)))}
      >
        {it.text}
      </motion.button>
    );
  };

  return (
    <div className="lx-cat">
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang)} /></h2>
      <p className="lx-sub">{ui.tapItem}</p>
      <LayoutGroup id={seed}>
        <div className="lx-cat-pool">{items.filter(it => where[it.id] === undefined).map(it => chip(it, false))}</div>
        <div className={`lx-cat-buckets is-${step.buckets.length}`}>
          {step.buckets.map((bk, b) => (
            <div key={b} data-bucket={b} className={`lx-bucket${sel ? ' is-target' : ''}`} onClick={() => sel && place(sel, b)} role="button" tabIndex={0}
              onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && sel) place(sel, b); }}>
              <p data-bucket={b}>{tx(bk, lang)}</p>
              <div data-bucket={b} className="lx-bucket-items">{items.filter(it => where[it.id] === b).map(it => chip(it, true))}</div>
            </div>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
});

// ── Explorable picture ─────────────────────────────────────────────────────

export const Hotspot = forwardRef<StepHandle, StepProps<HotspotStep>>(function Hotspot({ step, lang, seed, onReady, onScore }, ref) {
  const ui = UI[lang].player;
  const [explored, setExplored] = useState<number[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const order = useMemo(() => seededShuffle(step.spots.map((_, i) => i), seed).slice(0, Math.min(5, step.spots.length)), [step.spots, seed]);
  const [phase, setPhase] = useState<'explore' | 'find' | 'done'>('explore');
  const [q, setQ] = useState(0);
  const [found, setFound] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  useImperativeHandle(ref, () => ({ check: () => null }), []);
  useEffect(() => { onReady(phase === 'done'); }, [phase, onReady]);

  const tap = (i: number) => {
    if (phase === 'explore') {
      setOpen(i);
      speak(step.spots[i].fr);
      setExplored(e => (e.includes(i) ? e : [...e, i]));
      return;
    }
    if (phase !== 'find') return;
    if (i === order[q]) {
      speak(step.spots[i].fr);
      setFound(f => [...f, i]);
      if (q + 1 >= order.length) { setPhase('done'); onScore?.(order.length / (order.length + mistakes)); } else setQ(q + 1);
    } else {
      setMistakes(m => m + 1);
      setFlash(i);
      window.setTimeout(() => setFlash(null), 600);
    }
  };

  useEffect(() => {
    if (phase === 'explore' && explored.length === step.spots.length) {
      const t = window.setTimeout(() => { setOpen(null); setPhase('find'); }, 1400);
      return () => window.clearTimeout(t);
    }
  }, [explored, phase, step.spots.length]);

  return (
    <div className="lx-hotspot">
      <h2 className="lx-prompt"><Rich text={tx(step.prompt, lang)} /></h2>
      <AnimatePresence mode="wait">
        <motion.p key={phase + q} className={`lx-hot-task is-${phase}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {phase === 'explore' && <>{ui.hotspotExplore} <b>{ui.hotspotExplored(explored.length, step.spots.length)}</b></>}
          {phase === 'find' && <>{ui.hotspotFind(step.spots[order[q]].fr)} <AudioButton text={step.spots[order[q]].fr} lang={lang} size="sm" /></>}
          {phase === 'done' && <><CheckOutlined /> {UI[lang].player.correct[1]}</>}
        </motion.p>
      </AnimatePresence>
      <div className="lx-hot-frame">
        <img src={imageUrl(step.image)} alt="" />
        {step.spots.map((s, i) => {
          const state = phase === 'explore' ? (explored.includes(i) ? 'is-seen' : '') : found.includes(i) ? 'is-found' : flash === i ? 'is-wrong' : '';
          return (
            <React.Fragment key={i}>
              <motion.button
                type="button"
                className={`lx-spot ${state}`}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                onClick={() => tap(i)}
                aria-label={phase === 'explore' || found.includes(i) ? s.fr : `${i + 1}`}
                initial={{ scale: 0 }}
                animate={flash === i ? { scale: 1, x: [0, -5, 5, -3, 3, 0] } : { scale: 1 }}
                transition={{ delay: phase === 'explore' ? 0.2 + i * 0.06 : 0, type: 'spring', stiffness: 400, damping: 22 }}
              >
                <span>{phase === 'explore' ? i + 1 : found.includes(i) ? <CheckOutlined /> : ''}</span>
              </motion.button>
              {(open === i || (phase !== 'explore' && found.includes(i))) && (
                <motion.div className={`lx-spot-label${s.x > 60 ? ' is-left' : ''}${s.y > 70 ? ' is-up' : ''}`} style={{ left: `${s.x}%`, top: `${s.y}%` }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <strong>{s.fr}</strong>
                  {phase === 'explore' && gloss(s.tr, lang) && <span>{gloss(s.tr, lang)}</span>}
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});
