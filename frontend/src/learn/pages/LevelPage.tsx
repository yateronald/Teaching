// Unified CEFR Level Classroom (/learn/level/b2/) & Category-Level Page (/learn/tcf-canada/level-b2/):
// Global level pages offer a Dual-Mode Workspace:
//   1) Guided Study Path (6 mixed-skill modules for this CEFR level across 4 goals)
//   2) All Level Resources (Courses, Dictations, Listening & Dialogues, Reading, TCF/TEF Ladder)
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppstoreOutlined, ArrowRightOutlined, CheckCircleFilled, CheckOutlined,
  ClockCircleOutlined, CompassOutlined, CrownFilled, CustomerServiceOutlined, DownOutlined,
  EditOutlined, LockOutlined, ReadOutlined, UpOutlined,
} from '@ant-design/icons';
import { itemTier, lessonTier } from '../access';
import { openPremiumModal } from '../account/premiumModal';
import { LockActionPill } from '../account/PremiumWidget';
import { freeForAllCopy, isTierLocked, useAccount } from '../account/store';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { absoluteMediaUrl } from '../mediaUrl';
import { coursePath } from '../catalog';
import { getLessons, loadLessons } from '../content/registry';
import { LEVEL_COPY, categoryLevelPath, categoryLevels, coursesAtLevel, levelPath } from '../levels';
import { hubPath, lessonPath, placementPath } from '../paths';
import { TEXTS, textPath } from '../practice/meta';
import { MISSIONS, missionPath } from '../practice/missions';
import { DIALOGUES, dialoguePath } from '../practice/dialogues/meta';
import { EAR, earPath } from '../practice/ear/meta';
import { LISTENING, exercisePath } from '../practice/listening/catalog';
import { DICTATIONS, dictationCoursePath } from '../practice/dictation/catalog';
import { StudyRoadmap } from '../components/StudyRoadmap';
import { setStudyLevel, useStudyPath } from '../studyPath/activityStore';
import { buildStudyPlan, levelActivityStats } from '../studyPath/builder';
import { GOALS, STUDY_COPY } from '../studyPath/copy';
import type { StudyGoalId } from '../studyPath/types';
import { levelJsonLd } from '../schema';
import { CourseCard, Crumbs, LearnShell, LevelChip, TeacherCta, useMounted } from '../shell';
import { LEVELS, tx, type CategoryMeta, type CourseMeta, type Lang, type Lesson, type Level } from '../types';
import { UI } from '../ui';

/** The levelled courses (TCF, TEF) shown on a level page. */
export const ladderCoursesFor = (level: Level, category?: CategoryMeta): CourseMeta[] =>
  coursesAtLevel(level, category?.id).filter(c => c.ladder);

