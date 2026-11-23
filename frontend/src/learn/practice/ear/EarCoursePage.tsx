// /learn/practice/listening/ear-training/<id>/: one ear-training course.
// Discover the phenomenon (examples at normal speed and slowed down), then one
// exercise at a time with instant feedback and the marked transcript, then the
// score by step and what to remember.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftOutlined, ArrowRightOutlined, CheckCircleFilled, CheckOutlined, CloseCircleFilled, CloseOutlined,
  CustomerServiceOutlined, ReloadOutlined, RetweetOutlined,
} from '@ant-design/icons';
import { ACCESS_GENERATED, itemTier } from '../../access';
import { stop } from '../../audio';
import { RichBlock } from '../../player/common';
import { hubPath } from '../../paths';
import { Crumbs, LearnShell, LevelChip, useMounted } from '../../shell';
import { tx, type Lang } from '../../types';
import { trackLearning } from '../../../utils/siteAnalytics';
import { practicePath } from '../meta';
import { listeningPath } from '../listening/catalog';
import { EARC } from './copy';
import { EAR, earPath } from './meta';
import { Marked, PlayButton } from './parts';
import { useEar } from './registry';
import { useUnlockedPractice } from '../unlocked';
import type { EarCourse, EarItem, EarMeta, EarStep } from './types';
import { SLOW, judge, plainOf, readBest, saveBest } from './util';
import './ear.css';

const SITE = 'https://www.learnfrenchwithnatives.com';
const STEPS: EarStep[] = ['pick', 'fill', 'situation'];

interface Result { ok: boolean; exact: boolean; given: string }

