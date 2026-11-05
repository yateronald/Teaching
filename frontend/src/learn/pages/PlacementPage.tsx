// The free level test: climbs from A1, four questions per level, and stops
// at the first level that is not secured. Result: CEFR estimate, CLB range,
// recommended courses, and an invitation to a real assessment with a teacher.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRightOutlined, CheckOutlined, CustomerServiceOutlined, FileTextOutlined, RedoOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { imageUrl } from '../categories';
import { COURSES } from '../catalog';
import { getPlacement, loadPlacement } from '../content/registry';
import { PLACEMENT_LEVELS, type PlacementQuestion } from '../content/placement';
import { hubPath, placementPath } from '../paths';
import { recordPlacement, useProgress } from '../progress';
import { placementJsonLd } from '../schema';
import { CourseCard, Crumbs, LearnShell, useDemo, useMounted } from '../shell';
import type { Lang, Level } from '../types';
import { UI } from '../ui';
import { Mcq } from '../player/stepsBasic';
import type { StepHandle } from '../player/stepTypes';
import { chime, stop as stopAudio } from '../audio';
import { celebrate } from '../player/EndScreen';
import { Overlay, useScrollLock } from './LessonPage';

const PER_LEVEL = 4;

/** Level reached given the answers so far, or null while the test goes on. */
function verdict(answers: { level: Level; ok: boolean }[]): Level | null {
  for (let i = 0; i < PLACEMENT_LEVELS.length; i++) {
    const lvl = PLACEMENT_LEVELS[i];
    const at = answers.filter(a => a.level === lvl);
    if (at.length < PER_LEVEL) return null;
    const ok = at.filter(a => a.ok).length;
    if (ok >= 3) continue;
    if (ok === 2) return lvl;
    return i === 0 ? 'A1' : PLACEMENT_LEVELS[i - 1];
  }
  return 'C1';
}

function recommend(level: Level) {
  const idx = PLACEMENT_LEVELS.indexOf(level);
  const target = PLACEMENT_LEVELS[Math.min(idx + 1, PLACEMENT_LEVELS.length - 1)];
  const exact = COURSES.filter(c => c.levels.length === 1 && (c.levels[0] === level || c.levels[0] === target));
  const exams = COURSES.filter(c => c.category === 'tcf' && c.levels.includes(level)).slice(0, 2);
  return [...exact.slice(0, 4), ...exams].slice(0, 6);
}

function Test({ lang, onDone, onExit }: { lang: Lang; onDone: (lvl: Level, score: number) => void; onExit: () => void }) {
  const ui = UI[lang];
  const [questions, setQuestions] = useState<PlacementQuestion[] | null>(() => getPlacement() ?? null);
  const [answers, setAnswers] = useState<{ level: Level; ok: boolean }[]>([]);
  const [ready, setReady] = useState(false);
  const handle = useRef<StepHandle | null>(null);
  useEffect(() => { if (!questions) loadPlacement().then(setQuestions); }, [questions]);
  useEffect(() => () => stopAudio(), []);
  if (!questions) return <div className="lx-loading" role="status" />;

  const q = questions[answers.length];
  const estimate = Math.min(questions.length, Math.max(answers.length + 1, 8));
  const next = () => {
    const r = handle.current?.check();
    if (!r) return;
    chime('right');
    const all = [...answers, { level: q.level, ok: r.correct }];
    const v = verdict(all);
    setReady(false);
    if (v || all.length >= questions.length) onDone(v ?? 'C1', all.filter(a => a.ok).length / all.length);
    else setAnswers(all);
  };

  return (
    <div className="lx-player">
      <header className="lx-ptop">
        <button type="button" className="lx-icon-btn" onClick={onExit} aria-label={ui.player.exit}>×</button>
        <div className="lx-pbar"><motion.i animate={{ scaleX: answers.length / estimate }} /></div>
        <span className="lx-xp">{ui.placement.question(answers.length + 1, questions.length)}</span>
      </header>
      <main className="lx-pstage">
        <AnimatePresence mode="wait">
          <motion.div key={answers.length} className="lx-step" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
            <p className="lx-place-skill">
              {q.skill === 'listening' ? <CustomerServiceOutlined /> : q.skill === 'reading' ? <FileTextOutlined /> : <ThunderboltOutlined />}
              {ui.placement.question(answers.length + 1, questions.length)}
            </p>
            <Mcq ref={handle} step={{ ...q, level: undefined }} lang={lang} locked={false} seed={`place-${answers.length}`} onReady={setReady} />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="lx-pfoot">
        <div className="lx-pfoot-in">
          <p className="lx-pfoot-kind">{ui.placement.eyebrow}</p>
          <button type="button" className="lx-pbtn" disabled={!ready} onClick={next}>{ui.player.next}</button>
        </div>
      </footer>
    </div>
  );
}

