// /learn/practice/listening/dialogues/<id>/: one everyday dialogue.
// The scene and the two speakers, then the conversation played line by line in
// each speaker's voice (no text), the questions, and once checked: each answer
// with the line that proves it, the whole transcript, phrases to reuse and a tip.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftOutlined, ArrowRightOutlined, CaretRightFilled, CheckCircleFilled, CheckOutlined, CloseCircleFilled,
  CloseOutlined, PauseOutlined, ReloadOutlined, StepBackwardOutlined, StepForwardOutlined,
} from '@ant-design/icons';
import { ACCESS_GENERATED, itemTier } from '../../access';
import { beforeSpeak, prefetchRecording, speak, stop } from '../../audio';
import { hubPath } from '../../paths';
import { Crumbs, LearnShell, LevelChip, useMounted } from '../../shell';
import { tx, type Lang } from '../../types';
import { trackLearning } from '../../../utils/siteAnalytics';
import { practicePath } from '../meta';
import { listeningPath } from '../listening/catalog';
import { usePinnedPlayer } from '../pinned';
import { PlayButton } from '../ear/parts';
import { DLGC } from './copy';
import { DIALOGUES, THEMES, dialoguePath, dialoguesPath, themeOf } from './meta';
import { DialogueCover, Initial, ThemeIcon } from './parts';
import { useDialogue } from './registry';
import { useUnlockedPractice } from '../unlocked';
import type { Dialogue, DialogueMeta } from './types';
import { optionOrder, readBest, saveBest } from './util';
import '../ear/ear.css';
import './dialogues.css';

const SITE = 'https://www.learnfrenchwithnatives.com';
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const SLOWER = 0.8;
const wait = (ms: number) => new Promise<void>(r => { setTimeout(r, ms); });

/** Plays the dialogue line by line, each in its speaker's voice; any other sound on the page pauses it. */
function useLinePlayer(d: Dialogue) {
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false);
  const [slow, setSlow] = useState(false);
  const run = useRef(0);
  const own = useRef(false);
  const rate = useRef(1);

  useEffect(() => {
    const interrupted = () => { if (!own.current) { run.current++; setPlaying(false); } };
    beforeSpeak.add(interrupted);
    // The first lines are loaded ahead, so that a tap starts them at once.
    d.lines.slice(0, 2).forEach(l => prefetchRecording(l.fr, d.speakers[l.who].voice));
    const runs = run;
    return () => { beforeSpeak.delete(interrupted); runs.current++; stop(); };
  }, [d]);

  async function playFrom(start: number) {
    const token = ++run.current;
    setPlaying(true);
    for (let i = Math.max(0, start); i < d.lines.length; i++) {
      setCur(i);
      d.lines.slice(i + 1, i + 3).forEach(l => prefetchRecording(l.fr, d.speakers[l.who].voice));
      own.current = true;
      const done = speak(d.lines[i].fr, { voice: d.speakers[d.lines[i].who].voice, rate: rate.current });
      own.current = false;
      await done;
      if (run.current !== token) return;
      // A short breath between lines, a little longer when the other person answers.
      await wait(d.lines[i + 1] && d.lines[i + 1].who !== d.lines[i].who ? 450 : 250);
      if (run.current !== token) return;
    }
    setPlaying(false); setCur(0); setHeard(true);
  }
  const pause = () => { run.current++; stop(); setPlaying(false); };
  return {
    cur, playing, heard, slow,
    toggle: () => { if (playing) pause(); else void playFrom(cur); },
    playFrom: (i: number) => { void playFrom(Math.min(Math.max(i, 0), d.lines.length - 1)); },
    pause,
    toggleSlow: () => { rate.current = rate.current === 1 ? SLOWER : 1; setSlow(rate.current !== 1); },
  };
}