/** Lessons of several courses: synchronous when pre-loaded, else downloaded. */
function useManyLessons(ids: string[]): Record<string, Lesson[]> {
  const initial = () => Object.fromEntries(ids.map(id => [id, getLessons(id)]).filter(([, l]) => l)) as Record<string, Lesson[]>;
  const [map, setMap] = useState<Record<string, Lesson[]>>(initial);
  const key = ids.join(',');
  useEffect(() => {
    let alive = true;
    Promise.all(ids.map(id => loadLessons(id).then(l => [id, l] as const))).then(entries => { if (alive) setMap(Object.fromEntries(entries)); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return map;
}

type BrowseFilter = 'all' | 'courses' | 'dictations' | 'listening' | 'reading' | 'exam';

interface FlatResource {
  id: string;
  tierKey: string;
  tag: string;
  title: string;
  summary: string;
  meta: string;
  to: string;
}

const COURSE_PAGE = 12;

/**
 * A course grid that shows the first dozen cards and a "show more" button.
 * Every card stays in the pre-rendered page (links for search engines);
 * the extra ones are hidden once the page is live.
 */
function PagedCourses({ courses, lang, mounted }: { courses: CourseMeta[]; lang: Lang; mounted: boolean }) {
  const lc = STUDY_COPY[lang].levelPage;
  const [all, setAll] = useState(false);
  const top = useRef<HTMLUListElement>(null);
  const extra = courses.length - COURSE_PAGE;
  const toggle = () => {
    if (all) top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setAll(v => !v);
  };
  return (
    <>
      <ul className="lx-grid" ref={top}>
        {courses.map((c, i) => (
          <li key={c.id} hidden={(mounted && !all && i >= COURSE_PAGE) || undefined}><CourseCard course={c} lang={lang} /></li>
        ))}
      </ul>
      {extra > 0 && (
        <div className="lv-more-row">
          <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" aria-expanded={all} onClick={toggle}>
            {all ? <>{lc.showFewer} <UpOutlined /></> : <>{lc.showMore(extra)} <DownOutlined /></>}
          </button>
        </div>
      )}
    </>
  );
}

export default function LevelPage({ lang, level, category }: { lang: Lang; level: Level; category?: CategoryMeta }) {
  const fr = lang === 'fr';
  const ui = UI[lang];
  const account = useAccount();
  const freeAll = freeForAllCopy(account);
  const t = ui.levelPage;
  const lc = STUDY_COPY[lang].levelPage;
  const copy = LEVEL_COPY[level];
  const levelName = tx(copy.name, lang);
  const catName = category ? tx(category.name, lang) : '';

  const mounted = useMounted();
  const saved = useStudyPath();
  const [mode, setMode] = useState<'path' | 'browse'>('path');
  const [goal, setGoal] = useState<StudyGoalId>('complete');
  const [browseFilter, setBrowseFilter] = useState<BrowseFilter>('all');
  const [showAllDicts, setShowAllDicts] = useState(false);
  const [showAllListen, setShowAllListen] = useState(false);

  // Sync default goal to learner's saved goal once mounted
  useEffect(() => {
    if (mounted) setGoal(saved.goal);
  }, [mounted, saved.goal]);

  // Reset pagination when level changes
  useEffect(() => {
    setShowAllDicts(false);
    setShowAllListen(false);
  }, [level]);

  const ladder = ladderCoursesFor(level, category);
  const courses = coursesAtLevel(level, category?.id).filter(c => !c.ladder);
  const lessonsById = useManyLessons(ladder.map(c => c.id));
  const ladderLessons = ladder
    .map(c => ({ course: c, lesson: lessonsById[c.id]?.find(l => l.level === level) }))
    .filter((x): x is { course: CourseMeta; lesson: Lesson } => !!x.lesson);

  const stats = useMemo(() => levelActivityStats(level), [level]);
  const plan = useMemo(() => buildStudyPlan(goal, level, lang), [goal, level, lang]);

  // All practice resources at this CEFR level (for global level pages)
  const levelDictations = useMemo<FlatResource[]>(() => {
    if (category) return [];
    return DICTATIONS.filter(d => d.level === level).map(d => ({
      id: `d-${d.id}`,
      tierKey: `dictation:${d.id}`,
      tag: tx(d.theme, lang),
      title: d.title,
      summary: tx(d.subtitle, lang),
      meta: `${d.minutes} min`,
      to: dictationCoursePath(d, lang),
    }));
  }, [category, level, lang]);

  const levelListening = useMemo<FlatResource[]>(() => {
    if (category) return [];
    const out: FlatResource[] = [];
    for (const d of DIALOGUES.filter(x => x.level === level)) {
      out.push({
        id: `dlg-${d.id}`,
        tierKey: `dialogue:${d.id}`,
        tag: fr ? 'Dialogue · 2 voix' : 'Dialogue · 2 voices',
        title: d.title,
        summary: tx(d.summary, lang),
        meta: '6 min',
        to: dialoguePath(d, lang),
      });
    }
    for (const e of EAR.filter(x => x.level === level)) {
      out.push({
        id: `ear-${e.id}`,
        tierKey: `ear:${e.id}`,
        tag: fr ? `Oreille · ${tx(e.tag, lang)}` : `Ear lab · ${tx(e.tag, lang)}`,
        title: e.title,
        summary: tx(e.summary, lang),
        meta: `${e.minutes} min`,
        to: earPath(e, lang),
      });
    }
    for (const doc of LISTENING.filter(x => x.level === level)) {
      out.push({
        id: `doc-${doc.id}`,
        tierKey: `doc:${doc.id}`,
        tag: tx(doc.format, lang),
        title: doc.title,
        summary: tx(doc.summary, lang),
        meta: `${doc.count ?? doc.questions.length} Q`,
        to: exercisePath(doc, lang),
      });
    }
    return out;
  }, [category, level, lang, fr]);

  const levelReading = useMemo<FlatResource[]>(() => {
    if (category) return [];
    const out: FlatResource[] = [];
    for (const m of MISSIONS.filter(x => x.level === level)) {
      out.push({
        id: `mis-${m.id}`,
        tierKey: `mission:${m.id}`,
        tag: fr ? 'Mission de lecture' : 'Reading mission',
        title: tx(m.title, lang),
        summary: tx(m.summary, lang),
        meta: `${m.minutes} min`,
        to: missionPath(m, lang),
      });
    }
    for (const txt of TEXTS.filter(x => x.level === level)) {
      out.push({
        id: `txt-${txt.id}`,
        tierKey: `text:${txt.id}`,
        tag: fr ? 'Texte audio' : 'Audio text',
        title: txt.title,
        summary: tx(txt.subtitle, lang),
        meta: `${txt.words} ${fr ? 'mots' : 'words'}`,
        to: textPath(txt, lang),
      });
    }
    return out;
  }, [category, level, lang, fr]);

  const path = category ? categoryLevelPath(category, level, lang) : levelPath(level, lang);
  const alternates = category
    ? { en: categoryLevelPath(category, level, 'en'), fr: categoryLevelPath(category, level, 'fr') }
    : { en: levelPath(level, 'en'), fr: levelPath(level, 'fr') };
  const h1 = category ? t.h1Cat(catName, level) : t.h1(level, levelName);
  const count = category ? ladder.length + courses.length : stats.total;
  const description = `${tx(copy.canDo, lang)} ${t.metaDescription(level, count)}`.slice(0, 300);
  const siblings: { level: Level; to: string }[] = category
    ? categoryLevels(category).map(l => ({ level: l, to: categoryLevelPath(category, l, lang) }))
    : LEVELS.map(l => ({ level: l, to: levelPath(l, lang) }));
  const trail: [string, string][] = [
    [ui.home, lang === 'fr' ? '/fr/' : '/'],
    [ui.learnHome, hubPath(lang)],
    ...(category ? [[catName, categoryPath(category, lang)] as [string, string]] : []),
    [`${fr ? 'Niveau' : 'Level'} ${level}`, path],
  ];
  const items = [
    ...ladderLessons.map(({ course, lesson }) => ({ name: `${tx(lesson.title, lang)} · ${tx(course.title, lang)}`, path: lessonPath(course, lesson, lang) })),
    ...courses.map(c => ({ name: tx(c.title, lang), path: coursePath(c, lang) })),
  ];
  const image = category?.image ?? (courses[0]?.image ?? 'hub-hero');

  const isActiveSavedLevel = mounted && saved.picked && saved.level === level;
  const visibleDicts = showAllDicts ? levelDictations : levelDictations.slice(0, 8);
  const visibleListen = showAllListen ? levelListening : levelListening.slice(0, 8);

  return (
    <LearnShell
      lang={lang}
      alternates={alternates}
      seo={{
        title: category ? t.metaTitleCat(catName, level) : t.metaTitle(level, levelName),
        description,
        path,
        jsonLd: levelJsonLd({ lang, path, name: h1, description, items, trail }),
        image: absoluteMediaUrl(imageUrl(image)),
      }}
    >
      <section className="lx-cat-hero" aria-labelledby="lx-level-title">
        <div className="lp-wrap lx-cat-hero-grid">
          <div>
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], ...(category ? [[catName, categoryPath(category, lang)] as [string, string]] : []), [`${fr ? 'Niveau' : 'Level'} ${level}`]]} />
            <p className="lp-eyebrow">{category ? tx(category.tag, lang) : t.eyebrow}</p>
            <h1 id="lx-level-title">{h1}</h1>
            <p className="lx-hero-sub">{tx(copy.canDo, lang)}</p>
            <p className="lx-cat-facts">
              {category ? (
                <span><ReadOutlined /> {t.items(count)}</span>
              ) : (
                <>
                  <span><ReadOutlined /> {lc.totalActivities(stats.total)}</span>
                  <span><CustomerServiceOutlined /> {stats.listening} {fr ? 'écoutes' : 'listening'}</span>
                  <span><EditOutlined /> {stats.dictations} {fr ? 'dictées' : 'dictations'}</span>
                </>
              )}
              {freeAll && <span><CheckOutlined /> {ui.free} · {ui.noSignup}</span>}
            </p>

            {!category && (
              <div className="lv-hero-actions">
                {isActiveSavedLevel ? (
                  <span className="lv-active-tag">
                    <CheckCircleFilled /> {lc.isActive(level)}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="lp-btn lp-btn-primary lp-btn-sm"
                    onClick={() => setStudyLevel(level, true)}
                  >
                    <CompassOutlined /> {lc.setActive(level)}
                  </button>
                )}
              </div>
            )}

            <nav className="lx-level-nav" aria-label={t.otherLevels}>
              {siblings.map(s => (
                <Link key={s.level} to={s.to} className={s.level === level ? 'is-on' : ''} aria-current={s.level === level ? 'page' : undefined}>{s.level}</Link>
              ))}
            </nav>
          </div>
          <figure className="lx-cat-img"><img src={imageUrl(image)} alt="" width="1200" height="675" fetchPriority="high" /></figure>
        </div>
      </section>

      {/* ── GLOBAL LEVEL CLASSROOM: Dual-Mode (Guided Study Path | All Level Resources) ── */}
      {!category ? (
        <section className="lp-section lx-cat-list" aria-labelledby="lx-level-list">
          <div className="lp-wrap">
            <h2 id="lx-level-list" className="lp-visually-hidden">{h1}</h2>

            <div className="lv-mode-bar">
              <div className="lv-mode-tabs" role="tablist" aria-label={h1}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'path'}
                  className={mode === 'path' ? 'is-on' : ''}
                  onClick={() => setMode('path')}
                >
                  <CompassOutlined /> {lc.tabPath(level)}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'browse'}
                  className={mode === 'browse' ? 'is-on' : ''}
                  onClick={() => setMode('browse')}
                >
                  <AppstoreOutlined /> {lc.tabBrowse(level)} ({stats.total})
                </button>
              </div>

              {mode === 'path' && (
                <div className="lv-goal-pills" role="group" aria-label={lc.goalSwitch}>
                  <span>{lc.goalSwitch}</span>
                  {GOALS.map(g => (
                    <button
                      key={g.id}
                      type="button"
                      className={goal === g.id ? 'is-on' : ''}
                      aria-pressed={goal === g.id}
                      onClick={() => setGoal(g.id)}
                    >
                      {tx(g.shortTitle, lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tab 1: Guided Study Path for this CEFR Level */}
            <div hidden={mounted && mode !== 'path'}>
              <StudyRoadmap
                lang={lang}
                plan={plan}
                mounted={mounted}
                showClassroomLink={false}
              />
            </div>

            {/* Tab 2: Browse ALL Resources at this CEFR Level */}
            <div hidden={mounted && mode !== 'browse'}>
              <div className="lv-sub-filters" role="group" aria-label={lc.tabBrowse(level)}>
                {([
                  ['all', lc.subAll, stats.total],
                  ['courses', lc.subCourses, courses.length],
                  ['dictations', lc.subDictations, levelDictations.length],
                  ['listening', lc.subListening, levelListening.length],
                  ['reading', lc.subReading, levelReading.length],
                  ['exam', lc.subExam, ladder.length],
                ] as [BrowseFilter, string, number][]).filter(([, , n]) => n > 0).map(([id, label, n]) => (
                  <button
                    key={id}
                    type="button"
                    className={browseFilter === id ? 'is-on' : ''}
                    aria-pressed={browseFilter === id}
                    onClick={() => setBrowseFilter(id)}
                  >
                    {label} <span>{n}</span>
                  </button>
                ))}
              </div>

              {(browseFilter === 'all' || browseFilter === 'courses') && courses.length > 0 && (
                <div className="lv-block">
                  <div className="lv-block-head">
                    <h3>{t.coursesTitle(level)} ({courses.length})</h3>
                  </div>
                  <PagedCourses key={level} courses={courses} lang={lang} mounted={mounted} />
                </div>
              )}

              {(browseFilter === 'all' || browseFilter === 'dictations') && levelDictations.length > 0 && (
                <div className="lv-block">
                  <div className="lv-block-head">
                    <h3>{fr ? `Dictées niveau ${level}` : `Level ${level} Dictations`} ({levelDictations.length})</h3>
                  </div>
                  <ul className="lv-resource-grid">
                    {visibleDicts.map(item => {
                      const tier = itemTier(item.tierKey);
                      const locked = isTierLocked(account, tier);
                      return (
                        <li key={item.id}>
                          <Link
                            to={item.to}
                            onClick={e => {
                              if (!locked) return;
                              e.preventDefault();
                              openPremiumModal({ title: item.title, subtitle: item.summary, tier, kind: 'practice', level, to: item.to });
                            }}
                            className={`lv-res-card${locked ? ' ax-locked-card ax-locked-copy' : ''}`}
                          >
                            <div className="lv-res-top">
                              <span className="lv-res-tag">{item.tag}</span>
                              <LevelChip level={level} size="sm" />
                            </div>
                            <strong>{item.title}</strong>
                            <p>{item.summary}</p>
                            <span className="lv-res-foot">
                              <span>{item.meta}</span>
                              {locked ? <LockActionPill lang={lang} tier={tier} compact /> : <ArrowRightOutlined aria-hidden />}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {levelDictations.length > 8 && (
                    <div className="lv-more-row">
                      <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setShowAllDicts(v => !v)}>
                        {showAllDicts ? <>{lc.showFewer} <UpOutlined /></> : <>{lc.showMore(levelDictations.length - 8)} <DownOutlined /></>}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(browseFilter === 'all' || browseFilter === 'listening') && levelListening.length > 0 && (
                <div className="lv-block">
                  <div className="lv-block-head">
                    <h3>{fr ? `Écoute & dialogues ${level}` : `Level ${level} Listening & Dialogues`} ({levelListening.length})</h3>
                  </div>
                  <ul className="lv-resource-grid">
                    {visibleListen.map(item => {
                      const tier = itemTier(item.tierKey);
                      const locked = isTierLocked(account, tier);
                      return (
                        <li key={item.id}>
                          <Link
                            to={item.to}
                            onClick={e => {
                              if (!locked) return;
                              e.preventDefault();
                              openPremiumModal({ title: item.title, subtitle: item.summary, tier, kind: 'practice', level, to: item.to });
                            }}
                            className={`lv-res-card${locked ? ' ax-locked-card ax-locked-copy' : ''}`}
                          >
                            <div className="lv-res-top">
                              <span className="lv-res-tag">{item.tag}</span>
                              <LevelChip level={level} size="sm" />
                            </div>
                            <strong>{item.title}</strong>
                            <p>{item.summary}</p>
                            <span className="lv-res-foot">
                              <span>{item.meta}</span>
                              {locked ? <LockActionPill lang={lang} tier={tier} compact /> : <ArrowRightOutlined aria-hidden />}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {levelListening.length > 8 && (
                    <div className="lv-more-row">
                      <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setShowAllListen(v => !v)}>
                        {showAllListen ? <>{lc.showFewer} <UpOutlined /></> : <>{lc.showMore(levelListening.length - 8)} <DownOutlined /></>}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {(browseFilter === 'all' || browseFilter === 'reading') && levelReading.length > 0 && (
                <div className="lv-block">
                  <div className="lv-block-head">
                    <h3>{fr ? `Lecture & missions ${level}` : `Level ${level} Reading & Missions`} ({levelReading.length})</h3>
                  </div>
                  <ul className="lv-resource-grid">
                    {levelReading.map(item => {
                      const tier = itemTier(item.tierKey);
                      const locked = isTierLocked(account, tier);
                      return (
                        <li key={item.id}>
                          <Link
                            to={item.to}
                            onClick={e => {
                              if (!locked) return;
                              e.preventDefault();
                              openPremiumModal({ title: item.title, subtitle: item.summary, tier, kind: 'practice', level, to: item.to });
                            }}
                            className={`lv-res-card${locked ? ' ax-locked-card ax-locked-copy' : ''}`}
                          >
                            <div className="lv-res-top">
                              <span className="lv-res-tag">{item.tag}</span>
                              <LevelChip level={level} size="sm" />
                            </div>
                            <strong>{item.title}</strong>
                            <p>{item.summary}</p>
                            <span className="lv-res-foot">
                              <span>{item.meta}</span>
                              {locked ? <LockActionPill lang={lang} tier={tier} compact /> : <ArrowRightOutlined aria-hidden />}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {(browseFilter === 'all' || browseFilter === 'exam') && ladder.length > 0 && (
                <div className="lv-block">
                  <div className="lv-block-head">
                    <h3>{t.lessonsTitle(level)}</h3>
                  </div>
                  <p className="lx-ladder-sub">{t.lessonsSub}</p>
                  <ol className="lx-syllabus">
                    {ladderLessons.map(({ course, lesson }) => {
                      const lTier = lessonTier(course.id, lesson);
                      const lLocked = isTierLocked(account, lTier);
                      const href = lessonPath(course, lesson, lang);
                      return (
                        <li key={lesson.id}>
                          <Link
                            to={href}
                            onClick={e => {
                              if (!lLocked) return;
                              e.preventDefault();
                              openPremiumModal({ title: `${tx(course.title, lang)} · ${tx(lesson.title, lang)}`, tier: lTier, kind: 'lesson', level, to: href });
                            }}
                            className={`lx-lesson-row${lLocked ? ' ax-locked-card ax-locked-copy' : ''}`}
                          >
                            <span className="lx-lesson-n">{lLocked ? (lTier === 'premium' ? <CrownFilled style={{ color: '#b7791f' }} /> : <LockOutlined />) : <LevelChip level={level} size="sm" />}</span>
                            <div>
                              <p className="lx-level-from">{t.fromCourse} · {tx(course.title, lang)}</p>
                              <h3>{tx(lesson.title, lang)}</h3>
                              <p>{tx(lesson.summary, lang)}</p>
                              <div className="lx-lesson-meta"><span><ClockCircleOutlined /> {ui.minutes(lesson.minutes)}</span><span>{ui.steps(lesson.steps.length)}</span></div>
                            </div>
                            {lLocked
                              ? <LockActionPill lang={lang} tier={lTier} compact />
                              : <span className="lx-round-arrow" aria-hidden><ArrowRightOutlined /></span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        /* ── CATEGORY-LEVEL PAGE (e.g., /learn/tcf-canada/level-b2/) ── */
        <section className="lp-section lx-cat-list" aria-labelledby="lx-level-list">
          <div className="lp-wrap lx-cat-layout">
            <div>
              <div className="lx-level-cando">
                <h2 id="lx-level-list" className="lx-h3">{t.canDo(level)}</h2>
                <p>{tx(copy.canDo, lang)}</p>
                <p>{tx(copy.focus, lang)}</p>
              </div>

              {ladder.length > 0 && (
                <>
                  <h2 className="lx-h2">{t.lessonsTitle(level)}</h2>
                  <p className="lx-ladder-sub">{t.lessonsSub}</p>
                  <ol className="lx-syllabus">
                    {ladderLessons.map(({ course, lesson }) => {
                      const lTier = lessonTier(course.id, lesson);
                      const lLocked = isTierLocked(account, lTier);
                      const href = lessonPath(course, lesson, lang);
                      return (
                        <li key={lesson.id}>
                          <Link
                            to={href}
                            onClick={e => {
                              if (!lLocked) return;
                              e.preventDefault();
                              openPremiumModal({ title: `${tx(course.title, lang)} · ${tx(lesson.title, lang)}`, tier: lTier, kind: 'lesson', level, to: href });
                            }}
                            className={`lx-lesson-row${lLocked ? ' ax-locked-card ax-locked-copy' : ''}`}
                          >
                            <span className="lx-lesson-n">{lLocked ? (lTier === 'premium' ? <CrownFilled style={{ color: '#b7791f' }} /> : <LockOutlined />) : <LevelChip level={level} size="sm" />}</span>
                            <div>
                              <p className="lx-level-from">{t.fromCourse} · {tx(course.title, lang)}</p>
                              <h3>{tx(lesson.title, lang)}</h3>
                              <p>{tx(lesson.summary, lang)}</p>
                              <div className="lx-lesson-meta"><span><ClockCircleOutlined /> {ui.minutes(lesson.minutes)}</span><span>{ui.steps(lesson.steps.length)}</span></div>
                            </div>
                            {lLocked
                              ? <LockActionPill lang={lang} tier={lTier} compact />
                              : <span className="lx-round-arrow" aria-hidden><ArrowRightOutlined /></span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}

              {courses.length > 0 && (
                <>
                  <h2 className="lx-h2 lx-level-courses">{t.coursesTitle(level)}</h2>
                  <PagedCourses key={`${category?.id}-${level}`} courses={courses} lang={lang} mounted={mounted} />
                </>
              )}
            </div>

            <aside className="lx-side">
              <Link to={levelPath(level, lang)} className="lx-side-test">
                <strong>{lc.tabPath(level)}</strong>
                <span>{lc.totalActivities(stats.total)}</span>
                <ArrowRightOutlined />
              </Link>
              <Link to={placementPath(lang)} className="lx-side-card">
                <p className="lx-side-title">{t.notSure}</p>
                <p>{t.notSureText}</p>
                <span className="lx-link">{ui.placement.start} →</span>
              </Link>
              <TeacherCta lang={lang} compact />
              <nav className="lx-side-nav" aria-label={t.byLevel}>
                <p><Link to={levelPath(level, lang)}>{t.allLevels} ({level}) →</Link></p>
                <p>{ui.hub.pathsEyebrow}</p>
                <ul>
                  {CATEGORIES.filter(c => c.id !== category.id && categoryLevels(c).includes(level)).map(c => (
                    <li key={c.id}><Link to={categoryLevelPath(c, level, lang)}>{tx(c.name, lang)} · {level}</Link></li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        </section>
      )}
    </LearnShell>
  );
}
