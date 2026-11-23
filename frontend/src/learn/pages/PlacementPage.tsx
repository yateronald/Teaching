// The free level test: climbs from A1, four questions per level, and stops
// at the first level that is not secured. Result: CEFR estimate, CLB range,
// recommended courses, and an invitation to a real assessment with a teacher.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRightOutlined, CheckOutlined, CloseOutlined, CustomerServiceOutlined, EditOutlined, FileTextOutlined, InfoCircleOutlined, ReadOutlined, RedoOutlined } from '@ant-design/icons';
import { imageUrl } from '../categories';
import { absoluteMediaUrl } from '../mediaUrl';
import { COURSES } from '../catalog';
import { getPlacement, loadPlacement } from '../content/registry';
import { PLACEMENT_LEVELS, type PlacementQuestion } from '../content/placement';
import { hubPath, placementPath } from '../paths';
import { levelPath } from '../levels';
import { setStudyLevel } from '../studyPath/activityStore';
import { recordPlacement, useProgress } from '../progress';
import './placement.css';
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

const SKILL_ICON: Record<PlacementQuestion['skill'], React.ReactNode> = {
  listening: <CustomerServiceOutlined />,
  reading: <FileTextOutlined />,
  grammar: <EditOutlined />,
  vocabulary: <ReadOutlined />,
};
const SKILL_LABEL: Record<PlacementQuestion['skill'], [string, string]> = {
  listening: ['Listening', 'Compréhension orale'],
  reading: ['Reading', 'Compréhension écrite'],
  grammar: ['Grammar', 'Grammaire'],
  vocabulary: ['Vocabulary', 'Vocabulaire'],
};

