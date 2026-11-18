// /learn/practice/reading/<text>/: a text to read and hear, sentence by
// sentence, with its questions, its language point and its words.
//
// Reading comfort: on a wide screen the text is a fixed panel beside the
// questions (it has its own scroll and the player stays at its foot); on a
// phone or a tablet the text and the questions are two views. In both cases,
// while the voice reads, the text scrolls by itself to keep the sentence
// being read in view, until the reader scrolls on their own.
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AimOutlined, ArrowRightOutlined, CaretRightFilled, CheckCircleFilled, CloseCircleFilled, DashboardOutlined,
  EyeInvisibleOutlined, EyeOutlined, InfoCircleOutlined, LeftOutlined, LoadingOutlined, ManOutlined, MinusOutlined,
  PauseOutlined, PlusOutlined, ReadOutlined, ReloadOutlined, StepBackwardOutlined, StepForwardOutlined, TeamOutlined,
  TranslationOutlined, UndoOutlined, UnorderedListOutlined, WomanOutlined,
} from '@ant-design/icons';
import { chime } from '../../audio';
import { imageUrl } from '../../categories';
import { AudioButton, Phrase, Rich, RichBlock } from '../../player/common';
import { hubPath } from '../../paths';
import { recordText, useProgress } from '../../progress';
import { Crumbs, LearnShell, LevelChip, TeacherCta, useMounted } from '../../shell';
import { gloss, tx, type Lang } from '../../types';
import { UI } from '../../ui';
import { trackLearning } from '../../../utils/siteAnalytics';
import { P } from '../copy';
import { TEXTS, readingPath, textMinutes, textPath } from '../meta';
import { evidenceOf, fmtTime, isSpokenTitle, locate, narrationsOf, pct, sentencesOf, type FlatSentence, type Span } from '../model';
import { ScoreRing, TextCard } from '../parts';
import { useText } from '../registry';
import { textJsonLd } from '../schema';
import { nextText } from '../stats';
import { RATES, useNarration, type NarrationApi } from '../useNarration';
import type { NarrationId, ReadingText, TextMeta } from '../types';
import '../practice.css';

const LETTERS = ['a', 'b', 'c', 'd', 'e'];

// ── Screen ─────────────────────────────────────────────────────────────────

/** From this width the text is a fixed panel beside the questions (practice.css says the same). */
const WIDE = '(min-width: 1024px)';

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(WIDE);
    const f = () => setWide(m.matches);
    f();
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return wide;
}

/** Height of the site header, which stays at the top: the reading panel sits just below it. */
function useHeaderHeight() {
  const [h, setH] = useState(72);
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.lp-header');
    if (!el) return;
    const f = () => setH(Math.round(el.getBoundingClientRect().height));
    f();
    const ro = new ResizeObserver(f);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return h;
}

/** The reader’s text size, kept in this browser. */
const SIZES = [0.88, 1, 1.12, 1.25];
const SIZE_KEY = 'lfwn-reading-size';
function useTextSize(): [number, (i: number) => void] {
  const [i, setI] = useState(1);
  useEffect(() => {
    try {
      const v = localStorage.getItem(SIZE_KEY);
      if (v !== null && SIZES[Number(v)] !== undefined) setI(Number(v));
    } catch { /* storage unavailable */ }
  }, []);
  const set = (n: number) => {
    const v = Math.max(0, Math.min(SIZES.length - 1, n));
    setI(v);
    try { localStorage.setItem(SIZE_KEY, String(v)); } catch { /* storage unavailable */ }
  };
  return [i, set];
}

const smooth = (): ScrollBehavior => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

// ── The text ───────────────────────────────────────────────────────────────

interface Range { start: number; end: number; g?: number; e?: boolean }