function Intro({ course, lang, onStart }: { course: EarCourse; lang: Lang; onStart: () => void }) {
  const c = EARC[lang];
  return (
    <section className="ear-panel ear-intro" aria-labelledby="ear-rule">
      <p className="ear-kicker">1 · {c.discover}</p>
      <h2 id="ear-rule">{tx(course.rule.title, lang)}</h2>
      <RichBlock text={tx(course.rule.body, lang)} className="ear-rule" />
      <p className="ear-goal"><strong>{c.goal} :</strong> {tx(course.goal, lang)}</p>
      <h3 className="ear-ex-title">{c.examplesTitle}</h3>
      <ul className="ear-examples">
        {course.examples.map(e => (
          <li key={e.say}>
            <Marked text={e.show} className="ear-ex-show" />
            <p className="ear-ex-note">{tx(e.note, lang)}</p>
            <div className="ear-ex-play">
              {e.natural ? (
                <>
                  <PlayButton text={e.say} voice={e.voice} label={c.careful} stopLabel={c.stop} />
                  <PlayButton text={e.natural} voice={e.voice} label={c.everyday} stopLabel={c.stop} />
                  <PlayButton text={e.natural} voice={e.voice} label={c.slow} stopLabel={c.stop} rate={SLOW} icon={<RetweetOutlined aria-hidden />} />
                </>
              ) : (
                <>
                  <PlayButton text={e.say} voice={e.voice} label={c.listen} stopLabel={c.stop} />
                  <PlayButton text={e.say} voice={e.voice} label={c.slow} stopLabel={c.stop} rate={SLOW} icon={<RetweetOutlined aria-hidden />} />
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="ear-legend">{c.legend}</p>
      <button type="button" className="lp-btn lp-btn-primary" onClick={onStart}>{c.begin} <ArrowRightOutlined aria-hidden /></button>
    </section>
  );
}

function Exercise({ item, n, total, lang, onDone }: { item: EarItem; n: number; total: number; lang: Lang; onDone: (r: Result) => void }) {
  const c = EARC[lang];
  const [choice, setChoice] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [plays, setPlays] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => { if (result) nextBtn.current?.focus({ preventScroll: true }); }, [result]);

  const ready = item.kind === 'fill' ? typed.trim().length > 0 : choice !== null;
  const check = () => {
    if (!ready || result) return;
    stop();
    if (item.kind === 'fill') {
      const j = judge(typed, item.answers);
      setResult({ ...j, given: typed.trim() });
    } else {
      const ok = choice === item.answer;
      setResult({ ok, exact: ok, given: item.options[choice!] });
    }
  };
  const prompt = item.kind === 'situation' ? item.q : item.kind === 'pick' ? (item.q ? tx(item.q, lang) : c.pickQ) : c.fillQ;
  const [before, after] = item.kind === 'fill' ? item.gap.split('___') : ['', ''];
  const last = n === total;

  return (
    <section className="ear-panel ear-ex" aria-labelledby="ear-q">
      <div className="ear-ex-head">
        <p className="ear-kicker">{STEPS.indexOf(item.kind) + 2} · {c.step[item.kind]}</p>
        <p className="ear-count">{c.progress(n, total)}</p>
      </div>
      <progress className="ear-bar" value={n - (result ? 0 : 1)} max={total} aria-label={c.progress(n, total)} />
      <h2 id="ear-q" ref={heading} tabIndex={-1} lang={item.kind === 'situation' ? 'fr' : undefined}>{prompt}</h2>
      <p className="ear-hint">{c.listenFirst}</p>
      <div className="ear-listen">
        <PlayButton text={item.say} voice={item.voice} label={c.listen} stopLabel={c.stop} big onPlay={() => setPlays(p => p + 1)} icon={<CustomerServiceOutlined aria-hidden />} />
        <PlayButton text={item.say} voice={item.voice} label={c.slow} stopLabel={c.stop} rate={SLOW} onPlay={() => setPlays(p => p + 1)} icon={<RetweetOutlined aria-hidden />} />
        {plays > 0 && <span className="ear-plays">{c.replays(plays)}</span>}
      </div>

      {item.kind === 'fill' ? (
        <form className="ear-gap" lang="fr" onSubmit={e => { e.preventDefault(); if (result) onDone(result); else check(); }}>
          <label>
            <span>{before}</span>
            <input
              type="text" value={typed} onChange={e => setTyped(e.target.value)} disabled={!!result}
              placeholder={c.fillPlaceholder} aria-label={c.fillQ} autoComplete="off" autoCapitalize="off" spellCheck={false}
              className={result ? (result.ok ? 'is-right' : 'is-wrong') : undefined}
            />
            <span>{after}</span>
          </label>
        </form>
      ) : (
        <div className="ear-options" role="radiogroup" aria-labelledby="ear-q" lang="fr">
          {item.options.map((o, j) => {
            const state = result ? (j === item.answer ? ' is-right' : j === choice ? ' is-wrong' : ' is-off') : choice === j ? ' is-on' : '';
            return (
              <button key={o} type="button" role="radio" aria-checked={choice === j} disabled={!!result} className={`ear-option${state}`} onClick={() => setChoice(j)}>
                <span className="ear-option-k" aria-hidden>{'ABCD'[j]}</span>
                <span>{o}</span>
                {result && j === item.answer && <CheckOutlined aria-hidden className="ear-option-mark" />}
                {result && j === choice && j !== item.answer && <CloseOutlined aria-hidden className="ear-option-mark" />}
              </button>
            );
          })}
        </div>
      )}

      {result ? (
        <div className="ear-feedback" role="status">
          <p className={`ear-verdict ${result.ok ? 'is-right' : 'is-wrong'}`}>
            {result.ok ? <CheckCircleFilled aria-hidden /> : <CloseCircleFilled aria-hidden />}
            {result.ok ? (result.exact ? c.correct : c.accents(item.kind === 'fill' ? item.answers[0] : '')) : c.wrong}
          </p>
          {item.kind === 'fill' && !result.ok && (
            <p className="ear-expected"><span>{c.yourAnswer} : <s lang="fr">{result.given}</s></span><span>{c.expected} : <b lang="fr">{item.answers[0]}</b></span></p>
          )}
          <div className="ear-said">
            <p className="ear-said-k">{c.said}</p>
            <p className="ear-said-t"><Marked text={item.show} /></p>
          </div>
          <p className="ear-why"><strong>{c.why}</strong> {tx(item.explain, lang)}</p>
          <button ref={nextBtn} type="button" className="lp-btn lp-btn-primary" onClick={() => onDone(result)}>
            {last ? c.finish : c.next} <ArrowRightOutlined aria-hidden />
          </button>
        </div>
      ) : (
        <button type="button" className="lp-btn lp-btn-primary ear-check" disabled={!ready} onClick={check}>{c.check}</button>
      )}
    </section>
  );
}

function Results({ course, meta, results, lang, onRetry }: { course: EarCourse; meta: EarMeta; results: Result[]; lang: Lang; onRetry: () => void }) {
  const c = EARC[lang];
  const score = results.filter(r => r.ok).length;
  const next = EAR[EAR.findIndex(e => e.id === meta.id) + 1];
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus({ preventScroll: false }); }, []);
  return (
    <section className="ear-panel ear-results" aria-labelledby="ear-score">
      <h2 id="ear-score" ref={heading} tabIndex={-1}>{c.score(score, results.length)}</h2>
      <p className="ear-hint">{c.scoreSub}</p>
      <ul className="ear-steps-score">
        {STEPS.map(s => {
          const idx = course.items.map((it, i) => (it.kind === s ? i : -1)).filter(i => i >= 0);
          const ok = idx.filter(i => results[i]?.ok).length;
          return (
            <li key={s}>
              <span>{c.step[s]}</span>
              <span className="ear-steps-bar" aria-hidden><i style={{ width: `${idx.length ? (ok / idx.length) * 100 : 0}%` }} /></span>
              <b>{ok}/{idx.length}</b>
            </li>
          );
        })}
      </ul>
      <div className="ear-remember">
        <p className="ear-said-k">{c.remember}</p>
        <p>{tx(course.takeaway, lang)}</p>
      </div>
      <details className="ear-review">
        <summary>{c.review}</summary>
        <ol>
          {course.items.map((it, i) => (
            <li key={`${i}-${it.say}`} className={results[i]?.ok ? 'is-right' : 'is-wrong'}>
              <span className="ear-review-k">{results[i]?.ok ? <CheckOutlined aria-label={c.correct} /> : <CloseOutlined aria-label={c.wrong} />}</span>
              <span className="ear-review-t"><Marked text={it.show} /></span>
              <PlayButton text={it.say} voice={it.voice} label={c.listen} stopLabel={c.stop} />
            </li>
          ))}
        </ol>
      </details>
      <div className="ear-after">
        <button type="button" className="lp-btn lp-btn-ghost" onClick={onRetry}><ReloadOutlined aria-hidden /> {c.retry}</button>
        {next
          ? <Link to={earPath(next, lang)} className="lp-btn lp-btn-primary">{c.nextCourse} <ArrowRightOutlined aria-hidden /></Link>
          : <Link to={listeningPath(lang)} className="lp-btn lp-btn-primary">{c.library} <ArrowRightOutlined aria-hidden /></Link>}
      </div>
    </section>
  );
}

export default function EarCoursePage({ lang, meta }: { lang: Lang; meta: EarMeta }) {
  const c = EARC[lang];
  const localCourse = useEar(meta.id);
  const needsUnlock = Boolean(localCourse?.locked) || (ACCESS_GENERATED && itemTier(`ear:${meta.id}`) !== 'visitor');
  const { data: unlocked } = useUnlockedPractice('ear', meta.id, localCourse, needsUnlock);
  const course = unlocked && !unlocked.locked ? unlocked : null;
  const mounted = useMounted();
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro');
  const [i, setI] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const best = mounted ? readBest()[meta.id] : undefined;
  useEffect(() => () => stop(), []);

  const start = () => {
    setResults([]); setI(0); setPhase('run');
    trackLearning({ kind: 'lesson', action: 'start', course: 'practice-ear', item: meta.id, title: 'Ear training', itemTitle: meta.title });
  };
  const done = (r: Result) => {
    const all = [...results, r];
    setResults(all);
    if (course && all.length >= course.items.length) {
      const score = all.filter(x => x.ok).length;
      saveBest(meta.id, score);
      trackLearning({ kind: 'lesson', action: 'finish', course: 'practice-ear', item: meta.id, score: score / all.length, passed: score / all.length >= 0.8, title: 'Ear training', itemTitle: meta.title });
      setPhase('done');
    } else setI(x => x + 1);
  };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: meta.title,
    description: tx(meta.summary, lang),
    url: `${SITE}${earPath(meta, lang)}`,
    inLanguage: 'fr',
    learningResourceType: 'Listening exercise',
    educationalLevel: meta.level,
    isAccessibleForFree: true,
    timeRequired: `PT${meta.minutes}M`,
  };

  return (
    <LearnShell lang={lang} alternates={{ en: earPath(meta, 'en'), fr: earPath(meta, 'fr') }}
      seo={{ title: `${meta.title} · ${c.track} ${meta.level}`, description: tx(meta.summary, lang), path: earPath(meta, lang), jsonLd }}>
      <div className="ear-page">
        <div className="lp-wrap">
          <Crumbs lang={lang} items={[
            [lang === 'fr' ? 'Cours gratuits' : 'Free courses', hubPath(lang)],
            [lang === 'fr' ? 'Pratique' : 'Practice', practicePath(lang)],
            [lang === 'fr' ? 'Écoute' : 'Listening', listeningPath(lang)],
            [meta.title],
          ]} />
        </div>
        <div className="lp-wrap ear-shell">
          <Link to={listeningPath(lang)} className="ear-back"><ArrowLeftOutlined aria-hidden /> {c.back}</Link>
          <header className="ear-head">
            <div className="ear-head-copy">
              <p className="ear-tags"><LevelChip level={meta.level} size="sm" /> {c.track} · {tx(meta.tag, lang)} · {c.minutes(meta.minutes)}</p>
              <h1 lang="fr">{meta.title}</h1>
              <p>{tx(meta.summary, lang)}</p>
              {best !== undefined && <p className="ear-best">{c.best(best, meta.items)}</p>}
            </div>
            <div className="ear-head-sample" aria-hidden><span lang="fr">{meta.sample}</span></div>
          </header>
          <ol className="ear-method" aria-label={c.track}>
            {c.method.map(([t], k) => {
              const current = phase === 'intro' ? k === 0 : phase === 'run' && course ? STEPS.indexOf(course.items[i].kind) + 1 === k : false;
              return <li key={t} aria-current={current ? 'step' : undefined} className={current ? 'is-on' : undefined}><span>{k + 1}</span>{t}</li>;
            })}
          </ol>
          {!course ? <p className="ear-panel" role="status">{c.loading}</p>
            : phase === 'intro' ? <Intro course={course} lang={lang} onStart={start} />
            : phase === 'run' ? <Exercise key={i} item={course.items[i]} n={i + 1} total={course.items.length} lang={lang} onDone={done} />
            : <Results course={course} meta={meta} results={results} lang={lang} onRetry={start} />}
          <p className="ear-sr" aria-live="polite">{phase === 'run' && course ? plainOf(c.progress(i + 1, course.items.length)) : ''}</p>
        </div>
      </div>
    </LearnShell>
  );
}
