// /learn/ and /fr/apprendre/: flagship front door of the free French academy.
// Editorial hero with live native audio & visual studio dock, goal-first entry,
// interactive 3-step micro-lesson, curated starter picks, dark-navy Practice &
// Games showcase, structured learning paths, CEFR staircase, and full catalogue.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AppstoreOutlined, ArrowRightOutlined, AudioOutlined, BarsOutlined,
  CheckCircleFilled, CheckOutlined, ClockCircleOutlined, CloseOutlined,
  CommentOutlined, CompassOutlined, CustomerServiceOutlined, DownOutlined,
  DragOutlined, PlayCircleFilled, ReadOutlined, ReloadOutlined,
  RocketOutlined, SearchOutlined, SoundOutlined, ThunderboltOutlined,
  TrophyOutlined, UpOutlined,
} from '@ant-design/icons';
import { chime, speak, usePlaying } from '../audio';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { COURSES, courseById, coursePath } from '../catalog';
import { AUTOSTART, hubPath, placementPath } from '../paths';
import { useProgress } from '../progress';
import { hubJsonLd } from '../schema';
import { LEVEL_COPY, coursesAtLevel, levelPath } from '../levels';
import { G } from '../games/copy';
import { GAMES, gamesPath } from '../games/meta';
import { GameCard } from './GamesHubPage';
import { P } from '../practice/copy';
import { TEXTS, practicePath, readingPath } from '../practice/meta';
import { MISSIONS } from '../practice/missions';
import { DIALOGUES } from '../practice/dialogues/meta';
import { EAR } from '../practice/ear/meta';
import { LISTENING, listeningPath } from '../practice/listening/catalog';
import { DICTATIONS, dictationPath } from '../practice/dictation/catalog';
import '../games/games.css';
import '../practice/practice.css';
import './hub.css';
import { CourseCard, LearnShell, LevelChip, useDemo, useMounted } from '../shell';
import { LEVELS, tx, type CourseMeta, type Lang, type Level } from '../types';
import { UI } from '../ui';

const HERO_PHRASE = 'Je voudrais un café, s’il vous plaît.';
const TRY_AUDIO_PHRASE = 'Je voudrais un café, s’il vous plaît.';
const TRY_PAST_PHRASE = 'Je suis allé à Paris.';
const ACTIVITY_ICONS = [<CustomerServiceOutlined />, <AudioOutlined />, <DragOutlined />, <TrophyOutlined />];
const EXAM_CAT_IDS = new Set(['tcf', 'tef-quebec', 'delf-dalf', 'business']);

type PickTab = 'popular' | 'beginner' | 'exams' | 'speaking';
type PathGroup = 'all' | 'core' | 'exams';