/** A sentence cut where glossary words and highlighted answers begin and end. */
function pieces(fr: string, ranges: Range[]) {
  const cuts = [...new Set([0, fr.length, ...ranges.flatMap(r => [r.start, r.end])])].sort((a, b) => a - b);
  const out: { text: string; g?: number; e: boolean }[] = [];
  for (let k = 0; k < cuts.length - 1; k++) {
    const [a, b] = [cuts[k], cuts[k + 1]];
    if (a === b) continue;
    out.push({
      text: fr.slice(a, b),
      g: ranges.find(r => r.g !== undefined && r.start <= a && r.end >= b)?.g,
      e: ranges.some(r => r.e && r.start <= a && r.end >= b),
    });
  }
  // A glossary word stays one piece, even when an answer starts inside it.
  const groups: { g?: number; items: { text: string; e: boolean }[] }[] = [];
  for (const pc of out) {
    const last = groups[groups.length - 1];
    if (last && pc.g !== undefined && last.g === pc.g) last.items.push(pc);
    else groups.push({ g: pc.g, items: [pc] });
  }
  return groups;
}

const Marked = ({ items }: { items: { text: string; e: boolean }[] }) => (
  <>{items.map((it, k) => (it.e ? <mark key={k} className="rx-ev">{it.text}</mark> : <React.Fragment key={k}>{it.text}</React.Fragment>))}</>
);

interface BodyProps {
  text: ReadingText;
  sentences: FlatSentence[];
  current: number;
  translate: boolean;
  glossAt: Map<number, Range[]>;
  evidence: Span[];
  openGloss: number | null;
  canPlay: boolean;
  onSentence: (i: number) => void;
  onGloss: (id: number, el: HTMLElement) => void;
}

const TextBody = memo(function TextBody({ text, sentences, current, translate, glossAt, evidence, openGloss, canPlay, onSentence, onGloss }: BodyProps) {
  const byPara = useMemo(() => text.paras.map((_, p) => sentences.filter(s => s.p === p)), [text, sentences]);
  return (
    <div className={`rx-text is-${text.speakers ? 'dialogue' : 'prose'}`}>
      {text.paras.map((para, p) => {
        const who = para.who !== undefined && text.speakers ? text.speakers[para.who] : undefined;
        return (
          <div key={p} className={`rx-p${para.lead ? ' is-lead' : ''}${para.lines ? ' is-lines' : ''}${who ? ` is-line is-who-${para.who}` : ''}`}>
            {who && <span className="rx-who">{who.name}</span>}
            <p>
              {byPara[p].map((s, k) => {
                const ranges = [...(glossAt.get(s.i) ?? []), ...evidence.filter(e => e.i === s.i).map(e => ({ start: e.start, end: e.end, e: true }))];
                return (
                  <React.Fragment key={s.i}>
                    {k > 0 && (para.lines ? <br /> : ' ')}
                    <span
                      className={`rx-s${s.i === current ? ' is-on' : ''}${canPlay ? ' is-playable' : ''}`}
                      data-i={s.i}
                      onClick={canPlay ? () => onSentence(s.i) : undefined}
                    >
                      {pieces(s.fr, ranges).map((gr, j) => (gr.g !== undefined ? (
                        // A span (not a button) so that a phrase of several words wraps with the line.
                        <span
                          key={j}
                          role="button"
                          tabIndex={0}
                          className={`rx-g${openGloss === gr.g ? ' is-open' : ''}`}
                          aria-expanded={openGloss === gr.g}
                          onClick={e => { e.stopPropagation(); onGloss(gr.g!, e.currentTarget); }}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onGloss(gr.g!, e.currentTarget); } }}
                        >
                          <Marked items={gr.items} />
                        </span>
                      ) : <Marked key={j} items={gr.items} />))}
                    </span>
                  </React.Fragment>
                );
              })}
            </p>
            {translate && <p className="rx-tr" lang="en">{para.s.map(x => x[1]).join(' ')}</p>}
          </div>
        );
      })}
    </div>
  );
});

// ── The player ─────────────────────────────────────────────────────────────

const VOICE_ICON: Record<NarrationId, React.ReactNode> = { f: <WomanOutlined />, m: <ManOutlined />, d: <TeamOutlined /> };