function Test({ lang, onDone, onExit }: { lang: Lang; onDone: (lvl: Level, score: number) => void; onExit: () => void }) {
  const ui = UI[lang];
  const fr = lang === 'fr';
  const [questions, setQuestions] = useState<PlacementQuestion[] | null>(() => getPlacement() ?? null);
  const [answers, setAnswers] = useState<{ level: Level; ok: boolean }[]>([]);
  const [ready, setReady] = useState(false);
  const handle = useRef<StepHandle | null>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!questions) loadPlacement().then(setQuestions); }, [questions]);
  useEffect(() => () => stopAudio(), []);

  const q = questions?.[answers.length];
  const next = () => {
    if (!questions || !q) return;
    const r = handle.current?.check();
    if (!r) return;
    chime('right');
    const all = [...answers, { level: q.level, ok: r.correct }];
    const v = verdict(all);
    setReady(false);
    if (v || all.length >= questions.length) onDone(v ?? 'C1', all.filter(a => a.ok).length / all.length);
    else setAnswers(all);
  };
  const nextRef = useRef(next);
  nextRef.current = next;

  // Enter: next question (1 to 4 choose an answer, in Mcq).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      if (e.target instanceof HTMLButtonElement && e.target !== nextBtn.current) return;
      e.preventDefault();
      if (ready) nextRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ready]);

  if (!questions || !q) return <div className="lx-loading" role="status" />;

  const exit = () => { if (answers.length === 0 || window.confirm(fr ? 'Quitter le test ? Vos réponses seront perdues.' : 'Leave the test? Your answers will be lost.')) onExit(); };
  const n = answers.length + 1;
  const levelIdx = PLACEMENT_LEVELS.indexOf(q.level);

  return (
    <div className="lx-player is-placement">
      <header className="lx-ptop-bar">
        <div className="lx-ptop">
          <button type="button" className="lx-icon-btn" onClick={exit} aria-label={ui.player.exit} title={ui.player.exit}><CloseOutlined /></button>
          <div className="lx-ptop-track">
            <div className="lx-ptop-meta">
              <span className="lx-ptop-title">{ui.placement.eyebrow}</span>
              <span className="lx-ptop-count">{fr ? `Question ${n} · ${questions.length} max` : `Question ${n} · up to ${questions.length}`}</span>
            </div>
            <ol className="pt-ladder" aria-label={fr ? 'Niveaux testés' : 'Levels tested'}>
              {PLACEMENT_LEVELS.map((lvl, i) => {
                const at = answers.filter(a => a.level === lvl);
                const state = i < levelIdx ? 'is-done' : i === levelIdx ? 'is-now' : '';
                const fill = i < levelIdx ? 1 : i === levelIdx ? at.length / PER_LEVEL : 0;
                return (
                  <li key={lvl} className={state} aria-current={i === levelIdx ? 'step' : undefined}>
                    <span className="pt-ladder-bar"><motion.i initial={false} animate={{ scaleX: Math.max(fill, i === levelIdx ? 0.06 : 0) }} transition={{ type: 'spring', stiffness: 160, damping: 26 }} /></span>
                    <b>{i < levelIdx ? <CheckOutlined /> : null}{lvl}</b>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </header>
      <main className="lx-pstage">
        <AnimatePresence mode="wait">
          <motion.div
            key={answers.length}
            className="lx-step is-mcq pt-step"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="lx-stage-card pt-card">
              <div className="lx-stage-flag" aria-hidden><i /><i /><i /></div>
              <div className="pt-card-head">
                <span className={`pt-skill is-${q.skill}`}>{SKILL_ICON[q.skill]}{SKILL_LABEL[q.skill][fr ? 1 : 0]}</span>
                <span className="pt-level">{fr ? 'Niveau' : 'Level'} <b>{q.level}</b></span>
              </div>
              <Mcq ref={handle} step={{ ...q, level: undefined }} lang={lang} locked={false} seed={`place-${answers.length}`} onReady={setReady} />
            </div>
            <p className="pt-hint">
              <InfoCircleOutlined aria-hidden />
              {fr ? 'Répondez seul, sans dictionnaire : le test s’adapte à vos réponses et s’arrête dès qu’il a trouvé votre niveau.' : 'Answer on your own, without a dictionary: the test adapts to your answers and stops as soon as it has found your level.'}
            </p>
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="lx-pfoot">
        <div className="lx-pfoot-in">
          <div className="lx-pfoot-meta">
            <span className="lx-pfoot-kind">{ui.placement.eyebrow}</span>
            <span className="lx-pfoot-key" aria-hidden>
              <kbd>1</kbd>–<kbd>4</kbd> {fr ? 'pour choisir' : 'to choose'} · <kbd>Enter ↵</kbd> {fr ? 'pour continuer' : 'to continue'}
            </span>
          </div>
          <motion.button ref={nextBtn} type="button" className="lx-pbtn" disabled={!ready} onClick={next} whileTap={{ scale: 0.97 }}>
            {ui.player.next} <ArrowRightOutlined />
          </motion.button>
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
      seo={{ title: pl.metaTitle, description: pl.metaDescription, path: placementPath(lang), jsonLd: placementJsonLd(lang), image: absoluteMediaUrl(imageUrl('placement')) }}>
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
                  <Link to={levelPath(level, lang)} className="lp-btn lp-btn-primary lp-btn-lg">
                    {lang === 'fr' ? `Ouvrir mon parcours ${level}` : `Start my ${level} Study Path`} <ArrowRightOutlined />
                  </Link>
                  <button type="button" className="lp-btn lp-btn-ghost lp-btn-lg" onClick={() => openOffer(`${lang === 'fr' ? 'Évaluation de niveau' : 'Level assessment'} (${level})`)}>{pl.ctaTitle}</button>
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
          <Test lang={lang} onExit={() => setPhase('intro')} onDone={(lvl, score) => { recordPlacement(lvl, score); setStudyLevel(lvl, true); setFresh(lvl); setPhase('intro'); celebrate(); window.scrollTo({ top: 0 }); }} />
        </Overlay>
      )}
    </LearnShell>
  );
}