function Player({ d, lang, player }: { d: Dialogue; lang: Lang; player: ReturnType<typeof useLinePlayer> }) {
  const c = DLGC[lang];
  const { slot, card, pin } = usePinnedPlayer('.dlg-player');
  const { cur, playing, heard, slow } = player;
  const n = d.lines.length;
  const speaking = playing ? d.lines[cur].who : null;
  const started = playing || cur > 0;
  const longest = Math.max(...d.lines.map(l => l.fr.length));
  return (
    <div ref={slot} className="dlg-player-slot" style={pin ? { height: pin.height } : undefined}>
      <section ref={card} className={`dlg-player-card${pin ? ' is-pinned' : ''}`} aria-label={c.play}
        style={pin ? { top: pin.top, left: pin.left, width: pin.width } : undefined}>
        <div className="dlg-player">
          <button type="button" className="dlg-play" onClick={player.toggle} aria-label={playing ? c.pause : started ? c.resume : heard ? c.again : c.play}>
            {playing ? <PauseOutlined aria-hidden /> : <CaretRightFilled aria-hidden />}
          </button>
          <div className="dlg-now">
            <p className="dlg-now-t" aria-live="polite">
              {started ? c.line(cur + 1, n) : heard ? <><CheckCircleFilled aria-hidden /> {c.heard}</> : <><b>{c.play}</b> · {c.ready(n)}</>}
            </p>
            <div className="dlg-now-who">
              {d.speakers.map((s, k) => (
                <span key={s.name} className={`dlg-who is-who-${k}${speaking === k ? ' is-speaking' : ''}`}>
                  <Initial name={s.name} /> {s.name}
                  {speaking === k && <span className="dlg-eq" aria-hidden><i /><i /><i /></span>}
                </span>
              ))}
            </div>
            <span className="dlg-progress" aria-hidden><i style={{ width: `${((started ? cur + (playing ? 1 : 0) : heard ? n : 0) / n) * 100}%` }} /></span>
          </div>
          <div className="dlg-tools">
            <button type="button" className="dlg-tool" onClick={() => player.playFrom(cur - 1)} disabled={!started || cur === 0} aria-label={c.prevLine} title={c.prevLine}><StepBackwardOutlined aria-hidden /></button>
            <button type="button" className="dlg-tool" onClick={() => player.playFrom(cur + 1)} disabled={!started || cur >= n - 1} aria-label={c.nextLine} title={c.nextLine}><StepForwardOutlined aria-hidden /></button>
            <button type="button" className={`dlg-slow${slow ? ' is-on' : ''}`} aria-pressed={slow} onClick={player.toggleSlow}>{c.slower}</button>
          </div>
        </div>
        <ol className="dlg-timeline" aria-label={c.timeline}>
          {d.lines.map((l, i) => {
            const state = playing && i === cur ? ' is-now' : (started && i < cur) || heard ? ' is-done' : '';
            return (
              <li key={i} className={`is-who-${l.who}${state}`}>
                <button type="button" onClick={() => player.playFrom(i)} aria-label={c.lineLabel(i + 1, d.speakers[l.who].name)}
                  aria-current={playing && i === cur ? 'true' : undefined}
                  style={{ width: `${Math.round(24 + (l.fr.length / longest) * 52)}%` }}>
                  <Initial name={d.speakers[l.who].name} />
                  <span className="dlg-bubble-n">{i + 1}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="dlg-timeline-hint">{c.timeline}</p>
      </section>
    </div>
  );
}

function Body({ d, meta, lang }: { d: Dialogue; meta: DialogueMeta; lang: Lang }) {
  const c = DLGC[lang];
  const player = useLinePlayer(d);
  const [answers, setAnswers] = useState<(number | null)[]>(() => d.questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const scoreRef = useRef<HTMLHeadingElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);
  const count = answers.filter(a => a !== null).length;
  const score = d.questions.filter((q, i) => answers[i] === q.answer).length;
  const total = d.questions.length;

  useEffect(() => { if (checked) scoreRef.current?.focus(); }, [checked]);
  useEffect(() => {
    if (!player.playing || tracked.current) return;
    tracked.current = true;
    trackLearning({ kind: 'lesson', action: 'start', course: 'practice-dialogue', item: meta.id, title: 'Dialogues', itemTitle: meta.title });
  }, [player.playing, meta]);

  const check = () => {
    if (count < total) return;
    player.pause();
    saveBest(meta.id, score, total);
    trackLearning({ kind: 'lesson', action: 'finish', course: 'practice-dialogue', item: meta.id, score: score / total, passed: score / total >= 0.8, title: 'Dialogues', itemTitle: meta.title });
    setChecked(true);
  };
  const retry = () => {
    player.pause();
    setAnswers(d.questions.map(() => null));
    setChecked(false);
    top.current?.scrollIntoView({ block: 'start' });
  };

  const levelIdx = LEVELS.indexOf(meta.level);
  const nextLevel = DIALOGUES.find(x => x.theme === meta.theme && LEVELS.indexOf(x.level) === levelIdx + 1);
  const nextThemeId = THEMES[(THEMES.findIndex(t => t.id === meta.theme) + 1) % THEMES.length].id;
  const nextTheme = DIALOGUES.find(x => x.theme === nextThemeId && x.level === meta.level);
  const step = checked ? 3 : count > 0 ? 1 : 0;

  return (
    <>
      <div ref={top} className="dlg-anchor" />
      <ol className="ear-method dlg-method" aria-label={c.track}>
        {c.steps.map((t, k) => (
          <li key={t} aria-current={k === step ? 'step' : undefined} className={k === step ? 'is-on' : k < step ? 'is-done' : undefined}>
            <span>{k < step ? <CheckOutlined aria-hidden /> : k + 1}</span>{t}
          </li>
        ))}
      </ol>

      <section className="dlg-scene" aria-labelledby="dlg-scene-k">
        <p id="dlg-scene-k" className="ear-kicker">{c.scene}</p>
        <p className="dlg-scene-t">{tx(d.setting, lang)}</p>
      </section>

      <Player d={d} lang={lang} player={player} />

      <section className="ear-panel dlg-quiz" aria-labelledby="dlg-q-title">
        {checked && (
          <div className="dlg-result">
            <h2 ref={scoreRef} tabIndex={-1}>{c.score(score, total)}</h2>
            <p>{score / total >= 0.8 ? c.scoreGood : score / total >= 0.5 ? c.scoreMid : c.scoreLow}</p>
            <ol className="dlg-dots" aria-hidden>
              {d.questions.map((q, i) => <li key={i} className={answers[i] === q.answer ? 'is-right' : 'is-wrong'}>{i + 1}</li>)}
            </ol>
          </div>
        )}
        <div className="dlg-section-head">
          <h2 id="dlg-q-title">{c.questions}</h2>
          {!checked && <span>{c.answered(count, total)}</span>}
        </div>
        {!checked && <p className="ear-hint">{c.questionsHint}</p>}
        <ol className="dlg-questions">
          {d.questions.map((q, qi) => {
            const order = optionOrder(q.options.length, `${d.id}:${qi}`);
            const ok = answers[qi] === q.answer;
            const proof = d.lines[q.line];
            const who = d.speakers[proof.who];
            return (
              <li key={qi} className="dlg-question">
                <p className="dlg-q" id={`dlg-q-${qi}`} lang="fr"><span aria-hidden>{qi + 1}</span>{q.q}</p>
                <div className="ear-options" role="radiogroup" aria-labelledby={`dlg-q-${qi}`} lang="fr">
                  {order.map((o, j) => {
                    const chosen = answers[qi] === o;
                    const state = checked ? (o === q.answer ? ' is-right' : chosen ? ' is-wrong' : ' is-off') : chosen ? ' is-on' : '';
                    return (
                      <button key={o} type="button" role="radio" aria-checked={chosen} disabled={checked} className={`ear-option${state}`}
                        onClick={() => setAnswers(a => a.map((x, k) => (k === qi ? o : x)))}>
                        <span className="ear-option-k" aria-hidden>{'ABCD'[j]}</span>
                        <span>{q.options[o]}</span>
                        {checked && o === q.answer && <CheckOutlined aria-label={c.rightAnswer} className="ear-option-mark" />}
                        {checked && chosen && o !== q.answer && <CloseOutlined aria-label={c.yourAnswer} className="ear-option-mark" />}
                      </button>
                    );
                  })}
                </div>
                {checked && (
                  <div className="dlg-review">
                    <p className={`ear-verdict ${ok ? 'is-right' : 'is-wrong'}`}>
                      {ok ? <CheckCircleFilled aria-hidden /> : <CloseCircleFilled aria-hidden />} {ok ? c.correct : c.wrong}
                    </p>
                    <p className="ear-why"><strong>{c.why}</strong> {tx(q.explain, lang)}</p>
                    <figure className="dlg-proof">
                      <figcaption>{c.proof}</figcaption>
                      <blockquote lang="fr" className={`is-who-${proof.who}`}>
                        <span className="dlg-proof-who"><Initial name={who.name} /> {who.name}</span>
                        <span className="dlg-proof-t">{proof.fr}</span>
                      </blockquote>
                      <PlayButton text={proof.fr} voice={who.voice} label={c.replayLine} stopLabel={c.stop} />
                    </figure>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {!checked && (
          <div className="dlg-check">
            <button type="button" className="lp-btn lp-btn-primary" disabled={count < total} onClick={check}>{c.check}</button>
            {count < total && <p className="ear-hint">{c.checkHint}</p>}
          </div>
        )}
      </section>

      {checked && (
        <>
          <section className="ear-panel dlg-transcript" aria-labelledby="dlg-tr-title">
            <h2 id="dlg-tr-title">{c.transcript}</h2>
            <p className="ear-hint">{c.transcriptHint}</p>
            <ol className="dlg-lines">
              {d.lines.map((l, i) => {
                const s = d.speakers[l.who];
                return (
                  <li key={i} className={`dlg-line is-who-${l.who}`}>
                    <Initial name={s.name} />
                    <div className="dlg-line-body">
                      <p className="dlg-line-who" lang="fr">{s.name}</p>
                      <p className="dlg-line-fr" lang="fr">{l.fr}</p>
                      {lang === 'en' && <p className="dlg-line-en">{l.en}</p>}
                    </div>
                    <PlayButton text={l.fr} voice={s.voice} label={String(i + 1)} stopLabel={c.stop} />
                  </li>
                );
              })}
            </ol>
          </section>
          <div className="dlg-reuse">
            <section className="ear-panel dlg-phrases" aria-labelledby="dlg-ph-title">
              <h2 id="dlg-ph-title">{c.phrases}</h2>
              <ul>
                {d.phrases.map(p => {
                  const l = d.lines[p];
                  return (
                    <li key={p}>
                      <div>
                        <p className="dlg-line-fr" lang="fr">{l.fr}</p>
                        {lang === 'en' && <p className="dlg-line-en">{l.en}</p>}
                      </div>
                      <PlayButton text={l.fr} voice={d.speakers[l.who].voice} label={c.start} stopLabel={c.stop} />
                    </li>
                  );
                })}
              </ul>
            </section>
            <aside className="dlg-tip" aria-labelledby="dlg-tip-title">
              <h2 id="dlg-tip-title">{c.tip}</h2>
              <p>{tx(d.tip, lang)}</p>
            </aside>
          </div>
          <div className="ear-after">
            <button type="button" className="lp-btn lp-btn-ghost" onClick={retry}><ReloadOutlined aria-hidden /> {c.retry}</button>
            {nextLevel && <Link to={dialoguePath(nextLevel, lang)} className="lp-btn lp-btn-primary">{c.nextLevel} <ArrowRightOutlined aria-hidden /></Link>}
            {nextTheme && <Link to={dialoguePath(nextTheme, lang)} className={`lp-btn ${nextLevel ? 'lp-btn-ghost' : 'lp-btn-primary'}`}>{c.nextTheme} <ArrowRightOutlined aria-hidden /></Link>}
          </div>
        </>
      )}
    </>
  );
}

export default function DialoguePage({ lang, meta }: { lang: Lang; meta: DialogueMeta }) {
  const c = DLGC[lang];
  const localD = useDialogue(meta.id, meta.theme);
  const needsUnlock = Boolean(localD?.locked) || (ACCESS_GENERATED && itemTier(`dialogue:${meta.id}`) !== 'visitor');
  const { data: unlocked } = useUnlockedPractice('dialogue', meta.id, localD, needsUnlock);
  const d = unlocked && !unlocked.locked ? unlocked : null;
  const mounted = useMounted();
  const best = mounted ? readBest()[meta.id] : undefined;
  const theme = themeOf(meta.theme);
  const ladder = DIALOGUES.filter(x => x.theme === meta.theme);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: meta.title,
    description: tx(meta.summary, lang),
    url: `${SITE}${dialoguePath(meta, lang)}`,
    inLanguage: 'fr',
    learningResourceType: 'Listening exercise',
    educationalLevel: meta.level,
    isAccessibleForFree: true,
  };

  return (
    <LearnShell lang={lang} alternates={{ en: dialoguePath(meta, 'en'), fr: dialoguePath(meta, 'fr') }}
      seo={{ title: `${meta.title} · ${c.track} ${meta.level}`, description: tx(meta.summary, lang), path: dialoguePath(meta, lang), jsonLd }}>
      <div className="ear-page dlg-page">
        <div className="lp-wrap">
          <Crumbs lang={lang} items={[
            [lang === 'fr' ? 'Cours gratuits' : 'Free courses', hubPath(lang)],
            [lang === 'fr' ? 'Pratique' : 'Practice', practicePath(lang)],
            [lang === 'fr' ? 'Écoute' : 'Listening', listeningPath(lang)],
            [c.track, dialoguesPath(lang)],
            [meta.title],
          ]} />
        </div>
        <div className="lp-wrap ear-shell">
          <Link to={dialoguesPath(lang)} state={{ theme: meta.theme }} className="ear-back"><ArrowLeftOutlined aria-hidden /> {c.back}</Link>
          <header className="dlg-head">
            <div className="dlg-head-copy">
              <p className="ear-tags"><LevelChip level={meta.level} size="sm" /> {c.track} · {tx(theme.name, lang)}</p>
              <h1 lang="fr">{meta.title}</h1>
              <p>{tx(meta.summary, lang)}</p>
              {best && <p className="ear-best">{c.best(best[0], best[1])}</p>}
            </div>
            <div className="dlg-head-visual">
              <DialogueCover id={meta.id} sizes="(max-width: 640px) calc(100vw - 36px), 245px" eager />
              <span className="dlg-head-theme" aria-hidden><ThemeIcon theme={meta.theme} /> {tx(theme.name, lang)}</span>
            </div>
          </header>
          <nav className="dlg-ladder" aria-label={tx(theme.name, lang)}>
            {ladder.map(x => (
              <Link key={x.id} to={dialoguePath(x, lang)} aria-current={x.id === meta.id ? 'page' : undefined} className={x.id === meta.id ? 'is-on' : undefined}>
                <b>{x.level}</b> <span lang="fr">{x.title}</span>
              </Link>
            ))}
          </nav>
          {d ? <Body key={d.id} d={d} meta={meta} lang={lang} /> : <p className="ear-panel" role="status">{c.loading}</p>}
        </div>
      </div>
    </LearnShell>
  );
}