/** `many`: the several-voice version is an interview or a forum thread, not a dialogue. */
function PlayerBar({ n, lang, many = false }: { n: NarrationApi; lang: Lang; many?: boolean }) {
  const c = P[lang].player;
  const voiceTitle = (v: NarrationId) => (many && v === 'd' ? c.voiceMany : c.voice[v]);
  const voiceTag = (v: NarrationId) => (many && v === 'd' ? c.voiceManyShort : c.voiceShort[v]);
  const d = n.meta?.d ?? 0;
  const idx = RATES.indexOf(n.rate);
  const shown = Math.min(n.time, d);
  const label = n.loading ? c.loading : n.playing ? c.pause : c.play;
  return (
    <div className="rx-player" role="group" aria-label={c.voices} title={c.keys}>
      <button type="button" className="rx-pl-play" onClick={n.toggle} aria-label={label} title={label} aria-busy={n.loading}>
        {n.loading && !n.playing ? <LoadingOutlined /> : n.playing ? <PauseOutlined /> : <CaretRightFilled />}
      </button>
      <div className="rx-pl-seek">
        <span className="rx-pl-time">{fmtTime(shown)}</span>
        <input
          type="range" min={0} max={d || 1} step={0.1} value={shown}
          style={{ '--p': `${d ? (shown / d) * 100 : 0}%` } as React.CSSProperties}
          onChange={e => n.seek(Number(e.target.value))}
          aria-label={c.seek} aria-valuetext={`${fmtTime(shown)} / ${fmtTime(d)}`}
        />
        <span className="rx-pl-time">{fmtTime(d)}</span>
      </div>
      <div className="rx-pl-nav">
        <button type="button" onClick={n.prev} aria-label={c.prev} title={c.prev}><StepBackwardOutlined /></button>
        <button type="button" onClick={n.replay} aria-label={c.replay} title={c.replay}><UndoOutlined /></button>
        <button type="button" onClick={n.next} aria-label={c.next} title={c.next}><StepForwardOutlined /></button>
      </div>
      {n.versions.length > 1 && (
        <div className="rx-pl-voices" role="radiogroup" aria-label={c.voices}>
          {n.versions.map(v => (
            <button
              key={v} type="button" role="radio" aria-checked={v === n.version}
              className={`is-${v}${v === n.version ? ' is-on' : ''}`}
              onClick={() => n.choose(v, n.playing)} aria-label={voiceTitle(v)} title={voiceTitle(v)}
            >
              {VOICE_ICON[v]}<span className="rx-label">{voiceTag(v)}</span>
            </button>
          ))}
        </div>
      )}
      <div className="rx-pl-speed" role="group" aria-label={c.speed}>
        <button type="button" onClick={() => n.setRate(RATES[Math.max(0, idx - 1)])} disabled={idx <= 0} aria-label={c.slower} title={c.slower}><MinusOutlined /></button>
        <span title={c.speed}><DashboardOutlined aria-hidden />{pct(n.rate, lang)}</span>
        <button type="button" onClick={() => n.setRate(RATES[Math.min(RATES.length - 1, idx + 1)])} disabled={idx >= RATES.length - 1} aria-label={c.faster} title={c.faster}><PlusOutlined /></button>
      </div>
    </div>
  );
}

// ── The questions ──────────────────────────────────────────────────────────

