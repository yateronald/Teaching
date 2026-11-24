// /learn/ and /fr/apprendre/: the home of the free French academy, built like
// an online-course platform. A hero with search and a photo collage, the
// learner's « continue » card, four learning paths (picture cards) and the
// starting level, the guided study path itself, rows of courses by category,
// categories and practice studios as picture tiles, levels and games, a
// 30-second mini lesson, the native teachers and the FAQ.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AppstoreOutlined, ArrowRightOutlined, AudioOutlined, BarChartOutlined, BarsOutlined, BookOutlined,
  CheckCircleFilled, CheckOutlined, ClockCircleOutlined, CloseOutlined,
  CompassOutlined, CustomerServiceOutlined, DownOutlined, DragOutlined, EditOutlined,
  FileTextOutlined, PlayCircleFilled, PlayCircleOutlined, ReadOutlined, ReloadOutlined, RocketOutlined,
  SearchOutlined, SoundOutlined, SwapOutlined, ThunderboltOutlined, TrophyOutlined, UpOutlined,
} from '@ant-design/icons';
import { chime, speak, usePlaying } from '../audio';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { absoluteMediaUrl } from '../mediaUrl';
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
import { HeroSearch } from '../components/AcademySearch';
import { StudyRoadmap } from '../components/StudyRoadmap';
import { CountUp, Reveal } from '../components/Reveal';
import { CourseRow } from '../components/CourseRow';
import { countTotalCompleted, setStudyGoal, setStudyLevel, setStudyPath, useActivitySnapshot, useStudyPath } from '../studyPath/activityStore';
import { TOTAL_ACADEMY_ITEMS, buildStudyPlan, levelActivityStats } from '../studyPath/builder';
import { GOALS, goalById } from '../studyPath/copy';
import type { StudyGoalId } from '../studyPath/types';
import { courseTier } from '../access';
import { openPremiumModal } from '../account/premiumModal';
import { LockActionPill, PremiumInfoWidget } from '../account/PremiumWidget';
import { freeForAllCopy, isTierLocked, useAccount } from '../account/store';
import '../games/games.css';
import '../practice/practice.css';
import './hub.css';
import './home.css';
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