export default function PlacementPage({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const pl = ui.placement;
  const { openOffer } = useDemo();
  const p = useProgress();
  const mounted = useMounted();
  const [phase, setPhase] = useState<'intro' | 'test'>('intro');
  const [fresh, setFresh] = useState<Level | null>(null);
  useScrollLock(phase === 'test');
  const level = fresh ?? (mounted ? p.placement?.level : undefined);

  return (
    <LearnShell lang={lang} alternates={{ en: placementPath('en'), fr: placementPath('fr') }}
      seo={{ title: pl.metaTitle, description: pl.metaDescription, path: placementPath(lang), jsonLd: placementJsonLd(lang), image: `https://www.learnfrenchwithnatives.com${imageUrl('placement')}` }}>
      <section className="lx-place-hero" aria-labelledby="lx-place-title">
        <div className="lp-wrap lx-place-grid">
          <div>
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [pl.eyebrow]]} />
            <p className="lp-eyebrow">{pl.eyebrow}</p>
            <h1 id="lx-place-title">{level ? pl.resultTitle(level) : pl.title}</h1>
            {level ? (
              <div className="lx-place-result">
                <div className="lx-scale" aria-hidden>
                  {PLACEMENT_LEVELS.map(l => <span key={l} className={l === level ? 'is-on' : PLACEMENT_LEVELS.indexOf(l) < PLACEMENT_LEVELS.indexOf(level) ? 'is-below' : ''}>{l}</span>)}
                </div>
                <p className="lx-hero-sub">{pl.descriptions[level]}</p>
                <p className="lx-place-clb"><strong>{pl.clb}</strong> {pl.clbText(level)}</p>
                <p className="lx-note">{pl.resultNote}</p>
                <div className="lp-hero-ctas">
                  <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => openOffer(`${lang === 'fr' ? 'Évaluation de niveau' : 'Level assessment'} (${level})`)}>{pl.ctaTitle}<ArrowRightOutlined /></button>
                  <button type="button" className="lp-btn lp-btn-ghost lp-btn-lg" onClick={() => { setFresh(null); setPhase('test'); }}><RedoOutlined />{pl.retake}</button>
                </div>
              </div>
            ) : (
              <>
                <p className="lx-hero-sub">{pl.sub}</p>
                <ul className="lx-place-points">{pl.points.map(x => <li key={x}><CheckOutlined aria-hidden />{x}</li>)}</ul>
                <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => setPhase('test')}>{pl.start}<ArrowRightOutlined /></button>
              </>
            )}
          </div>
          <figure className="lx-cat-img"><img src={imageUrl('placement')} alt="" width="1200" height="675" fetchPriority="high" /></figure>
        </div>
      </section>

      {level && (
        <section className="lp-section lp-tint" aria-labelledby="lx-place-reco">
          <div className="lp-wrap">
            <h2 id="lx-place-reco" className="lx-h2">{pl.recommended}</h2>
            <ul className="lx-grid">{recommend(level).map(c => <li key={c.id}><CourseCard course={c} lang={lang} /></li>)}</ul>
            <p className="lx-more"><Link to={hubPath(lang)} className="lx-link">{ui.hub.ctaBrowse} →</Link></p>
          </div>
        </section>
      )}

      {phase === 'test' && (
        <Overlay>
          <Test lang={lang} onExit={() => setPhase('intro')} onDone={(lvl, score) => { recordPlacement(lvl, score); setFresh(lvl); setPhase('intro'); celebrate(); window.scrollTo({ top: 0 }); }} />
        </Overlay>
      )}
    </LearnShell>
  );
}