const levelBand = (lv: Level) => (lv === 'A1' || lv === 'A2' ? 'is-a' : lv === 'B1' || lv === 'B2' ? 'is-b' : 'is-c');
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function HeroAudioPill({ lang }: { lang: Lang }) {
  const playing = usePlaying(HERO_PHRASE);
  return (
    <button
      type="button"
      className={`hx-audio-pill${playing ? ' is-playing' : ''}`}
      onClick={() => speak(HERO_PHRASE)}
      aria-label={lang === 'fr' ? `Écouter une voix native : ${HERO_PHRASE}` : `Listen to native French: ${HERO_PHRASE}`}
    >
      <span className="hx-audio-btn" aria-hidden><PlayCircleFilled /></span>
      <span className="hx-audio-txt">
        <small>{lang === 'fr' ? 'Voix native · Cliquez pour écouter' : 'Native voice · Tap to listen'}</small>
        <b lang="fr">« Je voudrais un café… »</b>
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
              ? 'Nos 75 cours et 221 activités fonctionnent exactement sur ce principe : audio natif, action immédiate et explication claire.'
              : 'All 75 courses and 221 practice activities work just like this: native audio, instant interaction and clear feedback.'}
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
  const pc = P[lang];
  const { openDemo } = useDemo();
  const p = useProgress();
  const mounted = useMounted();

  const [pickTab, setPickTab] = useState<PickTab>('popular');
  const [pathGroup, setPathGroup] = useState<PathGroup>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const PAGE = 12;
  const [shown, setShown] = useState(PAGE);

  const readingTotal = TEXTS.length + MISSIONS.length;
  const listeningTotal = DIALOGUES.length + EAR.length + LISTENING.length;
  const practiceTotal = readingTotal + listeningTotal + DICTATIONS.length;

  const starterPicks = useMemo<Record<PickTab, CourseMeta[]>>(() => {
    const pick = (ids: string[]) => ids.map(id => courseById(id)).filter((c): c is CourseMeta => Boolean(c));
    return {
      popular: pick(['first-steps', 'travel-french', 'present-tense', 'tcf-listening']),
      beginner: pick(['first-steps', 'numbers-time', 'everyday-life', 'food-shopping']),
      exams: pick(['tcf-listening', 'tcf-speaking', 'tef-listening', 'delf-b2']),
      speaking: pick(['survival-dialogues', 'spoken-french', 'pro-emails', 'job-interview']),
    };
  }, []);

  const list = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return COURSES.filter(c => (level === 'all' || c.levels.includes(level)) && (cat === 'all' || c.category === cat) && words.every(w => {
      const catName = tx(CATEGORIES.find(x => x.id === c.category)!.name, lang);
      const hay = norm(`${tx(c.title, lang)} ${tx(c.subtitle, lang)} ${catName} ${c.level}`);
      return hay.includes(w);
    }));
  }, [level, q, lang, cat]);

  useEffect(() => { setShown(PAGE); }, [level, q, cat]);

  const last = mounted ? p.last : undefined;
  const beginnerCat = CATEGORIES.find(c => c.id === 'beginner')!;
  const tcfCat = CATEGORIES.find(c => c.id === 'tcf')!;
  const visibleCount = Math.min(list.length, shown);
  const remaining = list.length - visibleCount;

  const goals = [
    {
      title: fr ? 'Débuter de zéro' : 'Start from scratch',
      badge: 'A1 – A2',
      desc: fr ? 'Saluer, compter, commander au café et réussir vos premières vraies conversations.' : 'Greet people, count, order at a café and hold your very first real conversations.',
      cta: fr ? 'Parcours débutant' : 'Beginner path',
      to: categoryPath(beginnerCat, lang),
      image: 'scene-greetings',
      icon: <RocketOutlined />,
    },
    {
      title: fr ? 'Réussir le TCF / TEF' : 'Pass TCF & TEF Canada',
      badge: 'A1 – C2 · NCLC',
      desc: fr ? 'Test adaptatif + cours par compétence calés sur les épreuves d’immigration.' : 'Adaptive test + skill-by-skill courses built for Express Entry & Québec.',
      cta: fr ? 'Préparer mon examen' : 'Prep my exam',
      to: categoryPath(tcfCat, lang),
      image: 'cat-tcf',
      icon: <TrophyOutlined />,
    },
    {
      title: fr ? 'Écoute & Lecture' : 'Listening & Reading',
      badge: fr ? `${practiceTotal} activités` : `${practiceTotal} activities`,
      desc: fr ? 'Dialogues de la vraie vie, entraînement de l’oreille et textes lus par des natifs.' : 'Everyday dialogues, ear training and real French texts read aloud by natives.',
      cta: fr ? 'Ouvrir l’atelier' : 'Open studio',
      to: practicePath(lang),
      image: 'cat-listening',
      icon: <CustomerServiceOutlined />,
    },
    {
      title: fr ? 'Pratiquer en jouant' : 'Learn by playing',
      badge: fr ? `${GAMES.length} jeux · 3 min` : `${GAMES.length} games · 3 min`,
      desc: fr ? 'Histoire interactive, Mot du jour, Le ou la ? et Loto des nombres sans pression.' : 'Interactive story, Daily Word, Gender Blitz and Number Bingo in 3 minutes.',
      cta: fr ? 'Jouer maintenant' : 'Play now',
      to: gamesPath(lang),
      image: 'games-hero',
      icon: <PlayCircleFilled />,
    },
  ];

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
      {/* ── 1. Flagship Editorial Hero + Interactive Visual Stage ── */}
      <section className="hx-hero" aria-labelledby="lx-hub-title">
        <div className="lp-wrap hx-hero-grid">
          <div className="hx-hero-copy">
            <div className="hx-hero-kicker">
              <p className="lp-eyebrow">{h.eyebrow}</p>
              <span className="hx-free-pill">
                <CheckCircleFilled aria-hidden /> {fr ? '100 % gratuit · Sans compte' : '100% free · No sign-up'}
              </span>
            </div>

            <h1 id="lx-hub-title">{h.title[0]} <em>{h.title[1]}</em></h1>
            <p className="hx-hero-sub">{h.sub}</p>

            <div className="hx-hero-ctas">
              <Link to={placementPath(lang)} className="lp-btn lp-btn-primary">
                <ThunderboltOutlined /> {h.ctaTest} <ArrowRightOutlined />
              </Link>
              <a href="#courses" className="lp-btn lp-btn-ghost">
                {fr ? `Explorer les ${COURSES.length} cours` : `Explore ${COURSES.length} courses`}
              </a>
            </div>

            <nav className="hx-hero-levels" aria-label={h.startAtLevel}>
              <span>{h.startAtLevel}</span>
              {LEVELS.map(lv => (
                <Link key={lv} to={levelPath(lv, lang)} className={`hx-lvl-pill ${levelBand(lv)}`} title={h.levelNames[lv]}>
                  {lv}
                </Link>
              ))}
            </nav>

            <dl className="hx-hero-stats">
              <div>
                <dt>{COURSES.length}</dt>
                <dd>{fr ? 'cours · 255 leçons' : 'courses · 255 lessons'}</dd>
              </div>
              <div>
                <dt>{practiceTotal}</dt>
                <dd>{fr ? 'activités audio & lecture' : 'audio & reading drills'}</dd>
              </div>
              <div>
                <dt>{GAMES.length}</dt>
                <dd>{fr ? 'jeux interactifs' : 'interactive games'}</dd>
              </div>
            </dl>
          </div>

          {/* Right Column: Layered Editorial Visual Stage + Clickable Parisian Studio Dock */}
          <div className="hx-stage">
            <div className="hx-stage-main">
              <div className="hx-stage-frame">
                <img src={imageUrl('hub-hero')} alt="" width="1200" height="675" fetchPriority="high" />
                {mounted && (
                  <video
                    src="/learn/video/hub.mp4"
                    poster={imageUrl('hub-hero')}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-hidden
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>

              <HeroAudioPill lang={lang} />

              <button
                type="button"
                className="hx-check-pill"
                onClick={() => { chime('right'); speak('un croissant'); }}
              >
                <span className="hx-check-ico" aria-hidden><CheckOutlined /></span>
                <span><b>{fr ? 'Correct !' : 'Correct!'}</b> <span lang="fr">un croissant</span></span>
              </button>
            </div>

            <ul className="hx-stage-dock" aria-label={fr ? 'Accès directs aux ateliers' : 'Quick studio shortcuts'}>
              <li>
                <Link to={readingPath(lang)} className="hx-dock-card">
                  <img src={imageUrl('cat-reading', 640)} alt="" width="640" height="360" decoding="async" />
                  <span className="hx-dock-copy">
                    <strong>{fr ? 'Lecture' : 'Reading'} <ArrowRightOutlined aria-hidden /></strong>
                    <small>{readingTotal} {fr ? 'textes & missions' : 'texts & missions'}</small>
                  </span>
                </Link>
              </li>
              <li>
                <Link to={listeningPath(lang)} className="hx-dock-card">
                  <img src={imageUrl('dialogue-a-la-boulangerie', 640)} alt="" width="640" height="360" decoding="async" />
                  <span className="hx-dock-copy">
                    <strong>{fr ? 'Écoute' : 'Listening'} <ArrowRightOutlined aria-hidden /></strong>
                    <small>{listeningTotal} {fr ? 'audios natifs' : 'native audios'}</small>
                  </span>
                </Link>
              </li>
              <li>
                <Link to={gamesPath(lang)} className="hx-dock-card">
                  <img src={imageUrl('games-hero', 640)} alt="" width="640" height="360" decoding="async" />
                  <span className="hx-dock-copy">
                    <strong>{fr ? 'Jeux' : 'Games'} <ArrowRightOutlined aria-hidden /></strong>
                    <small>{GAMES.length} {fr ? 'jeux · 3 min' : 'games · 3 min'}</small>
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 2. Resume Strip (Returning Learners) ── */}
      {last && (
        <section className="hx-continue" aria-label={h.continueTitle}>
          <div className="lp-wrap">
            <Link to={last.path} state={AUTOSTART} className="lx-continue-card">
              <span className="lx-continue-k">{h.continueTitle}</span>
              <strong>{last.title}</strong>
              <em>{last.course}</em>
              <span className="lp-btn lp-btn-primary lp-btn-sm">{h.continueCta}<ArrowRightOutlined /></span>
            </Link>
          </div>
        </section>
      )}

      {/* ── 3. Goal-First Entry Dock ("Choose your starting point") ── */}
      <section className="hx-sec" aria-labelledby="hx-goals-title">
        <div className="lp-wrap">
          <header className="hx-sec-head">
            <div>
              <p className="lp-eyebrow">{fr ? 'Votre objectif' : 'Your goal'}</p>
              <h2 id="hx-goals-title">{fr ? 'Choisissez votre point de départ' : 'Pick your starting point'}</h2>
            </div>
            <p className="hx-sec-head-sub">
              {fr
                ? 'Que vous partiez de zéro, visiez le NCLC 7 ou vouliez entraîner votre oreille, commencez au bon endroit en un clic.'
                : 'Whether you start from zero, aim for CLB 7 or want to train your ear, jump straight into the right track.'}
            </p>
          </header>

          <ul className="hx-goals">
            {goals.map(g => (
              <li key={g.title}>
                <Link to={g.to} className="hx-goal">
                  <div className="hx-goal-img">
                    <img src={imageUrl(g.image, 640)} alt="" loading="lazy" decoding="async" width="640" height="360" />
                    <span className="hx-goal-pill">{g.badge}</span>
                  </div>
                  <div className="hx-goal-body">
                    <h3>{g.icon} {g.title}</h3>
                    <p>{g.desc}</p>
                    <span className="hx-goal-foot">{g.cta} <ArrowRightOutlined aria-hidden /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 4. Interactive 3-Challenge Micro-Lesson ("Experience the method in 30s") ── */}
      <section className="hx-sec lp-tint" aria-labelledby="lx-try-title">
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

      {/* ── 5. Curated Starter Picks with Live Audience Tabs ── */}
      <section className="hx-sec" aria-labelledby="lx-pop-title">
        <div className="lp-wrap">
          <header className="hx-sec-head">
            <div>
              <p className="lp-eyebrow">{h.popularEyebrow}</p>
              <h2 id="lx-pop-title">{h.popularTitle}</h2>
            </div>
            <div className="hx-tabs" role="tablist" aria-label={fr ? 'Sélections de cours' : 'Curated course picks'}>
              {([
                ['popular', fr ? 'Les plus suivis' : 'Most popular'],
                ['beginner', fr ? 'Débuter A1–A2' : 'Beginners'],
                ['exams', fr ? 'TCF · TEF · DELF' : 'Exams'],
                ['speaking', fr ? 'Oral & Pro' : 'Speaking & Work'],
              ] as [PickTab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={pickTab === id}
                  className={pickTab === id ? 'is-on' : ''}
                  onClick={() => setPickTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          <ul className="hx-picks-grid">
            {starterPicks[pickTab].map(c => (
              <li key={c.id}><CourseCard course={c} lang={lang} compact /></li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 6. Dark Navy Practice Studio Showcase + Compact Games Arcade ── */}
      <section className="hx-sec lp-tint" aria-labelledby="hx-practice-title">
        <div className="lp-wrap">
          <aside className="hx-practice-panel">
            <div className="hx-practice-flag" aria-hidden><i /><i /><i /></div>
            <div className="hx-practice-copy">
              <p className="rx-promo-k"><span className="rx-new">{pc.isNew}</span>{pc.practice.promoEyebrow}</p>
              <h2 id="hx-practice-title">{pc.practice.promoTitle[0]} <em>{pc.practice.promoTitle[1]}</em></h2>
              <p>{pc.practice.promo}</p>
              <Link to={practicePath(lang)} className="lp-btn lp-btn-light">
                {pc.practice.promoCta} <ArrowRightOutlined />
              </Link>
              <div className="hx-practice-soon">
                <Link to={dictationPath(lang)} style={{ color: '#9ec0ff', fontWeight: 750 }}>
                  {fr ? 'Nouveau : Atelier de dictée →' : 'New: Dictation studio →'}
                </Link>
                <span>·</span>
                <strong>{pc.soon}</strong>
                <span>{fr ? 'Grammaire · Vocabulaire' : 'Grammar · Vocabulary'}</span>
              </div>
            </div>

            <div className="hx-practice-studios">
              <div className="hx-studio-mini">
                <Link to={readingPath(lang)} className="hx-studio-mini-img" tabIndex={-1} aria-hidden="true">
                  <img src={imageUrl('cat-reading', 640)} alt="" loading="lazy" decoding="async" width="640" height="360" />
                  <span className="hx-studio-mini-badge">{readingTotal} {fr ? 'activités · A1–C1' : 'activities · A1–C1'}</span>
                </Link>
                <div className="hx-studio-mini-body">
                  <Link to={readingPath(lang)}>
                    <span><ReadOutlined /> {fr ? 'Atelier de lecture' : 'Reading studio'}</span>
                    <ArrowRightOutlined aria-hidden />
                  </Link>
                  <div className="hx-studio-chips">
                    <Link to={`${readingPath(lang)}#texts`}>{fr ? 'Textes audio' : 'Audio texts'} <b>{TEXTS.length}</b></Link>
                    <Link to={`${readingPath(lang)}#missions`}>{fr ? 'Missions' : 'Missions'} <b>{MISSIONS.length}</b></Link>
                  </div>
                </div>
              </div>

              <div className="hx-studio-mini">
                <Link to={listeningPath(lang)} className="hx-studio-mini-img" tabIndex={-1} aria-hidden="true">
                  <img src={imageUrl('cat-listening', 640)} alt="" loading="lazy" decoding="async" width="640" height="360" />
                  <span className="hx-studio-mini-badge">{listeningTotal} {fr ? 'activités · A1–C2' : 'activities · A1–C2'}</span>
                </Link>
                <div className="hx-studio-mini-body">
                  <Link to={listeningPath(lang)}>
                    <span><CustomerServiceOutlined /> {fr ? 'Atelier d’écoute' : 'Listening studio'}</span>
                    <ArrowRightOutlined aria-hidden />
                  </Link>
                  <div className="hx-studio-chips">
                    <Link to={`${listeningPath(lang)}#dialogues`}><CommentOutlined /> Dialogues <b>{DIALOGUES.length}</b></Link>
                    <Link to={`${listeningPath(lang)}#ear`}><AudioOutlined /> {fr ? 'Oreille' : 'Ear'} <b>{EAR.length}</b></Link>
                    <Link to={`${listeningPath(lang)}#documents`}><CompassOutlined /> Docs <b>{LISTENING.length}</b></Link>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Compact 5-Game Arcade */}
          <div className="hx-games-band" aria-labelledby="lx-games-title">
            <header className="hx-sec-head">
              <div>
                <p className="lp-eyebrow">{G[lang].hubEyebrow}</p>
                <h2 id="lx-games-title">{G[lang].hubTitle.join(' ')}</h2>
              </div>
              <Link to={gamesPath(lang)} className="lp-btn lp-btn-ghost lp-btn-sm">
                {G[lang].backToGames} <ArrowRightOutlined />
              </Link>
            </header>
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

      {/* ── 7. 11 Structured Learning Paths ── */}
      <section className="hx-sec" id="paths" aria-labelledby="lx-paths-title">
        <div className="lp-wrap">
          <header className="hx-sec-head">
            <div>
              <p className="lp-eyebrow">{h.pathsEyebrow}</p>
              <h2 id="lx-paths-title">{h.pathsTitle}</h2>
            </div>
            <div className="hx-tabs" role="group" aria-label={fr ? 'Filtrer les parcours' : 'Filter learning paths'}>
              {([
                ['all', fr ? `Tous (${CATEGORIES.length})` : `All (${CATEGORIES.length})`],
                ['core', fr ? 'Français général (7)' : 'General French (7)'],
                ['exams', fr ? 'Examens & Carrière (4)' : 'Exams & Career (4)'],
              ] as [PathGroup, string][]).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={pathGroup === id}
                  className={pathGroup === id ? 'is-on' : ''}
                  onClick={() => setPathGroup(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          <ul className="hx-paths">
            {CATEGORIES.map(c => {
              const n = COURSES.filter(x => x.category === c.id).length;
              const isExam = EXAM_CAT_IDS.has(c.id);
              const hide = mounted && ((pathGroup === 'core' && isExam) || (pathGroup === 'exams' && !isExam));
              return (
                <li key={c.id} hidden={hide || undefined}>
                  <Link to={categoryPath(c, lang)} className="hx-path">
                    <div className="hx-path-img">
                      <img src={imageUrl(c.image, 640)} alt="" loading="lazy" decoding="async" width="640" height="360" />
                      <span className="hx-path-tag">{tx(c.tag, lang)}</span>
                    </div>
                    <div className="hx-path-body">
                      <h3>{tx(c.name, lang)}</h3>
                      <p>{tx(c.tagline, lang)}</p>
                      <span className="hx-path-foot">
                        <b>{ui.courses(n)}</b>
                        <span className="hx-path-arrow" aria-hidden><ArrowRightOutlined /></span>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── 8. CEFR A1 → C2 Staircase + Integrated Placement Test Banner ── */}
      <section className="hx-sec lp-tint" aria-labelledby="lx-lv-title">
        <div className="lp-wrap">
          <header className="hx-sec-head">
            <div>
              <p className="lp-eyebrow">{h.levelsEyebrow}</p>
              <h2 id="lx-lv-title">{h.levelsTitle}</h2>
            </div>
            <p className="hx-sec-head-sub">{h.levelsSub}</p>
          </header>

          <ul className="hx-cefr">
            {LEVELS.map(lv => (
              <li key={lv}>
                <Link to={levelPath(lv, lang)} className={`hx-cefr-card ${levelBand(lv)}`}>
                  <div className="hx-cefr-top">
                    <LevelChip level={lv} size="sm" />
                    <strong>{tx(LEVEL_COPY[lv].name, lang)}</strong>
                  </div>
                  <p>{tx(LEVEL_COPY[lv].canDo, lang)}</p>
                  <span className="hx-cefr-go">
                    {h.levelCount(coursesAtLevel(lv).length)} <ArrowRightOutlined aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hx-place-banner">
            <figure className="hx-place-img">
              <img src={imageUrl('placement', 640)} alt="" loading="lazy" decoding="async" width="640" height="360" />
            </figure>
            <div className="hx-place-copy">
              <strong>{fr ? 'Vous ne connaissez pas encore votre niveau CECR ?' : 'Not sure of your CEFR level yet?'}</strong>
              <p>
                {fr
                  ? 'Faites notre test adaptatif gratuit en 10 minutes : il évalue compréhension orale, écrite et grammaire, puis vous propose un plan de cours sur mesure.'
                  : 'Take our free 10-minute adaptive test: it checks listening, reading and grammar, then recommends your exact starting courses.'}
              </p>
            </div>
            <Link to={placementPath(lang)} className="lp-btn lp-btn-primary">
              <ThunderboltOutlined /> {fr ? 'Faire le test gratuit' : 'Take free test'} <ArrowRightOutlined />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. Full Interactive Catalogue (Studio Toolbar + Grid/List + Smart Pager) ── */}
      <section className="hx-sec" id="courses" aria-labelledby="lx-all-title">
        <div className="lp-wrap">
          <header className="hx-sec-head">
            <div>
              <p className="lp-eyebrow">{h.allEyebrow}</p>
              <h2 id="lx-all-title">{h.allTitle}</h2>
            </div>
            <span className="lx-cat-count-pill" aria-live="polite">{h.results(list.length)}</span>
          </header>

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

          {list.length ? (
            <>
              {view === 'grid' ? (
                <ul className="hx-cat-grid">
                  {list.slice(0, shown).map(c => (
                    <li key={c.id}><CourseCard course={c} lang={lang} /></li>
                  ))}
                </ul>
              ) : (
                <ul className="hx-cat-list">
                  {list.slice(0, shown).map(c => {
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

              {list.length > PAGE && (
                <div className="rxl-pager">
                  <div className="rxl-pager-status">
                    <span>
                      {fr
                        ? `Affichage de ${visibleCount} sur ${list.length} cours`
                        : `Showing ${visibleCount} of ${list.length} courses`}
                    </span>
                    <i aria-hidden><b style={{ transform: `scaleX(${visibleCount / list.length})` }} /></i>
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
      </section>

      {/* ── 10. Editorial Native Teacher Showcase ── */}
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

      {/* ── 11. Clean FAQ Accordion ── */}
      <section className="hx-sec" aria-labelledby="lx-faq-title">
        <div className="lp-wrap lp-faq-grid">
          <header className="lp-head is-left">
            <p className="lp-eyebrow">{h.faqEyebrow}</p>
            <h2 id="lx-faq-title">{h.faqTitle}</h2>
            <p className="lx-faq-time">
              <ClockCircleOutlined />{' '}
              {fr
                ? `${COURSES.length} cours · 255 leçons · ${practiceTotal} activités · ${GAMES.length} jeux`
                : `${COURSES.length} courses · 255 lessons · ${practiceTotal} activities · ${GAMES.length} games`}
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
