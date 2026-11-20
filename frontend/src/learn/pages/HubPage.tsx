// /learn/ and /fr/apprendre/: Guided Study-Path Platform (Architecture #2).
// Step 1: 15-second Goal & Level Finder (collapses to 1-line switcher once chosen).
// Step 2 & 3: Structured mixed-skill Study Roadmap (LEARN · LISTEN · READ · WRITE)
// with live progress tracking, single "Continue Module X" CTA, Checkpoint & Next Level.
// Below: Clean 4-Pillar Free Library Explorer (488 items), 30s Method Preview,
// Native Teacher Showcase, and FAQ.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AppstoreOutlined, ArrowRightOutlined, AudioOutlined, BarsOutlined,
  BookOutlined, CheckCircleFilled, CheckOutlined, ClockCircleOutlined,
  CloseOutlined, CommentOutlined, CompassOutlined, CustomerServiceOutlined,
  DownOutlined, DragOutlined, EditOutlined, PlayCircleFilled, ReadOutlined,
  ReloadOutlined, RocketOutlined, SearchOutlined, SlidersOutlined,
  SoundOutlined, ThunderboltOutlined, TrophyOutlined, UpOutlined,
} from '@ant-design/icons';
import { chime, speak, usePlaying } from '../audio';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { COURSES, courseById, coursePath } from '../catalog';
import { AUTOSTART, hubPath, placementPath } from '../paths';
import { hubJsonLd } from '../schema';
import { LEVEL_COPY, levelPath } from '../levels';
import { G } from '../games/copy';
import { GAMES, gamesPath } from '../games/meta';
import { GameCard } from './GamesHubPage';
import { TEXTS, practicePath, readingPath } from '../practice/meta';
import { MISSIONS } from '../practice/missions';
import { DIALOGUES } from '../practice/dialogues/meta';
import { EAR } from '../practice/ear/meta';
import { LISTENING, listeningPath } from '../practice/listening/catalog';
import { DICTATIONS, dictationPath } from '../practice/dictation/catalog';
import { openAcademySearch } from '../studyPath/searchIndex';
import { StudyRoadmap } from '../components/StudyRoadmap';
import { setStudyGoal, setStudyLevel, setStudyPath, useStudyPath } from '../studyPath/activityStore';
import { TOTAL_ACADEMY_ITEMS, buildStudyPlan, levelActivityStats } from '../studyPath/builder';
import { COURSE_TRACKS, GOALS, STUDY_COPY, goalById } from '../studyPath/copy';
import type { StudyGoalId } from '../studyPath/types';
import '../games/games.css';
import '../practice/practice.css';
import './hub.css';
import { CourseCard, LearnShell, LevelChip, useDemo, useMounted } from '../shell';
import { LEVELS, tx, type Lang, type Level } from '../types';
import { UI } from '../ui';

const HERO_PHRASE = 'Je voudrais un café, s’il vous plaît.';
const TRY_AUDIO_PHRASE = 'Je voudrais un café, s’il vous plaît.';
const TRY_PAST_PHRASE = 'Je suis allé à Paris.';
const ACTIVITY_ICONS = [<CustomerServiceOutlined />, <AudioOutlined />, <DragOutlined />, <TrophyOutlined />];

const GOAL_ICON: Record<StudyGoalId, ReactNode> = {
  complete: <RocketOutlined />,
  exams: <TrophyOutlined />,
  diploma: <BookOutlined />,
  fluency: <CustomerServiceOutlined />,
};

type LibraryTab = 'courses' | 'practice' | 'levels' | 'games';

const levelBand = (lv: Level) => (lv === 'A1' || lv === 'A2' ? 'is-a' : lv === 'B1' || lv === 'B2' ? 'is-b' : 'is-c');
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function HeroAudioPill({ lang }: { lang: Lang }) {
  const playing = usePlaying(HERO_PHRASE);
  return (
    <button
      type="button"
      className={`sp-audio-chip${playing ? ' is-playing' : ''}`}
      onClick={() => speak(HERO_PHRASE)}
      aria-label={lang === 'fr' ? `Écouter une voix native : ${HERO_PHRASE}` : `Listen to native French: ${HERO_PHRASE}`}
    >
      <span className="sp-audio-ico" aria-hidden><PlayCircleFilled /></span>
      <span className="sp-audio-copy">
        <small>{lang === 'fr' ? 'Voix native · Cliquez pour écouter' : 'Native voice · Tap to listen'}</small>
        <b lang="fr">« Je voudrais un café, s’il vous plaît. »</b>
      </span>
      <span className="hx-wave" aria-hidden><u /><u /><u /><u /></span>
    </button>
  );
}