const levelBand = (lv: Level) => (lv === 'A1' || lv === 'A2' ? 'is-a' : lv === 'B1' || lv === 'B2' ? 'is-b' : 'is-c');
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function HeroNativePill({ lang }: { lang: Lang }) {
  const playing = usePlaying(HERO_PHRASE);
  return (
    <button
      type="button"
      className={`ah-pill ah-pill-btn${playing ? ' is-playing' : ''}`}
      onClick={() => speak(HERO_PHRASE)}
      aria-label={lang === 'fr' ? `Écouter une voix native : ${HERO_PHRASE}` : `Listen to native French: ${HERO_PHRASE}`}
    >
      <span className="ah-pill-ico is-blue" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </span>
      <span className="ah-pill-copy">
        <strong>{lang === 'fr' ? 'Apprenez avec des natifs' : 'Learn with native speakers'}</strong>
        {playing && <small className="ah-pill-playing" lang="fr">« Je voudrais un café… »</small>}
      </span>
      <span className="ah-pill-wave" aria-hidden><u /><u /><u /></span>
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

/** The full catalogue: level, category and text filters, grid or list. */
function Catalogue({ lang }: { lang: Lang }) {
  const fr = lang === 'fr';
  const ui = UI[lang];
  const h = ui.hub;
  const account = useAccount();
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [cat, setCat] = useState<string>('all');
  const [q, setQ] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const PAGE = 8;
  const [shown, setShown] = useState(PAGE);
  const filtered = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return COURSES.filter(c => (level === 'all' || c.levels.includes(level)) && (cat === 'all' || c.category === cat) && words.every(w => {
      const catName = tx(CATEGORIES.find(x => x.id === c.category)!.name, lang);
      return norm(`${tx(c.title, lang)} ${tx(c.subtitle, lang)} ${catName} ${c.level}`).includes(w);
    }));
  }, [level, q, lang, cat]);
  useEffect(() => { setShown(PAGE); }, [level, q, cat]);
  const visible = Math.min(filtered.length, shown);
  const remaining = filtered.length - visible;
  return (
    <div className="ah-catalogue">
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
            <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={h.search} aria-label={h.search} />
            {q && <button type="button" onClick={() => setQ('')} aria-label={fr ? 'Effacer' : 'Clear'}><CloseOutlined /></button>}
          </label>
          <div className="rxl-view-toggle" role="group" aria-label={fr ? 'Mode d’affichage' : 'Display mode'}>
            <button type="button" className={view === 'grid' ? 'is-on' : ''} aria-pressed={view === 'grid'} onClick={() => setView('grid')}><AppstoreOutlined /> {fr ? 'Grille' : 'Grid'}</button>
            <button type="button" className={view === 'list' ? 'is-on' : ''} aria-pressed={view === 'list'} onClick={() => setView('list')}><BarsOutlined /> {fr ? 'Liste' : 'List'}</button>
          </div>
        </div>
      </div>
      <div className="hx-cat-cats" role="group" aria-label={h.pathsEyebrow}>
        <button type="button" className={cat === 'all' ? 'is-on' : ''} onClick={() => setCat('all')} aria-pressed={cat === 'all'}>{fr ? 'Tous les thèmes' : 'All topics'}</button>
        {CATEGORIES.map(c => (
          <button key={c.id} type="button" className={cat === c.id ? 'is-on' : ''} onClick={() => setCat(c.id)} aria-pressed={cat === c.id}>{tx(c.name, lang)}</button>
        ))}
      </div>
      <p className="ah-catalogue-count" aria-live="polite">{h.results(filtered.length)}</p>
      {filtered.length ? (
        <>
          {view === 'grid' ? (
            <ul className="ah-grid">
              {filtered.slice(0, shown).map(c => <li key={c.id}><CourseCard course={c} lang={lang} /></li>)}
            </ul>
          ) : (
            <ul className="hx-cat-list">
              {filtered.slice(0, shown).map(c => {
                const catObj = CATEGORIES.find(x => x.id === c.category)!;
                const tier = courseTier(c.id);
                const locked = isTierLocked(account, tier);
                const title = tx(c.title, lang);
                const href = coursePath(c, lang);
                const onOpenModal = (e: React.MouseEvent) => {
                  if (!locked) return;
                  e.preventDefault();
                  openPremiumModal({ title, tier, kind: 'course', level: c.level, to: href });
                };
                return (
                  <li key={c.id}>
                    <article className={`hx-list-row${locked ? ' ax-locked-card' : ''}`}>
                      <div className={locked ? 'ax-locked-media' : undefined} style={locked ? { borderRadius: 10 } : undefined}>
                        <img src={imageUrl(c.image, 640)} alt="" loading="lazy" decoding="async" width="224" height="140" />
                      </div>
                      <div className={`hx-list-body${locked ? ' ax-locked-copy' : ''}`}>
                        <div className="hx-list-top"><LevelChip level={c.level} size="sm" /><span className="hx-list-cat">{tx(catObj.name, lang)}</span></div>
                        <h3><Link to={href} onClick={onOpenModal} className="lx-stretch">{title}</Link></h3>
                        <div className="hx-list-meta">
                          <span><ReadOutlined /> {ui.lessons(c.lessonCount)}</span>
                          <span><ClockCircleOutlined /> {ui.minutes(c.minutes)}</span>
                        </div>
                      </div>
                      {locked ? (
                        <button type="button" onClick={onOpenModal} style={{ border: 'none', background: 'transparent', padding: 0, position: 'relative', zIndex: 2 }}>
                          <LockActionPill lang={lang} tier={tier} compact />
                        </button>
                      ) : (
                        <Link to={href} state={AUTOSTART} className="lx-cc-start"><PlayCircleFilled /> {ui.start}</Link>
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
          {filtered.length > PAGE && (
            <div className="rxl-pager">
              <div className="rxl-pager-status">
                <span>{fr ? `Affichage de ${visible} sur ${filtered.length} cours` : `Showing ${visible} of ${filtered.length} courses`}</span>
                <i aria-hidden><b style={{ transform: `scaleX(${visible / filtered.length})` }} /></i>
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
          <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => { setLevel('all'); setCat('all'); setQ(''); }}>
            {fr ? 'Réinitialiser les filtres' : 'Reset filters'}
          </button>
        </div>
      )}
    </div>
  );
}

const STUDIOS = [
  { id: 'reading', image: 'cat-reading', icon: <ReadOutlined /> },
  { id: 'listening', image: 'cat-listening', icon: <CustomerServiceOutlined /> },
  { id: 'dictation', image: 'cat-spelling', icon: <EditOutlined /> },
] as const;

export default function HubPage({ lang }: { lang: Lang }) {
  const freeAll = freeForAllCopy(useAccount());
  const fr = lang === 'fr';
  const ui = UI[lang];
  const h = ui.hub;
  const { openDemo } = useDemo();
  const mounted = useMounted();
  const saved = useStudyPath();
  const snap = useActivitySnapshot();

  const activeGoal = mounted ? saved.goal : 'complete';
  const activeLevel = mounted ? saved.level : 'A1';
  const plan = useMemo(() => buildStudyPlan(activeGoal, activeLevel, lang), [activeGoal, activeLevel, lang]);
  const levelStats = useMemo(() => LEVELS.map(lv => levelActivityStats(lv)), []);
  // Returning learners who already chose a path see it summed up; they can reopen the picker.
  const [editPath, setEditPath] = useState(false);
  const pathFolded = mounted && saved.picked && !editPath;

  const readingTotal = TEXTS.length + MISSIONS.length;
  const listeningTotal = DIALOGUES.length + EAR.length + LISTENING.length;
  const practiceTotal = readingTotal + listeningTotal + DICTATIONS.length;
  const lessonsTotal = COURSES.reduce((n, c) => n + c.lessonCount, 0);

  const last = mounted ? snap.progress.last : undefined;
  const lastCourse = last ? COURSES.find(c => tx(c.title, lang) === last.course) : undefined;
  const doneCount = mounted ? countTotalCompleted(snap).total : 0;

  const popularCourses = useMemo(() => [...COURSES].sort((a, b) => Number(!!b.popular) - Number(!!a.popular)).slice(0, 14), []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const showPath = () => { setStudyPath(activeGoal, activeLevel, true); setEditPath(false); scrollTo('roadmap'); };
  const advance = (next: Level) => { setStudyPath(activeGoal, next, true); scrollTo('roadmap'); };
  const studioCopy = {
    reading: { name: fr ? 'Atelier de lecture' : 'Reading Studio', desc: fr ? 'Textes lus par des natifs, mots cliquables et missions de lecture.' : 'Native-read texts, tap-to-translate words and reading missions.', count: readingTotal, to: readingPath(lang) },
    listening: { name: fr ? 'Atelier d’écoute' : 'Listening Studio', desc: fr ? 'Dialogues à deux voix, entraînement de l’oreille et documents authentiques.' : 'Two-voice dialogues, ear training and authentic documents.', count: listeningTotal, to: listeningPath(lang) },
    dictation: { name: fr ? 'Atelier de dictée' : 'Dictation Studio', desc: fr ? 'Récits, homophones, verbes et défis d’examen, avec deux voix natives.' : 'Stories, homophones, verbs and exam challenges, with two native voices.', count: DICTATIONS.length, to: dictationPath(lang) },
  };
  const catLink = (id: string) => {
    const cat = CATEGORIES.find(c => c.id === id);
    return cat ? categoryPath(cat, lang) : hubPath(lang);
  };
  const topicChips = [
    { label: fr ? 'Français débutant' : 'Beginner French', icon: <BarChartOutlined aria-hidden />, to: catLink('beginner') },
    { label: fr ? 'Grammaire' : 'Grammar', icon: <FileTextOutlined aria-hidden />, to: catLink('grammar') },
    { label: fr ? 'Conjugaison' : 'Conjugation', icon: <SwapOutlined aria-hidden />, to: catLink('conjugation') },
    { label: fr ? 'Verbes' : 'French Verbs', icon: <BookOutlined aria-hidden />, to: catLink('verbs') },
    { label: fr ? 'Écoute' : 'Listening', icon: <CustomerServiceOutlined aria-hidden />, to: listeningPath(lang) },
    { label: fr ? 'Lecture' : 'Reading', icon: <ReadOutlined aria-hidden />, to: readingPath(lang) },
    { label: fr ? 'Dictée' : 'Spelling', icon: <EditOutlined aria-hidden />, to: dictationPath(lang) },
    { label: fr ? 'Conversation' : 'Speaking', icon: <AudioOutlined aria-hidden />, to: catLink('conversation') },
    { label: fr ? 'Prépa TEF / TCF' : 'Exam Prep (TEF/TCF)', icon: <TrophyOutlined aria-hidden />, to: catLink('tcf') },
  ];

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: hubPath('en'), fr: hubPath('fr') }}
      seo={{ title: h.metaTitle, description: h.metaDescription, path: hubPath(lang), jsonLd: hubJsonLd(lang), image: absoluteMediaUrl(imageUrl('hub-hero')) }}
    >
      {/* ── Hero: search, topics, arched photo & floating pillars ── */}
      <section className="ah-hero" aria-labelledby="lx-hub-title">
        <div className="ah-hero-glow" aria-hidden />
        <div className="ah-hero-swoosh-bg" aria-hidden />
        <div className="lp-wrap ah-hero-grid">
          <div className="ah-hero-copy">
            <p className="ah-eyebrow">
              <span className="ah-tricolor" aria-hidden><i /><i /><i /></span>
              <span>{freeAll ? (fr ? 'Plateforme gratuite – A1 à C2' : 'Free French Platform – A1 to C2') : (fr ? 'Plateforme de français – A1 à C2' : 'French Learning Platform – A1 to C2')}</span>
            </p>
            <h1 id="lx-hub-title">
              {fr
                ? <>Apprenez le français pas à pas, avec des <span className="ah-accent">voix natives.<svg className="ah-swoosh" viewBox="0 0 220 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10.5C58 3.2 152 1.8 217 6.8" fill="none" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" /></svg></span></>
                : <>Learn French step by step, with <span className="ah-accent">native voices.<svg className="ah-swoosh" viewBox="0 0 220 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10.5C58 3.2 152 1.8 217 6.8" fill="none" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" /></svg></span></>}
            </h1>
            <p className="ah-lead">
              {fr
                ? `${COURSES.length} cours guidés, ${practiceTotal} ateliers pratiques et un parcours clair, de vos premiers mots à l’aisance.`
                : `${COURSES.length} guided courses, ${practiceTotal} practice labs and one clear path from your first words to fluency.`}
            </p>
            <HeroSearch lang={lang} />
            <div className="ah-topics" aria-label={fr ? 'Sujets populaires' : 'Popular topics'}>
              {topicChips.map(t => (
                <Link key={t.label} to={t.to}>{t.icon}<span>{t.label}</span></Link>
              ))}
            </div>
            <div className="ah-hero-ctas">
              <button type="button" className="lp-btn lp-btn-primary lp-btn-lg ah-pill-btn ah-cta-navy" onClick={() => scrollTo('paths')}>
                {fr ? 'Explorer nos programmes' : 'Explore our programs'} <ArrowRightOutlined />
              </button>
              <Link to={placementPath(lang)} className="lp-btn lp-btn-ghost lp-btn-lg ah-pill-btn ah-cta-light">
                <PlayCircleOutlined aria-hidden /> {fr ? 'Trouver mon niveau' : 'Find my level'}
              </Link>
            </div>
          </div>

          <div className="ah-hero-art">
            <div className="ah-visual-stage">
              <div className="ah-arch-accent-blue" aria-hidden />
              <div className="ah-arch-accent-red" aria-hidden />
              <figure className="ah-photo-arch">
                <img
                  src={imageUrl('hub-hero', 1200)}
                  srcSet={`${imageUrl('hub-hero', 640)} 640w, ${imageUrl('hub-hero', 1200)} 1200w`}
                  sizes="(max-width: 900px) calc(100vw - 36px), 620px"
                  alt={fr ? 'Apprenante souriante avec casque audio et livres de français devant la tour Eiffel' : 'Smiling French learner with headphones, silver laptop and A1–C2 French books by a sunlit Paris window'}
                  width="1200"
                  height="896"
                  fetchPriority="high"
                />
              </figure>

              <div className="ah-pills">
                <div className="ah-pill">
                  <span className="ah-pill-ico is-blue" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                      <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
                    </svg>
                  </span>
                  <span className="ah-pill-copy">
                    <strong>{fr ? 'Cours structurés' : 'Structured courses'}</strong>
                  </span>
                </div>

                <div className="ah-pill">
                  <span className="ah-pill-ico is-red" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                    </svg>
                  </span>
                  <span className="ah-pill-copy">
                    <strong>{fr ? 'Préparation examens' : 'Exam preparation'}</strong>
                    <small>(TEF / TCF / Canada)</small>
                  </span>
                </div>

                <HeroNativePill lang={lang} />

                <div className="ah-pill">
                  <span className="ah-pill-ico is-green" aria-hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <path d="m7 14 4-4 4 3 5-6" />
                      <path d="M17 7h3v3" />
                    </svg>
                  </span>
                  <span className="ah-pill-copy">
                    <strong>{fr ? 'Suivez votre progression' : 'Track your progress'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lp-wrap">
          <ul className="ah-stats">
            <li>
              <span className="ah-stat-ico" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                  <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
                  <path d="M22 10v6" />
                </svg>
              </span>
              <span className="ah-stat-copy">
                <b><CountUp value={COURSES.length} /></b>
                <span>{fr ? 'Cours guidés' : 'Guided courses'}</span>
              </span>
            </li>
            <li>
              <span className="ah-stat-ico" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </span>
              <span className="ah-stat-copy">
                <b><CountUp value={lessonsTotal} /></b>
                <span>{fr ? 'Leçons interactives' : 'Interactive lessons'}</span>
              </span>
            </li>
            <li>
              <span className="ah-stat-ico" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
                </svg>
              </span>
              <span className="ah-stat-copy">
                <b><CountUp value={practiceTotal} /></b>
                <span>{fr ? 'Ateliers pratiques' : 'Practice labs'}</span>
              </span>
            </li>
            <li>
              <span className="ah-stat-ico" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 2 10 5-10 5L2 7l10-5Z" />
                  <path d="m2 12 10 5 10-5" />
                  <path d="m2 17 10 5 10-5" />
                </svg>
              </span>
              <span className="ah-stat-copy">
                <b><CountUp value={TOTAL_ACADEMY_ITEMS} /></b>
                <span>{fr ? 'Activités au total' : 'Activities in all'}</span>
              </span>
            </li>
            <li>
              <span className="ah-stat-ico" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span className="ah-stat-copy">
                <b>{fr ? '3 000+' : '3,000+'}</b>
                <span>{fr ? 'Apprenants actifs' : 'Active learners'}</span>
              </span>
            </li>
          </ul>
        </div>
      </section>

      <div className="lp-wrap">
        <PremiumInfoWidget lang={lang} variant="banner" />
      </div>

      {/* ── Continue learning (returning learners) ── */}
      {last && (
        <section className="ah-continue" aria-label={fr ? 'Reprendre' : 'Continue learning'}>
          <div className="lp-wrap">
            <div className="ah-continue-card">
              <img src={imageUrl(lastCourse?.image ?? 'hub-hero', 640)} alt="" width="640" height="360" />
              <div className="ah-continue-copy">
                <p>{fr ? 'Reprendre là où vous en étiez' : 'Pick up where you left off'}</p>
                <h2>{last.title}</h2>
                <span>{last.course}{doneCount > 0 && <> · {fr ? `${doneCount} activités terminées` : `${doneCount} activities completed`}</>}</span>
              </div>
              <Link to={last.path} state={AUTOSTART} className="lp-btn lp-btn-primary"><PlayCircleFilled /> {fr ? 'Reprendre' : 'Resume'}</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Learning paths: four goals as picture cards, then the starting level ── */}
      {/* Learners who already chose a path see a one-line summary instead (pathFolded). */}
      <section className={`ah-sec${pathFolded ? ' is-folded' : ''}`} id="paths" aria-labelledby="ah-paths-title">
        <div className="lp-wrap">
          {pathFolded ? (
            <div className="ah-mypath">
              <img src={imageUrl(goalById(activeGoal).image, 640)} alt="" width="640" height="360" loading="lazy" />
              <div className="ah-mypath-copy">
                <p>{fr ? 'Votre parcours' : 'Your learning path'}</p>
                <h2 id="ah-paths-title">{tx(goalById(activeGoal).title, lang)}</h2>
                <span className={`ah-mypath-lv ${levelBand(activeLevel)}`}>
                  <b>{activeLevel}</b> {tx(LEVEL_COPY[activeLevel].name, lang)} · {plan.modules.length} modules
                </span>
              </div>
              <div className="ah-mypath-actions">
                <button type="button" className="lp-btn lp-btn-primary" onClick={() => scrollTo('roadmap')}>
                  {fr ? 'Voir mes modules' : 'See my modules'} <ArrowRightOutlined />
                </button>
                <button type="button" className="lp-btn lp-btn-ghost" onClick={() => setEditPath(true)}>
                  <SwapOutlined /> {fr ? 'Changer d’objectif ou de niveau' : 'Change goal or level'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <Reveal className="ah-head">
                <p className="lp-eyebrow">{fr ? 'Étape 1 · Votre objectif' : 'Step 1 · Your goal'}</p>
                <h2 id="ah-paths-title">{fr ? 'Choisissez votre parcours' : 'Choose your learning path'}</h2>
                <p>{fr ? 'Chaque parcours assemble cours, dialogues, lectures et dictées en modules, niveau par niveau.' : 'Each path brings courses, dialogues, reading and dictations together in modules, level by level.'}</p>
              </Reveal>
              <div className="ah-paths" role="radiogroup" aria-label={fr ? 'Votre objectif' : 'Your goal'}>
                {GOALS.map((g, i) => {
                  const on = activeGoal === g.id;
                  return (
                    <Reveal key={g.id} delay={i * 80}>
                      <button type="button" role="radio" aria-checked={on} className={`ah-path${on ? ' is-on' : ''}`} onClick={() => setStudyGoal(g.id, saved.picked)}>
                        <span className="ah-path-img">
                          <img src={imageUrl(g.image, 640)} alt="" loading="lazy" width="640" height="360" />
                          <span className="ah-path-badge">{GOAL_ICON[g.id]} {fr ? 'Parcours' : 'Path'}</span>
                          {on && <span className="ah-path-tick"><CheckCircleFilled /> {fr ? 'Votre parcours' : 'Your path'}</span>}
                        </span>
                        <span className="ah-path-body">
                          <span className="ah-path-k">{tx(g.badge, lang)}</span>
                          <strong>{tx(g.title, lang)}</strong>
                          <span className="ah-path-sub">{tx(g.subtitle, lang)}</span>
                          <span className="ah-path-meta">{fr ? '6 niveaux · À votre rythme · Gratuit' : '6 levels · Self-paced · Free'}</span>
                        </span>
                      </button>
                    </Reveal>
                  );
                })}
              </div>

              <Reveal className="ah-levels-card">
                <div className="ah-levels-head">
                  <div>
                    <p className="lp-eyebrow">{fr ? 'Étape 2 · Votre niveau de départ' : 'Step 2 · Your starting level'}</p>
                    <h3>{fr ? 'Où commencez-vous ?' : 'Where do you start?'}</h3>
                  </div>
                  <Link to={placementPath(lang)} className="ah-test-link"><ThunderboltOutlined /> {fr ? 'Pas sûr ? Test de niveau en 10 min' : 'Not sure? 10-minute level test'} <ArrowRightOutlined /></Link>
                </div>
                <div className="ah-levels" role="radiogroup" aria-label={fr ? 'Niveau de départ' : 'Starting level'}>
                  {levelStats.map(st => {
                    const on = activeLevel === st.level;
                    return (
                      <button key={st.level} type="button" role="radio" aria-checked={on} className={`ah-lv ${levelBand(st.level)}${on ? ' is-on' : ''}`} onClick={() => setStudyLevel(st.level, saved.picked)}>
                        <span className="ah-lv-dot">{st.level}</span>
                        <strong>{tx(LEVEL_COPY[st.level].name, lang)}</strong>
                        <small>{fr ? `${st.total} activités` : `${st.total} activities`}</small>
                      </button>
                    );
                  })}
                </div>
                <div className="ah-levels-foot">
                  <p><CompassOutlined /> {tx(goalById(activeGoal).title, lang)} · {activeLevel} · {tx(LEVEL_COPY[activeLevel].name, lang)}</p>
                  <button type="button" className="lp-btn lp-btn-primary" onClick={showPath}>{fr ? 'Voir mon parcours' : 'Show my path'} <ArrowRightOutlined /></button>
                </div>
              </Reveal>
            </>
          )}
        </div>
      </section>

      {/* ── The guided study path ── */}
      <section className="ah-sec ah-path-sec" id="roadmap" aria-labelledby="ah-roadmap-title">
        <div className="lp-wrap">
          <Reveal className="ah-head">
            <p className="lp-eyebrow">{fr ? 'Étape 3 · Votre programme' : 'Step 3 · Your programme'}</p>
            <h2 id="ah-roadmap-title">{fr ? 'Votre parcours, module par module' : 'Your path, module by module'}</h2>
            <p>{fr ? 'Suivez les modules dans l’ordre : chaque étape est cochée dès que vous la terminez.' : 'Follow the modules in order: each step is ticked as soon as you finish it.'}</p>
          </Reveal>
          <StudyRoadmap lang={lang} plan={plan} mounted={mounted} onAdvanceLevel={advance} showResumeLink={false} showClassroomLink />
        </div>
      </section>

      {/* ── Courses: rows by category, then the full catalogue ── */}
      <section className="ah-sec ah-tint" id="library" aria-labelledby="ah-courses-title">
        <div className="lp-wrap">
          <Reveal className="ah-head is-row">
            <div>
              <p className="lp-eyebrow">{fr ? 'Catalogue' : 'Catalogue'}</p>
              <h2 id="ah-courses-title">{fr ? `Explorez ${COURSES.length} cours gratuits` : `Explore ${COURSES.length} free courses`}</h2>
            </div>
            <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={openAcademySearch}><SearchOutlined /> {fr ? `Rechercher parmi ${TOTAL_ACADEMY_ITEMS} activités` : `Search ${TOTAL_ACADEMY_ITEMS} activities`}</button>
          </Reveal>
          <CourseRow
            lang={lang}
            courses={popularCourses}
            title={fr ? 'Les cours les plus suivis' : 'Most popular courses'}
            sub={fr ? 'Le meilleur point de départ, quel que soit votre niveau.' : 'The best place to start, whatever your level.'}
          />

          <Reveal className="ah-subhead" id="courses">
            <h3>{fr ? 'Tous les cours' : 'All courses'}</h3>
            <p>{fr ? 'Filtrez par niveau, par catégorie ou par mot-clé.' : 'Filter by level, category or keyword.'}</p>
          </Reveal>
          <Catalogue lang={lang} />
        </div>
      </section>

      {/* ── Categories as picture tiles ── */}
      <section className="ah-sec" aria-labelledby="ah-cats-title">
        <div className="lp-wrap">
          <Reveal className="ah-head">
            <p className="lp-eyebrow">{fr ? 'Thèmes' : 'Topics'}</p>
            <h2 id="ah-cats-title">{fr ? 'Explorez par thème' : 'Explore by topic'}</h2>
          </Reveal>
          <ul className="ah-cats">
            {CATEGORIES.map((c, i) => {
              const n = COURSES.filter(x => x.category === c.id).length;
              return (
                <Reveal as="li" key={c.id} delay={(i % 4) * 70}>
                  <Link to={categoryPath(c, lang)} className="ah-cat">
                    <img src={imageUrl(c.image, 640)} alt="" loading="lazy" width="640" height="360" />
                    <span className="ah-cat-copy"><strong>{tx(c.name, lang)}</strong><small>{fr ? `${n} cours` : `${n} courses`}</small></span>
                    <span className="ah-cat-go" aria-hidden><ArrowRightOutlined /></span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Practice studios ── */}
      <section className="ah-sec ah-tint" aria-labelledby="ah-studios-title">
        <div className="lp-wrap">
          <Reveal className="ah-head is-row">
            <div>
              <p className="lp-eyebrow">{fr ? 'Pratique libre' : 'Free practice'}</p>
              <h2 id="ah-studios-title">{fr ? `${practiceTotal} ateliers pour pratiquer` : `${practiceTotal} labs to practise`}</h2>
            </div>
            <Link to={practicePath(lang)} className="lp-btn lp-btn-ghost lp-btn-sm">{fr ? 'Tous les ateliers' : 'All practice labs'} <ArrowRightOutlined /></Link>
          </Reveal>
          <ul className="ah-studios">
            {STUDIOS.map((s, i) => {
              const c = studioCopy[s.id];
              return (
                <Reveal as="li" key={s.id} delay={i * 90}>
                  <Link to={c.to} className="ah-studio">
                    <span className="ah-studio-img"><img src={imageUrl(s.image, 640)} alt="" loading="lazy" width="640" height="360" /></span>
                    <span className="ah-studio-body">
                      <span className="ah-studio-ico" aria-hidden>{s.icon}</span>
                      <strong>{c.name}</strong>
                      <span>{c.desc}</span>
                      <em>{fr ? `${c.count} activités` : `${c.count} activities`} <ArrowRightOutlined aria-hidden /></em>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Levels and games ── */}
      <section className="ah-sec" aria-labelledby="ah-levels-title">
        <div className="lp-wrap">
          <Reveal className="ah-head">
            <p className="lp-eyebrow">{fr ? 'Par niveau' : 'By level'}</p>
            <h2 id="ah-levels-title">{fr ? 'Un espace pour chaque niveau' : 'A classroom for every level'}</h2>
          </Reveal>
          <ul className="ah-lvcards">
            {levelStats.map((st, i) => (
              <Reveal as="li" key={st.level} delay={i * 60}>
                <Link to={levelPath(st.level, lang)} className={`ah-lvcard ${levelBand(st.level)}`}>
                  <span className="ah-lvcard-big" aria-hidden>{st.level}</span>
                  <strong>{tx(LEVEL_COPY[st.level].name, lang)}</strong>
                  <span>{tx(LEVEL_COPY[st.level].canDo, lang)}</span>
                  <em>{fr ? `${st.total} activités` : `${st.total} activities`} <ArrowRightOutlined aria-hidden /></em>
                </Link>
              </Reveal>
            ))}
          </ul>
          <Reveal className="ah-subhead is-row">
            <div>
              <h3>{fr ? 'Jeux · 3 minutes par jour' : 'Games · 3 minutes a day'}</h3>
              <p>{G[lang].hubSub}</p>
            </div>
            <Link to={gamesPath(lang)} className="lp-btn lp-btn-ghost lp-btn-sm">{G[lang].backToGames} <ArrowRightOutlined /></Link>
          </Reveal>
          <ul className="gx-gcards">
            {GAMES.map((x, i) => <li key={x.id} className={i === 0 ? 'is-wide' : ''}><GameCard game={x} lang={lang} wide={i === 0} /></li>)}
          </ul>
        </div>
      </section>

      {/* ── 30-second mini lesson ── */}
      <section className="hx-sec ah-tint" aria-labelledby="lx-try-title">
        <div className="lp-wrap hx-try-grid">
          <Reveal className="hx-try-copy">
            <p className="lp-eyebrow">{h.tryEyebrow}</p>
            <h2 id="lx-try-title">{h.tryTitle}</h2>
            <p>{h.trySub}</p>
            <ul className="hx-pillars">
              {h.activities.map(([t, d], i) => (
                <li key={t}><span aria-hidden>{ACTIVITY_ICONS[i]}</span><div><strong>{t}</strong><p>{d}</p></div></li>
              ))}
            </ul>
          </Reveal>
          <TryItStudio lang={lang} />
        </div>
      </section>

      {/* ── Native teachers ── */}
      <section className="hx-teacher lx-teacher" aria-labelledby="lx-teacher-title">
        <div className="lp-wrap lx-teacher-grid">
          <div>
            <p className="lp-eyebrow is-light">{h.teacherEyebrow}</p>
            <h2 id="lx-teacher-title">{h.teacherTitle}</h2>
            <p>{h.teacherSub}</p>
            <ul>{h.teacherPoints.map(x => <li key={x}><CheckOutlined aria-hidden />{x}</li>)}</ul>
            <button type="button" className="lp-btn lp-btn-light lp-btn-lg" onClick={openDemo}>{ui.demo} <ArrowRightOutlined /></button>
          </div>
          <div className="hx-teacher-img-wrap">
            <figure className="lx-teacher-img"><img src={imageUrl('teacher', 1200)} alt="" loading="lazy" decoding="async" width="1200" height="675" /></figure>
            <span className="hx-teacher-badge"><CheckCircleFilled aria-hidden />{fr ? 'Professeurs natifs certifiés · En ligne ou en présentiel' : 'Certified native teachers · Online or in person'}</span>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hx-sec" aria-labelledby="lx-faq-title">
        <div className="lp-wrap lp-faq-grid">
          <header className="lp-head is-left">
            <p className="lp-eyebrow">{h.faqEyebrow}</p>
            <h2 id="lx-faq-title">{h.faqTitle}</h2>
            <p className="lx-faq-time"><ClockCircleOutlined /> {fr ? `${COURSES.length} cours · ${lessonsTotal} leçons · ${practiceTotal} ateliers · ${GAMES.length} jeux` : `${COURSES.length} courses · ${lessonsTotal} lessons · ${practiceTotal} practice labs · ${GAMES.length} games`}</p>
          </header>
          <div className="lp-faq-list">
            {h.faq.map(([qq, a]) => [qq, (freeAll && h.faqFree[qq]) || a]).map(([qq, a], i) => (
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