function Quiz({ text, meta, lang, where, onWhere, onProgress }: {
  text: ReadingText; meta: TextMeta; lang: Lang; where: number | null;
  onWhere: (q: number | null) => void; onProgress: (answered: number) => void;
}) {
  const c = P[lang].quiz;
  const p = useProgress();
  const n = text.questions.length;
  const [answers, setAnswers] = useState<(number | null)[]>(() => text.questions.map(() => null));
  const [result, setResult] = useState<{ correct: number; xp: number } | null>(null);
  const started = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const checked = result !== null;
  const answered = answers.filter(a => a !== null).length;
  const following = nextText(p, meta.id);

  useEffect(() => { onProgress(answered); }, [answered, onProgress]);

  const pick = (qi: number, oi: number) => {
    if (checked) return;
    if (!started.current) {
      started.current = true;
      trackLearning({ kind: 'lesson', action: 'start', course: 'practice-reading', item: meta.id, title: 'Reading practice', itemTitle: meta.title });
    }
    setAnswers(a => a.map((x, i) => (i === qi ? oi : x)));
  };

  const check = () => {
    const correct = text.questions.filter((q, i) => answers[i] === q.answer).length;
    const { xp } = recordText(meta.id, correct, n, { path: textPath(meta, lang), title: meta.title, course: P[lang].text.eyebrow, at: Date.now() });
    trackLearning({ kind: 'lesson', action: 'finish', course: 'practice-reading', item: meta.id, score: correct / n, passed: correct / n >= 0.8, title: 'Reading practice', itemTitle: meta.title });
    chime(correct === n ? 'done' : correct / n >= 0.5 ? 'right' : 'wrong');
    setResult({ correct, xp });
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: smooth(), block: 'nearest' }));
  };

  const retry = () => {
    setAnswers(text.questions.map(() => null));
    setResult(null);
    onWhere(null);
  };

  return (
    <section className="rx-quiz" aria-labelledby="rx-quiz-title">
      <header className="rx-quiz-head">
        <h2 id="rx-quiz-title">{c.title}</h2>
        <span>{c.progress(checked ? result.correct : answered, n)}</span>
      </header>
      <ol className="rx-quiz-bar" aria-hidden>
        {text.questions.map((q, i) => (
          <li key={i} className={checked ? (answers[i] === q.answer ? 'is-right' : 'is-wrong') : answers[i] !== null ? 'is-done' : ''} />
        ))}
      </ol>
      <ol className="rx-qs">
        {text.questions.map((q, qi) => {
          const right = answers[qi] === q.answer;
          const short = q.options.every(o => o.length <= 26);
          return (
            <li key={qi} className="rx-q">
              <p className="rx-q-k"><span className="rx-q-n">{qi + 1}</span><span>{c.skill[q.skill]}</span></p>
              <h3 id={`rx-q-${qi}`} className="rx-q-t">{q.q}</h3>
              {lang === 'en' && q.qEn && <p className="rx-q-en">{q.qEn}</p>}
              <div className={`lx-options rx-opts${short ? ' is-many' : ''}`} role="radiogroup" aria-labelledby={`rx-q-${qi}`}>
                {q.options.map((o, oi) => {
                  const picked = answers[qi] === oi;
                  const cls = checked ? (oi === q.answer ? ' is-right' : picked ? ' is-wrong' : ' is-dim') : picked ? ' is-picked' : '';
                  return (
                    <button key={oi} type="button" role="radio" aria-checked={picked} className={`lx-option${cls}`} disabled={checked} onClick={() => pick(qi, oi)}>
                      <kbd>{LETTERS[oi]}</kbd><span>{o}</span>
                    </button>
                  );
                })}
              </div>
              {checked && (
                <div className={`rx-fb${right ? ' is-right' : ' is-wrong'}`}>
                  <p className="rx-fb-k">
                    {right ? <CheckCircleFilled aria-hidden /> : <CloseCircleFilled aria-hidden />}
                    <strong>{right ? c.right : c.wrong}</strong>
                    {!right && <span>{c.answerWas} <b>{q.options[q.answer]}</b></span>}
                  </p>
                  <p><Rich text={tx(q.explain, lang)} /></p>
                  <button type="button" className={`rx-where${where === qi ? ' is-on' : ''}`} onClick={() => onWhere(where === qi ? null : qi)} aria-pressed={where === qi}>
                    <AimOutlined aria-hidden /> {where === qi ? c.hideWhere : c.where}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!checked ? (
        <div className="rx-quiz-foot">
          <button type="button" className="lp-btn lp-btn-primary" disabled={answered < n} onClick={check}>{c.check}</button>
          {answered < n && <p className="rx-quiz-left"><InfoCircleOutlined aria-hidden /> {c.left(n - answered)}</p>}
        </div>
      ) : (
        <div className="rx-result" ref={resultRef} aria-live="polite">
          <ScoreRing value={result.correct / n} label={c.result(result.correct, n)} />
          <div>
            <h3>{c.resultTitle(result.correct / n)}</h3>
            <p className={result.xp ? 'rx-result-xp' : 'rx-result-note'}>{result.xp ? c.points(result.xp) : c.noPoints}</p>
            <div className="rx-result-actions">
              <button type="button" className="lp-btn lp-btn-ghost" onClick={retry}><ReloadOutlined />{c.retry}</button>
              {following && <Link to={textPath(following, lang)} className="lp-btn lp-btn-primary">{c.next}<ArrowRightOutlined /></Link>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── The page ───────────────────────────────────────────────────────────────

function TextView({ text, meta, lang }: { text: ReadingText; meta: TextMeta; lang: Lang }) {
  const c = P[lang];
  const p = useProgress();
  const mounted = useMounted();
  const wide = useWide();
  const head = useHeaderHeight();
  const [size, setSize] = useTextSize();
  const sentences = useMemo(() => sentencesOf(text), [text]);
  const offered = useMemo(() => narrationsOf(text), [text]);
  const n = useNarration(meta.id, offered);
  const [translate, setTranslate] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [where, setWhere] = useState<number | null>(null);
  const [view, setView] = useState<'text' | 'quiz'>('text');
  const [answered, setAnswered] = useState(0);
  const [pop, setPop] = useState<{ id: number; left: number; top: number; width: number } | null>(null);
  const [away, setAway] = useState(false);
  const section = useRef<HTMLElement>(null);
  const panel = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const followOff = useRef(0);

  // Glossary words: their first place in the text.
  const glossAt = useMemo(() => {
    const m = new Map<number, Range[]>();
    text.glossary.forEach((g, id) => {
      const at = locate(sentences, g.fr);
      if (at) m.set(at.i, [...(m.get(at.i) ?? []), { start: at.start, end: at.end, g: id }]);
    });
    return m;
  }, [text, sentences]);

  const evidence = useMemo(() => (where === null ? [] : evidenceOf(text.questions[where]).map(e => locate(sentences, e)).filter((x): x is Span => !!x)), [where, text, sentences]);

  /**
   * Brings a piece of the text into the reading zone, about a third from the top:
   * inside the panel on a wide screen, in the page on a phone. Only when it is
   * out of the comfortable zone, unless `always`.
   */
  const bring = useCallback((el: Element | null | undefined, always = false) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (wide && body.current) {
      const box = body.current.getBoundingClientRect();
      const top = r.top - box.top;
      if (always || top < box.height * 0.1 || r.bottom - box.top > box.height * 0.78) {
        body.current.scrollTo({ top: body.current.scrollTop + top - box.height * 0.28, behavior: smooth() });
      }
      return;
    }
    const topEdge = head + 60;
    const bottomEdge = window.innerHeight - (foot.current?.offsetHeight ?? 110) - 12;
    const zone = Math.max(120, bottomEdge - topEdge);
    if (always || r.top < topEdge + 8 || r.bottom > bottomEdge - zone * 0.12) {
      window.scrollTo({ top: window.scrollY + r.top - topEdge - zone * 0.25, behavior: smooth() });
    }
  }, [wide, head]);

  // Wide screens: the panel fills the screen from its top to the bottom, whatever is
  // above it (the breadcrumb first, the site header once the page has scrolled), so
  // that its player is always in view.
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    if (!wide) { el.style.height = ''; return; }
    // Scroll events come at most once a frame: the measure is cheap enough to run on each.
    const fit = () => {
      const top = Math.max(el.getBoundingClientRect().top, head + 12);
      el.style.height = `${Math.round(Math.max(420, Math.min(900, window.innerHeight - top - 12)))}px`;
    };
    fit();
    window.addEventListener('scroll', fit, { passive: true });
    window.addEventListener('resize', fit);
    return () => { window.removeEventListener('scroll', fit); window.removeEventListener('resize', fit); el.style.height = ''; };
  }, [wide, head]);

  // The reader scrolls on their own: the text stops following the voice for a few seconds.
  const { playing, current } = n;
  useEffect(() => {
    if (!playing) return;
    const target: HTMLElement | Window = wide && body.current ? body.current : window;
    const off = () => { followOff.current = Date.now() + 6000; setAway(true); };
    target.addEventListener('wheel', off, { passive: true });
    target.addEventListener('touchmove', off, { passive: true });
    return () => { target.removeEventListener('wheel', off); target.removeEventListener('touchmove', off); };
  }, [playing, wide]);

  const titleOn = playing && isSpokenTitle(n.meta, n.time);

  // Only follow the title when it is being spoken, not during the greeting or cue.
  useEffect(() => {
    if (!playing || (current < 0 && !titleOn) || hidden || (!wide && view !== 'text')) return;
    if (Date.now() < followOff.current) return;
    setAway(false);
    bring(current < 0 ? title.current : inner.current?.querySelector(`.rx-s[data-i="${current}"]`));
  }, [current, titleOn, playing, hidden, wide, view, bring]);

  const follow = () => {
    followOff.current = 0;
    setAway(false);
    bring(inner.current?.querySelector(`.rx-s[data-i="${Math.max(0, current)}"]`), true);
  };

  // The answer shown in the text: the text view, the text visible, the answer in the reading zone.
  useEffect(() => {
    if (where === null) return;
    setHidden(false);
    setView('text');
    const id = window.setTimeout(() => bring(inner.current?.querySelector('.rx-ev'), true), 60);
    return () => window.clearTimeout(id);
  }, [where, bring]);

  const show = (v: 'text' | 'quiz') => {
    setView(v);
    // Back to the top of the reading area, under the tabs.
    const top = section.current ? section.current.getBoundingClientRect().top + window.scrollY - head : 0;
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'auto' });
  };

  const { playFrom } = n;
  const onSentence = useCallback((i: number) => playFrom(i), [playFrom]);
  const onGloss = useCallback((id: number, el: HTMLElement) => {
    const box = inner.current;
    if (!box) return;
    setPop(prev => {
      if (prev?.id === id) return null;
      const r = el.getBoundingClientRect();
      const cr = box.getBoundingClientRect();
      const width = Math.min(300, cr.width - 24);
      const left = Math.min(Math.max(12, r.left - cr.left + r.width / 2 - width / 2), cr.width - width - 12);
      return { id, left, top: r.bottom - cr.top + 8, width };
    });
  }, []);

  // A tap elsewhere or Escape closes the word’s explanation.
  useEffect(() => {
    if (!pop) return;
    const close = (e: Event) => { if (!(e.target as HTMLElement).closest?.('.rx-pop, .rx-g')) setPop(null); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setPop(null); };
    const resize = () => setPop(null);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', key);
    window.addEventListener('resize', resize);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', key); window.removeEventListener('resize', resize); };
  }, [pop]);

  // Keyboard: space plays or pauses, the arrows move between sentences.
  const { toggle, prev, next, version } = n;
  useEffect(() => {
    if (!version) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === ' ' && !el.closest?.('button, a, summary, [role="button"]')) { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [version, toggle, next, prev]);

  const g = pop ? text.glossary[pop.id] : null;
  const more = useMemo(() => {
    const first = mounted ? nextText(p, meta.id) : undefined;
    const rest = TEXTS.filter(t => t.id !== meta.id && t.id !== first?.id);
    return [...(first ? [first] : []), ...rest].slice(0, 3);
  }, [mounted, p, meta.id]);

  return (
    <>
      <section
        ref={section}
        className={`rx-read is-view-${view}`}
        aria-label={meta.title}
        style={{ '--rx-head': `${head}px` } as React.CSSProperties}
      >
        <div className="lp-wrap">
          <div className="rx-switch" role="tablist" aria-label={c.text.views}>
            <button type="button" role="tab" aria-selected={view === 'text'} className={view === 'text' ? 'is-on' : ''} onClick={() => show('text')}>
              <ReadOutlined aria-hidden />{c.text.tabText}
            </button>
            <button type="button" role="tab" aria-selected={view === 'quiz'} className={view === 'quiz' ? 'is-on' : ''} onClick={() => show('quiz')}>
              <UnorderedListOutlined aria-hidden />{c.text.tabQuiz}<span className="rx-count">{answered}/{text.questions.length}</span>
            </button>
          </div>
          <div className="rx-read-grid">
            <article className="rx-panel" ref={panel} style={{ '--rx-scale': SIZES[size] } as React.CSSProperties}>
              <div className="rx-panel-bar">
                <span className="rx-panel-k"><LevelChip level={meta.level} size="sm" />{c.learn.genre[meta.genre]}</span>
                <div className="rx-tools">
                  {lang === 'en' && (
                    <button type="button" className={translate ? 'is-on' : ''} aria-pressed={translate} onClick={() => setTranslate(v => !v)} title={c.text.translateTitle}>
                      <TranslationOutlined aria-hidden /><span className="rx-label">{c.text.translate}</span>
                    </button>
                  )}
                  {n.version && (
                    <button type="button" className={hidden ? 'is-on' : ''} aria-pressed={hidden} onClick={() => setHidden(v => !v)} title={c.text.hideTitle}>
                      {hidden ? <EyeOutlined aria-hidden /> : <EyeInvisibleOutlined aria-hidden />}<span className="rx-label">{hidden ? c.text.show : c.text.hide}</span>
                    </button>
                  )}
                  <span className="rx-size" role="group" aria-label={`${c.text.smaller} / ${c.text.larger}`}>
                    <button type="button" onClick={() => setSize(size - 1)} disabled={size === 0} aria-label={c.text.smaller} title={c.text.smaller}>A<small>−</small></button>
                    <button type="button" onClick={() => setSize(size + 1)} disabled={size === SIZES.length - 1} aria-label={c.text.larger} title={c.text.larger}>A<small>+</small></button>
                  </span>
                </div>
              </div>
              <div className="rx-panel-body" ref={body}>
                <div className="rx-panel-inner" ref={inner}>
                  <figure className="rx-figure">
                    <img src={imageUrl(meta.image)} alt="" width="1200" height="675" fetchPriority="high" />
                    <figcaption><b>{c.text.before}</b> {tx(text.warmup, lang)}</figcaption>
                  </figure>
                  <header className="rx-text-head">
                    <h1 ref={title} className={titleOn ? 'is-intro' : undefined}><span>{meta.title}</span></h1>
                    <p className="rx-text-meta">
                      <span>{tx(meta.theme, lang)}</span>
                      <span><ReadOutlined aria-hidden /> {c.text.words(meta.words)}</span>
                      <span>{c.text.minutes(textMinutes(meta))}</span>
                    </p>
                  </header>
                  {text.email && (
                    <dl className="rx-mail">
                      <div><dt>{c.text.from}</dt><dd>{text.email.from}</dd></div>
                      <div><dt>{c.text.to}</dt><dd>{text.email.to}</dd></div>
                      <div className="is-subject"><dt>{c.text.subject}</dt><dd>{text.email.subject}</dd></div>
                    </dl>
                  )}
                  <div className={`rx-body${hidden ? ' is-hidden' : ''}`}>
                    <TextBody
                      text={text}
                      sentences={sentences}
                      current={n.current}
                      translate={translate}
                      glossAt={glossAt}
                      evidence={evidence}
                      openGloss={pop?.id ?? null}
                      canPlay={!!n.version && !n.failed}
                      onSentence={onSentence}
                      onGloss={onGloss}
                    />
                    {hidden && (
                      <div className="rx-veil">
                        <p>{c.text.hiddenNote}</p>
                        <button type="button" className="lp-btn lp-btn-ghost" onClick={() => setHidden(false)}><EyeOutlined />{c.text.show}</button>
                      </div>
                    )}
                  </div>
                  <p className="rx-hint"><InfoCircleOutlined aria-hidden /> {c.text.hint}</p>
                  {g && pop && (
                    <div className="rx-pop" style={{ left: pop.left, top: pop.top, width: pop.width }} role="dialog" aria-label={g.fr}>
                      <div className="rx-pop-head"><b lang="fr">{g.fr}</b><AudioButton text={g.fr} lang={lang} size="sm" /></div>
                      <p>{g.tr[lang]}</p>
                      {lang === 'en' && <p className="rx-pop-fr" lang="fr">{g.tr.fr}</p>}
                    </div>
                  )}
                </div>
              </div>
              <div className="rx-panel-foot" ref={foot}>
                {away && playing && (
                  <button type="button" className="rx-follow" onClick={follow}><AimOutlined aria-hidden />{c.text.follow}</button>
                )}
                {n.version && !n.failed
                  ? <PlayerBar n={n} lang={lang} many={meta.genre !== 'dialogue'} />
                  : <p className="rx-noaudio"><InfoCircleOutlined aria-hidden /> {n.failed ? c.player.failed : c.player.noAudio}</p>}
              </div>
            </article>
            <div className="rx-col-quiz">
              <Quiz text={text} meta={meta} lang={lang} where={where} onWhere={setWhere} onProgress={setAnswered} />
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section rx-learn" aria-label={c.learn.focusEyebrow}>
        <div className="lp-wrap rx-learn-grid">
          <article className="rx-focus">
            <p className="lp-eyebrow">{c.learn.focusEyebrow}</p>
            <h2>{tx(text.focus.title, lang)}</h2>
            <RichBlock text={tx(text.focus.body, lang)} className="rx-focus-body" />
            <ul className="rx-examples">
              {text.focus.examples.map(e => (
                <li key={e.fr}><Phrase fr={e.fr} lang={lang} />{gloss(e.tr, lang) && <span>{gloss(e.tr, lang)}</span>}</li>
              ))}
            </ul>
          </article>
          <article className="rx-words">
            <h2>{c.learn.wordsTitle}</h2>
            <p>{c.learn.wordsSub}</p>
            <ul>
              {text.glossary.map(x => <li key={x.fr}><Phrase fr={x.fr} lang={lang} /><span>{x.tr[lang]}</span></li>)}
            </ul>
          </article>
        </div>
      </section>

      <section className="lp-section lp-tint" aria-labelledby="rx-next-title">
        <div className="lp-wrap">
          <header className="rx-list-head">
            <h2 id="rx-next-title">{c.learn.nextTitle}</h2>
            <Link to={readingPath(lang)} className="lx-link">{c.text.back}<ArrowRightOutlined /></Link>
          </header>
          <ul className="rx-cards">{more.map(t => <li key={t.id}><TextCard text={t} lang={lang} p={p} /></li>)}</ul>
          <div className="rx-next-cta"><TeacherCta lang={lang} compact /></div>
        </div>
      </section>
    </>
  );
}

export default function ReadingTextPage({ lang, meta }: { lang: Lang; meta: TextMeta }) {
  const c = P[lang];
  const ui = UI[lang];
  const text = useText(meta.id);
  const path = textPath(meta, lang);
  return (
    <LearnShell
      lang={lang}
      alternates={{ en: textPath(meta, 'en'), fr: textPath(meta, 'fr') }}
      seo={{
        title: c.text.metaTitle(meta.title, meta.level),
        description: c.text.metaDescription(tx(meta.subtitle, lang)),
        path,
        jsonLd: textJsonLd(meta, lang),
        image: `https://www.learnfrenchwithnatives.com${imageUrl(meta.image)}`,
      }}
    >
      <div className="rx-top">
        <div className="lp-wrap rx-top-bar">
          <Link to={readingPath(lang)} className="rx-back" aria-label={c.text.back} title={c.text.back}><LeftOutlined /></Link>
          <div className="rx-top-title">
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [c.text.eyebrow, readingPath(lang)], [meta.title]]} />
          </div>
          <LevelChip level={meta.level} />
        </div>
      </div>
      {text ? <TextView text={text} meta={meta} lang={lang} /> : <div className="lx-loading" role="status" aria-label={c.text.loading} />}
    </LearnShell>
  );
}