interface MiniStep {
  kicker: string;
  prompt: string;
  kind: 'gap' | 'audio';
  before?: string;
  after?: string;
  audioPhrase?: string;
  options: string[];
  answer: number;
  rightText: string;
  wrongText: string;
  speakOnPick?: (option: string) => string;
}

function TryItStudio({ lang }: { lang: Lang }) {
  const fr = lang === 'fr';
  const ui = UI[lang].hub;
  const firstCourse = courseById('first-steps') ?? COURSES[0];
  const steps = useMemo<MiniStep[]>(() => [
    {
      kicker: fr ? 'Défi 1 / 3 · Genre (A1)' : 'Challenge 1 / 3 · Gender (A1)',
      prompt: ui.tryPrompt,
      kind: 'gap',
      before: '',
      after: ' croissant',
      options: ['un', 'une', 'des'],
      answer: 0,
      rightText: ui.tryRight,
      wrongText: ui.tryWrong,
      speakOnPick: o => `${o} croissant`,
    },
    {
      kicker: fr ? 'Défi 2 / 3 · Écoute native (A1)' : 'Challenge 2 / 3 · Native listening (A1)',
      prompt: fr ? 'Écoutez la phrase : que demande cette personne ?' : 'Listen to the voice: what is this person asking for?',
      kind: 'audio',
      audioPhrase: TRY_AUDIO_PHRASE,
      options: fr
        ? ['Un café, poliment', 'L’addition pour payer', 'Le chemin de la gare']
        : ['A coffee, politely', 'The bill to pay', 'Directions to the station'],
      answer: 0,
      rightText: fr
        ? 'Bravo ! « Je voudrais un café, s’il vous plaît » est la formule polie par excellence au café.'
        : 'Spot on! “Je voudrais un café, s’il vous plaît” is the polite way to order at a French café.',
      wrongText: fr
        ? 'Réécoutez : elle dit « Je voudrais un café, s’il vous plaît ».'
        : 'Listen again: she says “Je voudrais un café, s’il vous plaît” (I would like a coffee, please).',
    },
    {
      kicker: fr ? 'Défi 3 / 3 · Passé composé (A2)' : 'Challenge 3 / 3 · Past tense (A2)',
      prompt: fr ? 'Complétez la phrase au passé :' : 'Complete the sentence in the past tense:',
      kind: 'gap',
      before: 'Hier, ',
      after: ' à Paris.',
      options: ['je suis allé', 'j’ai allé', 'je vais'],
      answer: 0,
      rightText: fr
        ? 'Exact ! Le verbe « aller » se conjugue toujours avec l’auxiliaire être au passé composé.'
        : 'Exact! The verb “aller” (to go) always uses “être” in the passé composé.',
      wrongText: fr
        ? 'Attention : « aller » utilise toujours l’auxiliaire être → « je suis allé ».'
        : 'Watch out: “aller” always takes “être” → “je suis allé”.',
      speakOnPick: () => TRY_PAST_PHRASE,
    },
  ], [fr, ui]);

  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const audioPlaying = usePlaying(TRY_AUDIO_PHRASE);

  const step = steps[idx];
  const answered = pick !== null;
  const isRight = pick === step.answer;

  const choose = (i: number) => {
    if (answered) return;
    setPick(i);
    const ok = i === step.answer;
    if (ok) setScore(s => s + 1);
    chime(ok ? 'right' : 'wrong');
    if (step.speakOnPick) speak(step.speakOnPick(step.options[i]));
  };

  const next = () => {
    if (idx + 1 < steps.length) {
      setIdx(n => n + 1);
      setPick(null);
    } else {
      setFinished(true);
      chime('done');
    }
  };

  const reset = () => {
    setIdx(0);
    setPick(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="hx-try-card">
      <div className="hx-try-flag" aria-hidden><i /><i /><i /></div>
      <div className="hx-try-top">
        <span className="hx-try-kicker">{finished ? (fr ? 'Mini-leçon terminée' : 'Mini-lesson complete') : step.kicker}</span>
        <span className="hx-try-dots" aria-hidden>
          {steps.map((_, i) => (
            <i key={i} className={finished || i < idx ? 'is-done' : i === idx ? 'is-now' : ''} />
          ))}
        </span>
      </div>

      {finished ? (
        <div className="hx-try-done">
          <div className="hx-try-score">{score}/{steps.length}</div>
          <h3>{score === steps.length ? (fr ? 'Sans faute ! Vous êtes prêt.' : 'Flawless! You’re ready.') : (fr ? 'Bien joué ! C’est comme ça qu’on progresse.' : 'Nice work! That’s how every lesson feels.')}</h3>
          <p>
            {fr
              ? `Nos ${TOTAL_ACADEMY_ITEMS} activités gratuites suivent cette même approche : voix natives, action immédiate et correction claire.`
              : `All ${TOTAL_ACADEMY_ITEMS} free activities work just like this: native voices, active practice and clear feedback.`}
          </p>
          <div className="hx-try-done-ctas">
            <Link to={placementPath(lang)} className="lp-btn lp-btn-primary lp-btn-sm">
              <ThunderboltOutlined /> {fr ? 'Trouver mon niveau' : 'Find my level'} <ArrowRightOutlined />
            </Link>
            <Link to={coursePath(firstCourse, lang)} state={AUTOSTART} className="lp-btn lp-btn-ghost lp-btn-sm">
              <PlayCircleFilled /> {fr ? '1re leçon gratuite' : 'Start 1st lesson'}
            </Link>
            <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={reset}>
              <ReloadOutlined /> {fr ? 'Rejouer' : 'Replay'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="hx-try-q">{step.prompt}</p>
          <div className="hx-try-stage">
            {step.kind === 'gap' ? (
              <p className="hx-try-sentence" lang="fr">
                {step.before}
                <b className={`lx-gap${answered ? ' is-filled' : ''}`}>{answered ? step.options[pick] : '\u00A0\u00A0\u00A0'}</b>
                {step.after}
              </p>
            ) : (
              <button
                type="button"
                className={`hx-try-listen${audioPlaying ? ' is-playing' : ''}`}
                onClick={() => step.audioPhrase && speak(step.audioPhrase)}
              >
                <span className="hx-try-listen-ico" aria-hidden><SoundOutlined /></span>
                <span>
                  <strong>{audioPlaying ? (fr ? 'Lecture en cours…' : 'Playing native voice…') : (fr ? 'Écouter la voix native' : 'Play native French audio')}</strong>
                  <small>{fr ? 'Cliquez pour écouter autant de fois que voulu' : 'Tap to listen as many times as you like'}</small>
                </span>
              </button>
            )}
          </div>

          <div className={`hx-try-opts${step.kind === 'audio' ? ' is-stack' : ''}`}>
            {step.options.map((opt, i) => {
              const cls = answered
                ? i === step.answer
                  ? ' is-right'
                  : pick === i
                    ? ' is-wrong'
                    : ''
                : '';
              return (
                <motion.button
                  key={opt}
                  type="button"
                  whileTap={answered ? undefined : { scale: 0.97 }}
                  className={`lx-option${cls}`}
                  onClick={() => choose(i)}
                  animate={pick === i && i !== step.answer ? { x: [0, -5, 5, -3, 3, 0] } : {}}
                >
                  {opt}
                </motion.button>
              );
            })}
          </div>

          {answered && (
            <motion.div
              className={`hx-try-fb${isRight ? ' is-right' : ' is-wrong'}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p>{isRight ? step.rightText : step.wrongText}</p>
              <button type="button" className="lp-btn lp-btn-primary lp-btn-sm" onClick={next}>
                {idx + 1 < steps.length ? (fr ? 'Défi suivant' : 'Next challenge') : (fr ? 'Voir mon score' : 'See my score')}
                <ArrowRightOutlined />
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

export default function HubPage({ lang }: { lang: Lang }) {
  const fr = lang === 'fr';
  const ui = UI[lang];
  const h = ui.hub;
  const fc = STUDY_COPY[lang].finder;
  const lc = STUDY_COPY[lang].library;
  const { openDemo } = useDemo();
  const mounted = useMounted();
  const saved = useStudyPath();

  // Finder collapses smoothly for returning learners who already picked a path (re-openable in 1 click).
  const [editingFinder, setEditingFinder] = useState(false);
  const showFullFinder = !mounted || !saved.picked || editingFinder;

  // Library Explorer state
  const [libTab, setLibTab] = useState<LibraryTab>('courses');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [cat, setCat] = useState<string>('all');
  const [q, setQ] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const PAGE = 8;
  const [shown, setShown] = useState(PAGE);

  const activeGoal = mounted ? saved.goal : 'complete';
  const activeLevel = mounted ? saved.level : 'A1';
  const plan = useMemo(() => buildStudyPlan(activeGoal, activeLevel, lang), [activeGoal, activeLevel, lang]);
  const levelStats = useMemo(() => LEVELS.map(lv => levelActivityStats(lv)), []);

  const readingTotal = TEXTS.length + MISSIONS.length;
  const listeningTotal = DIALOGUES.length + EAR.length + LISTENING.length;
  const practiceTotal = readingTotal + listeningTotal + DICTATIONS.length;

  const filteredCourses = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return COURSES.filter(c => (level === 'all' || c.levels.includes(level)) && (cat === 'all' || c.category === cat) && words.every(w => {
      const catName = tx(CATEGORIES.find(x => x.id === c.category)!.name, lang);
      const hay = norm(`${tx(c.title, lang)} ${tx(c.subtitle, lang)} ${catName} ${c.level}`);
      return hay.includes(w);
    }));
  }, [level, q, lang, cat]);

  useEffect(() => { setShown(PAGE); }, [level, q, cat]);

  const visibleCount = Math.min(filteredCourses.length, shown);
  const remaining = filteredCourses.length - visibleCount;

  const handleConfirmPath = () => {
    setStudyPath(activeGoal, activeLevel, true);
    setEditingFinder(false);
    const el = document.getElementById('roadmap');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAdvanceLevel = (next: Level) => {
    setStudyPath(activeGoal, next, true);
    setEditingFinder(false);
    const el = document.getElementById('roadmap');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: hubPath('en'), fr: hubPath('fr') }}
      seo={{
        title: h.metaTitle,
        description: h.metaDescription,
        path: hubPath(lang),
        jsonLd: hubJsonLd(lang),
        image: `https://www.learnfrenchwithnatives.com${imageUrl('hub-hero')}`,
      }}
    >
      {/* ── SECTION 1: Calm Editorial Hero + STEP 1 (15-Second Goal & Level Finder) ── */}
      <section className="sp-hero" id="finder" aria-labelledby="lx-hub-title">
        <div className="lp-wrap">
          <div className="sp-hero-head">
            <div className="sp-hero-copy">
              <div className="hx-hero-kicker">
                <p className="lp-eyebrow">{fc.eyebrow}</p>
                <span className="hx-free-pill">
                  <CheckCircleFilled aria-hidden /> {fc.freePill}
                </span>
              </div>
              <h1 id="lx-hub-title">
                {fc.title[0]} <em>{fc.title[1]}</em>
              </h1>
              <p className="sp-hero-sub">{fc.sub}</p>
            </div>

            <div className="sp-hero-aside">
              <HeroAudioPill lang={lang} />
              <dl className="sp-hero-counts">
                <div>
                  <dt>{COURSES.length}</dt>
                  <dd>{fr ? 'cours guidés' : 'guided courses'}</dd>
                </div>
                <div>
                  <dt>{practiceTotal}</dt>
                  <dd>{fr ? 'ateliers pratiques' : 'practice labs'}</dd>
                </div>
                <div>
                  <dt>{GAMES.length}</dt>
                  <dd>{fr ? 'jeux · 3 min' : 'daily games'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Step 1 Interactive Finder OR Compact Active-Path Bar for returning learners */}
          {showFullFinder ? (
            <div className="sp-finder-card">
              <div className="sp-finder-step">
                <p className="sp-finder-k">{fc.step1}</p>
                <div className="sp-goal-grid" role="radiogroup" aria-label={fc.step1}>
                  {GOALS.map(g => {
                    const selected = activeGoal === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`sp-goal-btn${selected ? ' is-on' : ''}`}
                        onClick={() => setStudyGoal(g.id, saved.picked)}
                      >
                        <div className="sp-goal-top">
                          <span className="sp-goal-ico" aria-hidden>{GOAL_ICON[g.id]}</span>
                          <span className="sp-goal-badge">{tx(g.badge, lang)}</span>
                          {selected && <CheckCircleFilled className="sp-goal-check" aria-hidden />}
                        </div>
                        <strong>{tx(g.title, lang)}</strong>
                        <small>{tx(g.subtitle, lang)}</small>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sp-finder-step sp-finder-step-lvl">
                <p className="sp-finder-k">{fc.step2}</p>

                <div className="sp-lvl-picker" role="radiogroup" aria-label={fc.step2}>
                  {levelStats.map(st => {
                    const selected = activeLevel === st.level;
                    return (
                      <button
                        key={st.level}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`sp-lvl-opt ${levelBand(st.level)}${selected ? ' is-on' : ''}`}
                        onClick={() => setStudyLevel(st.level, saved.picked)}
                      >
                        <b>{st.level}</b>
                        <span>{tx(LEVEL_COPY[st.level].name, lang)}</span>
                        <em>{fc.levelCount(st.total)}</em>
                      </button>
                    );
                  })}
                </div>

                <div className="sp-finder-foot">
                  <Link to={placementPath(lang)} className="sp-test-link">
                    <ThunderboltOutlined /> {fc.notSure} <ArrowRightOutlined />
                  </Link>

                  <button type="button" className="lp-btn lp-btn-primary sp-confirm-btn" onClick={handleConfirmPath}>
                    {fc.startCta} <ArrowRightOutlined />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sp-active-bar">
              <div className="sp-active-left">
                <span className="sp-active-k"><CompassOutlined /> {fc.activeLabel}</span>
                <LevelChip level={activeLevel} size="sm" />
                <strong>{tx(goalById(activeGoal).title, lang)} · {tx(LEVEL_COPY[activeLevel].name, lang)}</strong>
              </div>
              <div className="sp-active-right">
                <Link to={placementPath(lang)} className="sp-active-test">
                  <ThunderboltOutlined /> {fr ? 'Test de niveau' : 'Level test'}
                </Link>
                <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setEditingFinder(true)}>
                  <SlidersOutlined /> {fc.changePath}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 2: STEP 2 & STEP 3 — Structured Study Path Roadmap ── */}
      <section className="sp-roadmap-sec" id="roadmap" aria-label={STUDY_COPY[lang].roadmap.progressLabel(activeLevel)}>
        <div className="lp-wrap">
          <StudyRoadmap
            lang={lang}
            plan={plan}
            mounted={mounted}
            onAdvanceLevel={handleAdvanceLevel}
            showResumeLink
            showClassroomLink
          />
        </div>
      </section>

      {/* ── SECTION 3: Optional Free Library Explorer (4 Clean Pillars — 488 Items) ── */}
      <section className="hx-sec lp-tint" id="library" aria-labelledby="sp-lib-title">
        <div className="lp-wrap">
          <header className="hx-sec-head">
            <div>
              <p className="lp-eyebrow">{lc.eyebrow}</p>
              <h2 id="sp-lib-title">{lc.title}</h2>
            </div>
            <div className="sp-lib-head-end">
              <p className="hx-sec-head-sub">{lc.sub}</p>
              <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={openAcademySearch}>
                <SearchOutlined /> {lc.searchBtn}
              </button>
            </div>
          </header>

          {/* 4-Pillar Tab Switcher */}
          <div className="sp-lib-tabs" role="tablist" aria-label={lc.eyebrow}>
            {([
              ['courses', lc.tabCourses, COURSES.length, <BookOutlined />],
              ['practice', lc.tabPractice, practiceTotal, <CustomerServiceOutlined />],
              ['levels', lc.tabLevels, LEVELS.length, <CompassOutlined />],
              ['games', lc.tabGames, GAMES.length, <TrophyOutlined />],
            ] as [LibraryTab, string, number, ReactNode][]).map(([id, label, count, icon]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={libTab === id}
                className={libTab === id ? 'is-on' : ''}
                onClick={() => setLibTab(id)}
              >
                {icon}
                <span>{label}</span>
                <b>{count}</b>
              </button>
            ))}
          </div>

          {/* Pillar 1: 75 Structured Courses (4 Clean Tracks + Filterable Directory) */}
          <div hidden={mounted && libTab !== 'courses'}>
            <div className="sp-tracks-grid">
              {COURSE_TRACKS.map(track => (
                <article key={track.id} className="sp-track-card">
                  <h3>{tx(track.title, lang)}</h3>
                  <p>{tx(track.subtitle, lang)}</p>
                  <ul className="sp-track-cats">
                    {track.categories.map(catId => {
                      const catObj = CATEGORIES.find(x => x.id === catId);
                      if (!catObj) return null;
                      const n = COURSES.filter(x => x.category === catObj.id).length;
                      return (
                        <li key={catObj.id}>
                          <Link to={categoryPath(catObj, lang)}>
                            <span>{tx(catObj.name, lang)}</span>
                            <small>{n} <ArrowRightOutlined aria-hidden /></small>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              ))}
            </div>

            <div className="sp-catalog-wrap" id="courses">
              <div className="sp-catalog-head">
                <strong>{lc.allCoursesHint}</strong>
                <span className="lx-cat-count-pill" aria-live="polite">{h.results(filteredCourses.length)}</span>
              </div>

              <div className="hx-cat-toolbar">
                <div className="rxl-level-pills" role="group" aria-label={ui.level}>
                  <button type="button" className={level === 'all' ? 'is-on' : ''} onClick={() => setLevel('all')} aria-pressed={level === 'all'}>
                    {fr ? 'Tous' : 'All'}<span>{COURSES.length}</span>
                  </button>
                  {LEVELS.map(lv => (
                    <button key={lv} type="button" className={level === lv ? 'is-on' : ''} onClick={() => setLevel(lv)} aria-pressed={level === lv}>
                      <b>{lv}</b><span>{COURSES.filter(c => c.levels.includes(lv)).length}</span>
                    </button>
                  ))}
                </div>

                <div className="hx-cat-tools">
                  <label className="hx-cat-search">
                    <SearchOutlined aria-hidden />
                    <input
                      type="search"
                      value={q}
                      onChange={e => setQ(e.target.value)}
                      placeholder={h.search}
                      aria-label={h.search}
                    />
                    {q && (
                      <button type="button" onClick={() => setQ('')} aria-label={fr ? 'Effacer' : 'Clear'}>
                        <CloseOutlined />
                      </button>
                    )}
                  </label>

                  <div className="rxl-view-toggle" role="group" aria-label={fr ? 'Mode d’affichage' : 'Display mode'}>
                    <button type="button" className={view === 'grid' ? 'is-on' : ''} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
                      <AppstoreOutlined /> {fr ? 'Grille' : 'Grid'}
                    </button>
                    <button type="button" className={view === 'list' ? 'is-on' : ''} aria-pressed={view === 'list'} onClick={() => setView('list')}>
                      <BarsOutlined /> {fr ? 'Liste' : 'List'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="hx-cat-cats" role="group" aria-label={h.pathsEyebrow}>
                <button type="button" className={cat === 'all' ? 'is-on' : ''} onClick={() => setCat('all')} aria-pressed={cat === 'all'}>
                  {h.allCats}
                </button>
                {CATEGORIES.map(c => (
                  <button key={c.id} type="button" className={cat === c.id ? 'is-on' : ''} onClick={() => setCat(c.id)} aria-pressed={cat === c.id}>
                    {tx(c.name, lang)}
                  </button>
                ))}
              </div>

              {filteredCourses.length ? (
                <>
                  {view === 'grid' ? (
                    <ul className="hx-cat-grid">
                      {filteredCourses.slice(0, shown).map(c => (
                        <li key={c.id}><CourseCard course={c} lang={lang} /></li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="hx-cat-list">
                      {filteredCourses.slice(0, shown).map(c => {
                        const catObj = CATEGORIES.find(x => x.id === c.category)!;
                        return (
                          <li key={c.id}>
                            <article className="hx-list-row">
                              <img src={imageUrl(c.image, 640)} alt="" loading="lazy" decoding="async" width="224" height="140" />
                              <div className="hx-list-body">
                                <div className="hx-list-top">
                                  <LevelChip level={c.level} size="sm" />
                                  <span className="hx-list-cat">{tx(catObj.name, lang)}</span>
                                </div>
                                <h3><Link to={coursePath(c, lang)} className="lx-stretch">{tx(c.title, lang)}</Link></h3>
                                <div className="hx-list-meta">
                                  <span><ReadOutlined /> {ui.lessons(c.lessonCount)}</span>
                                  <span><ClockCircleOutlined /> {ui.minutes(c.minutes)}</span>
                                </div>
                              </div>
                              <Link to={coursePath(c, lang)} state={AUTOSTART} className="lx-cc-start">
                                <PlayCircleFilled /> {ui.start}
                              </Link>
                            </article>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {filteredCourses.length > PAGE && (
                    <div className="rxl-pager">
                      <div className="rxl-pager-status">
                        <span>
                          {fr
                            ? `Affichage de ${visibleCount} sur ${filteredCourses.length} cours`
                            : `Showing ${visibleCount} of ${filteredCourses.length} courses`}
                        </span>
                        <i aria-hidden><b style={{ transform: `scaleX(${visibleCount / filteredCourses.length})` }} /></i>
                      </div>
                      <div className="rxl-pager-actions">
                        {remaining > 0 ? (
                          <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setShown(n => n + PAGE)}>
                            {fr ? `Afficher ${Math.min(PAGE, remaining)} de plus` : `Show ${Math.min(PAGE, remaining)} more`} <DownOutlined />
                          </button>
                        ) : (
                          <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setShown(PAGE)}>
                            {fr ? 'Réduire' : 'Show fewer'} <UpOutlined />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rxl-empty">
                  <p>{h.noResult}</p>
                  <button
                    type="button"
                    className="lp-btn lp-btn-ghost lp-btn-sm"
                    onClick={() => { setLevel('all'); setCat('all'); setQ(''); }}
                  >
                    {fr ? 'Réinitialiser les filtres' : 'Reset filters'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pillar 2: 3 Flagship Practice Studios (407 Activities) */}
          <div hidden={mounted && libTab !== 'practice'}>
            <ul className="sp-studios-grid">
              <li>
                <article className="sp-studio-card">
                  <Link to={readingPath(lang)} className="sp-studio-img" tabIndex={-1} aria-hidden="true">
                    <img src={imageUrl('cat-reading', 640)} alt="" loading="lazy" width="640" height="360" />
                    <span className="sp-studio-badge">{readingTotal} {fr ? 'activités · A1–C1' : 'activities · A1–C1'}</span>
                  </Link>
                  <div className="sp-studio-body">
                    <h3><Link to={readingPath(lang)}><ReadOutlined /> {fr ? 'Atelier de lecture' : 'Reading Studio'}</Link></h3>
                    <p>{fr ? 'Textes courts lus par des natifs, mots cliquables et missions de lecture concrètes.' : 'Short native-audio stories, tap-to-translate words and real-life reading missions.'}</p>
                    <div className="sp-studio-tags">
                      <Link to={`${readingPath(lang)}#texts`}>{fr ? 'Textes audio' : 'Audio texts'} <b>{TEXTS.length}</b></Link>
                      <Link to={`${readingPath(lang)}#missions`}>{fr ? 'Missions' : 'Missions'} <b>{MISSIONS.length}</b></Link>
                    </div>
                    <Link to={readingPath(lang)} className="lp-btn lp-btn-primary lp-btn-sm sp-studio-cta">
                      {lc.openStudio} <ArrowRightOutlined />
                    </Link>
                  </div>
                </article>
              </li>

              <li>
                <article className="sp-studio-card">
                  <Link to={listeningPath(lang)} className="sp-studio-img" tabIndex={-1} aria-hidden="true">
                    <img src={imageUrl('cat-listening', 640)} alt="" loading="lazy" width="640" height="360" />
                    <span className="sp-studio-badge">{listeningTotal} {fr ? 'activités · A1–C2' : 'activities · A1–C2'}</span>
                  </Link>
                  <div className="sp-studio-body">
                    <h3><Link to={listeningPath(lang)}><CustomerServiceOutlined /> {fr ? 'Atelier d’écoute' : 'Listening Studio'}</Link></h3>
                    <p>{fr ? 'Dialogues à deux voix, exercices d’oreille ciblés et documents authentiques du A1 au C2.' : 'Two-voice everyday dialogues, targeted ear labs and real French audio documents.'}</p>
                    <div className="sp-studio-tags">
                      <Link to={`${listeningPath(lang)}#dialogues`}><CommentOutlined /> Dialogues <b>{DIALOGUES.length}</b></Link>
                      <Link to={`${listeningPath(lang)}#ear`}><AudioOutlined /> {fr ? 'Oreille' : 'Ear'} <b>{EAR.length}</b></Link>
                      <Link to={`${listeningPath(lang)}#documents`}><CompassOutlined /> Docs <b>{LISTENING.length}</b></Link>
                    </div>
                    <Link to={listeningPath(lang)} className="lp-btn lp-btn-primary lp-btn-sm sp-studio-cta">
                      {lc.openStudio} <ArrowRightOutlined />
                    </Link>
                  </div>
                </article>
              </li>

              <li>
                <article className="sp-studio-card">
                  <Link to={dictationPath(lang)} className="sp-studio-img" tabIndex={-1} aria-hidden="true">
                    <img src={imageUrl('cat-spelling', 640)} alt="" loading="lazy" width="640" height="360" />
                    <span className="sp-studio-badge">{DICTATIONS.length} {fr ? 'dictées · A1–C2' : 'dictations · A1–C2'}</span>
                  </Link>
                  <div className="sp-studio-body">
                    <h3><Link to={dictationPath(lang)}><EditOutlined /> {fr ? 'Atelier de dictée' : 'Dictation Studio'}</Link></h3>
                    <p>{fr ? '4 formats variés (récits, homophones, verbes & accords, défi examen) avec 2 voix natives.' : '4 varied methods (stories, homophones, verbs & agreement, timed exam) with 2 native voices.'}</p>
                    <div className="sp-studio-tags">
                      <Link to={dictationPath(lang)}>{fr ? 'Récits · Homophones · Verbes · Examen' : 'Stories · Homophones · Verbs · Exam'} <b>4</b></Link>
                    </div>
                    <Link to={dictationPath(lang)} className="lp-btn lp-btn-primary lp-btn-sm sp-studio-cta">
                      {lc.openStudio} <ArrowRightOutlined />
                    </Link>
                  </div>
                </article>
              </li>
            </ul>
            <p className="sp-studio-all-row">
              <Link to={practicePath(lang)} className="lx-link">
                {fr ? 'Voir la page d’accueil complète des ateliers pratiques' : 'Open the full Practice Studio hub'} →
              </Link>
            </p>
          </div>

          {/* Pillar 3: By CEFR Level (Unified A1–C2 Classrooms) */}
          <div hidden={mounted && libTab !== 'levels'}>
            <ul className="hx-cefr">
              {levelStats.map(st => (
                <li key={st.level}>
                  <Link to={levelPath(st.level, lang)} className={`hx-cefr-card ${levelBand(st.level)}`}>
                    <div className="hx-cefr-top">
                      <LevelChip level={st.level} size="sm" />
                      <strong>{tx(LEVEL_COPY[st.level].name, lang)}</strong>
                    </div>
                    <p>{tx(LEVEL_COPY[st.level].canDo, lang)}</p>
                    <div className="sp-cefr-breakdown">
                      <span>{st.courses + st.ladder} {fr ? 'cours' : 'courses'}</span>
                      <span>{st.listening} {fr ? 'écoutes' : 'listening'}</span>
                      <span>{st.dictations} {fr ? 'dictées' : 'dictations'}</span>
                    </div>
                    <span className="hx-cefr-go">
                      {st.total} {fr ? 'activités' : 'activities'} <ArrowRightOutlined aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 4: 5 Daily Games */}
          <div hidden={mounted && libTab !== 'games'}>
            <div className="sp-games-head">
              <p>{G[lang].hubSub}</p>
              <Link to={gamesPath(lang)} className="lp-btn lp-btn-ghost lp-btn-sm">
                {G[lang].backToGames} <ArrowRightOutlined />
              </Link>
            </div>
            <ul className="gx-gcards">
              {GAMES.map((x, i) => (
                <li key={x.id} className={i === 0 ? 'is-wide' : ''}>
                  <GameCard game={x} lang={lang} wide={i === 0} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: 30-Second Interactive Method Preview ── */}
      <section className="hx-sec" aria-labelledby="lx-try-title">
        <div className="lp-wrap hx-try-grid">
          <div className="hx-try-copy">
            <p className="lp-eyebrow">{h.tryEyebrow}</p>
            <h2 id="lx-try-title">{h.tryTitle}</h2>
            <p>{h.trySub}</p>
            <ul className="hx-pillars">
              {h.activities.map(([t, d], i) => (
                <li key={t}>
                  <span aria-hidden>{ACTIVITY_ICONS[i]}</span>
                  <div>
                    <strong>{t}</strong>
                    <p>{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <TryItStudio lang={lang} />
        </div>
      </section>

      {/* ── SECTION 5: Native Teacher Showcase + Clean FAQ ── */}
      <section className="hx-teacher lx-teacher" aria-labelledby="lx-teacher-title">
        <div className="lp-wrap lx-teacher-grid">
          <div>
            <p className="lp-eyebrow is-light">{h.teacherEyebrow}</p>
            <h2 id="lx-teacher-title">{h.teacherTitle}</h2>
            <p>{h.teacherSub}</p>
            <ul>{h.teacherPoints.map(x => <li key={x}><CheckOutlined aria-hidden />{x}</li>)}</ul>
            <button type="button" className="lp-btn lp-btn-light lp-btn-lg" onClick={openDemo}>
              {ui.demo} <ArrowRightOutlined />
            </button>
          </div>
          <div className="hx-teacher-img-wrap">
            <figure className="lx-teacher-img">
              <img src={imageUrl('teacher', 1200)} alt="" loading="lazy" decoding="async" width="1200" height="675" />
            </figure>
            <span className="hx-teacher-badge">
              <CheckCircleFilled aria-hidden />
              {fr ? 'Professeurs natifs certifiés · En ligne ou en présentiel' : 'Certified native teachers · Online or in person'}
            </span>
          </div>
        </div>
      </section>

      <section className="hx-sec" aria-labelledby="lx-faq-title">
        <div className="lp-wrap lp-faq-grid">
          <header className="lp-head is-left">
            <p className="lp-eyebrow">{h.faqEyebrow}</p>
            <h2 id="lx-faq-title">{h.faqTitle}</h2>
            <p className="lx-faq-time">
              <ClockCircleOutlined />{' '}
              {fr
                ? `${COURSES.length} cours · 255 leçons · ${practiceTotal} ateliers · ${GAMES.length} jeux`
                : `${COURSES.length} courses · 255 lessons · ${practiceTotal} practice labs · ${GAMES.length} games`}
            </p>
          </header>
          <div className="lp-faq-list">
            {h.faq.map(([qq, a], i) => (
              <details key={qq} className="lp-faq-item" open={i === 0 || undefined}>
                <summary><h3>{qq}</h3><span className="lp-faq-icon" aria-hidden /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </LearnShell>
  );
}
