// One learning path (/learn/beginner-french/…): featured starting course,
// interactive filter & view switcher, staged 3-column curriculum grid, and
// conversion banner.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppstoreOutlined, ArrowRightOutlined, BarsOutlined, CheckCircleFilled,
  CheckOutlined, ClockCircleOutlined, CompassOutlined, DownOutlined,
  PlayCircleFilled, ReadOutlined, SearchOutlined, UpOutlined,
} from '@ant-design/icons';
import { TOPIC_PATHS } from '../../components/Landing/sitePages';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { COURSES, coursePath, coursesOf } from '../catalog';
import { AUTOSTART, hubPath, placementPath } from '../paths';
import { courseDone, useProgress } from '../progress';
import { categoryJsonLd } from '../schema';
import { LEVEL_COPY, categoryLevelPath, categoryLevels } from '../levels';
import { Crumbs, LearnShell, LevelChip, TeacherCta, useMounted } from '../shell';
import { LEVELS, tx, type CategoryMeta, type CourseMeta, type Lang, type Level } from '../types';
import { audienceOfCategory } from '../../promo/model';
import { ReadingPromo } from '../practice/parts';
import { UI } from '../ui';

const STAGE_COLLAPSE_LIMIT = 6;

function PathCourseCard({
  course,
  index,
  lang,
  compact,
  done,
  passed,
}: {
  course: CourseMeta;
  index: number;
  lang: Lang;
  compact: boolean;
  done: number;
  passed: boolean;
}) {
  const ui = UI[lang];
  const stepNum = String(index + 1).padStart(2, '0');

  if (compact) {
    return (
      <article className={`lx-cat-compact-card${passed ? ' is-done' : ''}`}>
        <span className="lx-cat-step-num" aria-hidden>{stepNum}</span>
        <img src={imageUrl(course.image, 640)} alt="" loading="lazy" width="160" height="100" className="lx-cat-compact-thumb" />
        <div className="lx-cat-compact-body">
          <div className="lx-cat-compact-top">
            <LevelChip level={course.level} size="sm" />
            {course.popular && !done && <span className="lx-tag">{ui.popular}</span>}
            {passed && <span className="lx-tag is-free"><CheckCircleFilled /> {ui.completed}</span>}
          </div>
          <h3><Link to={coursePath(course, lang)} className="lx-stretch">{tx(course.title, lang)}</Link></h3>
          <p>{tx(course.subtitle, lang)}</p>
          <div className="lx-cat-compact-meta">
            <span><ReadOutlined /> {ui.lessons(course.lessonCount)}</span>
            <span><ClockCircleOutlined /> {ui.minutes(course.minutes)}</span>
            {done > 0 && <span className="lx-row-done">{done}/{course.lessonCount} {ui.done.toLowerCase()}</span>}
          </div>
        </div>
        <Link
          to={coursePath(course, lang)}
          state={AUTOSTART}
          className="lx-cc-start"
          aria-label={`${done ? ui.continue : ui.start} : ${tx(course.title, lang)}`}
        >
          <PlayCircleFilled />{done ? ui.continue : ui.start}
        </Link>
      </article>
    );
  }

  return (
    <article className="lx-course-card is-path-card">
      <div className="lx-cc-img">
        <img src={imageUrl(course.image, 640)} alt="" loading="lazy" width="640" height="360" />
        <LevelChip level={course.level} size="sm" />
        <span className="lx-cc-step-badge">{ui.category.stepLabel(index + 1)}</span>
        {course.popular && !done && <span className="lx-cc-flag">{ui.popular}</span>}
        {passed && <span className="lx-cc-flag is-done"><CheckCircleFilled /> {ui.completed}</span>}
      </div>
      <div className="lx-cc-body">
        <h3><Link to={coursePath(course, lang)} className="lx-stretch">{tx(course.title, lang)}</Link></h3>
        <p className="lx-cc-sub">{tx(course.subtitle, lang)}</p>
        <div className="lx-cc-meta">
          <span><ReadOutlined /> {ui.lessons(course.lessonCount)}</span>
          <span><ClockCircleOutlined /> {ui.minutes(course.minutes)}</span>
          <Link
            to={coursePath(course, lang)}
            state={AUTOSTART}
            className="lx-cc-start"
            aria-label={`${done ? ui.continue : ui.start} : ${tx(course.title, lang)}`}
          >
            <PlayCircleFilled />{done ? ui.continue : ui.start}
          </Link>
        </div>
        {done > 0 && (
          <div className="lx-cc-progress" aria-label={`${done}/${course.lessonCount}`}>
            <i style={{ transform: `scaleX(${done / course.lessonCount})` }} />
          </div>
        )}
      </div>
    </article>
  );
}

export default function CategoryPage({ lang, category }: { lang: Lang; category: CategoryMeta }) {
  const ui = UI[lang];
  const courses = useMemo(
    () => coursesOf(category.id).sort((a, b) => a.level.localeCompare(b.level)),
    [category.id],
  );
  const p = useProgress();
  const mounted = useMounted();
  const name = tx(category.name, lang);
  const total = courses.reduce((n, c) => n + c.minutes, 0);
  const totalLessons = courses.reduce((n, c) => n + c.lessonCount, 0);

  const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all');
  const [q, setQ] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  // Levels that exist among this category's courses (for in-page filter pills).
  const availableLevels = useMemo(
    () => LEVELS.filter(l => courses.some(c => c.levels.includes(l))),
    [courses],
  );

  // Starting levels (first level of each course) to decide if we group into progressive stages.
  const distinctStartLevels = useMemo(() => {
    const set = new Set<Level>(courses.map(c => c.levels[0]));
    return LEVELS.filter(l => set.has(l));
  }, [courses]);

  // Index map so every course keeps its true curriculum number (01..N) even when filtered.
  const indexById = useMemo(
    () => Object.fromEntries(courses.map((c, i) => [c.id, i])),
    [courses],
  );

  // Progress & recommended spotlight course
  const completedCourses = mounted
    ? courses.filter(c => courseDone(p, c.id, c.lessonCount) >= c.lessonCount || p.finals[c.id]?.passed).length
    : 0;
  const anyStarted = mounted && courses.some(c => courseDone(p, c.id, c.lessonCount) > 0);
  const spotlightCourse = useMemo(() => {
    if (!mounted) return courses[0];
    const inProg = courses.find(c => {
      const d = courseDone(p, c.id, c.lessonCount);
      return d > 0 && d < c.lessonCount;
    });
    if (inProg) return inProg;
    const nextUnfinished = courses.find(c => courseDone(p, c.id, c.lessonCount) < c.lessonCount && !p.finals[c.id]?.passed);
    return nextUnfinished ?? courses[0];
  }, [courses, mounted, p]);
  const spotlightIdx = spotlightCourse ? (indexById[spotlightCourse.id] ?? 0) : 0;
  const spotlightDone = mounted && spotlightCourse ? courseDone(p, spotlightCourse.id, spotlightCourse.lessonCount) : 0;

  // Filtered courses
  const filtered = useMemo(() => {
    const words = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).filter(Boolean);
    return courses.filter(c => {
      if (levelFilter !== 'all' && !c.levels.includes(levelFilter)) return false;
      if (!words.length) return true;
      const hay = `${tx(c.title, lang)} ${tx(c.subtitle, lang)} ${c.level}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return words.every(w => hay.includes(w));
    });
  }, [courses, levelFilter, q, lang]);

  // Group into stages when viewing "all" with no search and at least 2 distinct starting levels & >= 6 courses.
  const useStages = levelFilter === 'all' && !q.trim() && distinctStartLevels.length >= 2 && courses.length >= 6;

  const stages = useMemo(() => {
    if (!useStages) return [];
    return distinctStartLevels.map((lvl, idx) => {
      const items = courses.filter(c => c.levels[0] === lvl);
      const mins = items.reduce((acc, c) => acc + c.minutes, 0);
      return { lvl, stageNum: idx + 1, items, mins };
    });
  }, [useStages, distinctStartLevels, courses]);

  const levelRange = availableLevels.length > 1
    ? `${availableLevels[0]} → ${availableLevels[availableLevels.length - 1]}`
    : (availableLevels[0] ?? 'A1');

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: categoryPath(category, 'en'), fr: categoryPath(category, 'fr') }}
      seo={{
        title: ui.category.metaTitle(name),
        description: tx(category.description, lang).slice(0, 300),
        path: categoryPath(category, lang),
        jsonLd: categoryJsonLd(category, lang),
        image: `https://www.learnfrenchwithnatives.com${imageUrl(category.image)}`,
      }}
    >
      {/* ── Hero ── */}
      <section className="lx-cat-hero" aria-labelledby="lx-cat-title">
        <div className="lp-wrap lx-cat-hero-grid">
          <div>
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [name]]} />
            <p className="lp-eyebrow">{tx(category.tag, lang)}</p>
            <h1 id="lx-cat-title">{name}</h1>
            <p className="lx-hero-sub">{tx(category.description, lang)}</p>
            <p className="lx-cat-facts">
              <span><ReadOutlined /> {ui.courses(courses.length)} · {ui.lessons(totalLessons)}</span>
              <span><ClockCircleOutlined /> {ui.minutes(total)}</span>
              <span><CheckOutlined /> {ui.free} · {ui.noSignup}</span>
              {mounted && completedCourses > 0 && (
                <span className="lx-cat-fact-done">
                  <CheckCircleFilled /> {ui.category.completedCount(completedCourses, courses.length)}
                </span>
              )}
            </p>
            <div className="lp-hero-ctas">
              {spotlightCourse && (
                <Link to={coursePath(spotlightCourse, lang)} state={AUTOSTART} className="lp-btn lp-btn-primary lp-btn-lg">
                  {anyStarted ? ui.category.continuePath : ui.category.startPath}<ArrowRightOutlined />
                </Link>
              )}
              <a href="#lx-cat-courses" className="lp-btn lp-btn-ghost lp-btn-lg">{ui.category.browseCurriculum}</a>
            </div>
            {categoryLevels(category).length > 0 && (
              <nav className="lx-hero-levels" aria-label={ui.levelPage.byLevel}>
                <span>{ui.levelPage.byLevel}:</span>
                {categoryLevels(category).map(l => (
                  <Link key={l} to={categoryLevelPath(category, l, lang)}>{l}</Link>
                ))}
              </nav>
            )}
          </div>
          <div className="lx-cat-media">
            <figure className="lx-cat-img">
              <img src={imageUrl(category.image)} alt="" width="1200" height="675" fetchPriority="high" />
            </figure>
            <div className="lx-cat-badge-card" aria-hidden>
              <span className="lx-cat-badge-lvl">{levelRange}</span>
              <div>
                <strong>{ui.courses(courses.length)} · {ui.lessons(totalLessons)}</strong>
                <span>{tx(category.tagline, lang)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Starting / Next Course Spotlight ── */}
      {spotlightCourse && (
        <section className="lx-cat-spotlight-sec" aria-label={ui.category.spotlightEyebrow}>
          <div className="lp-wrap">
            <div className="lx-cat-spotlight">
              <div className="lx-cat-spot-media">
                <img src={imageUrl(spotlightCourse.image, 640)} alt="" width="640" height="360" />
                <span className="lx-cat-spot-step">{ui.category.stepLabel(spotlightIdx + 1)}</span>
              </div>
              <div className="lx-cat-spot-body">
                <div className="lx-cat-spot-kicker">
                  <span className="lx-cat-spot-pill">
                    <CompassOutlined /> {anyStarted ? ui.category.spotlightContinue : ui.category.spotlightEyebrow}
                  </span>
                  <LevelChip level={spotlightCourse.level} size="sm" />
                  {spotlightCourse.popular && <span className="lx-tag">{ui.popular}</span>}
                </div>
                <h2>
                  <Link to={coursePath(spotlightCourse, lang)}>{tx(spotlightCourse.title, lang)}</Link>
                </h2>
                <p className="lx-cat-spot-sub">{tx(spotlightCourse.subtitle, lang)}</p>
                <ul className="lx-cat-spot-outcomes">
                  {spotlightCourse.outcomes.slice(0, 3).map((o, i) => (
                    <li key={i}><CheckOutlined aria-hidden /> {tx(o, lang)}</li>
                  ))}
                </ul>
                <div className="lx-cat-spot-foot">
                  <Link to={coursePath(spotlightCourse, lang)} state={AUTOSTART} className="lp-btn lp-btn-primary">
                    <PlayCircleFilled /> {spotlightDone > 0 ? ui.continue : ui.start}
                  </Link>
                  <Link to={coursePath(spotlightCourse, lang)} className="lx-link">
                    {ui.category.viewSyllabus} <ArrowRightOutlined />
                  </Link>
                  <span className="lx-cat-spot-meta">
                    <ReadOutlined /> {ui.lessons(spotlightCourse.lessonCount)} · <ClockCircleOutlined /> {ui.minutes(spotlightCourse.minutes)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── The reading library (texts with audio), on the Reading path ── */}
      {category.id === 'reading' && (
        <section className="rx-promo-sec is-cat">
          <div className="lp-wrap"><ReadingPromo lang={lang} /></div>
        </section>
      )}

      {/* ── Course Curriculum Section ── */}
      <section className="lp-section lx-cat-list" aria-labelledby="lx-cat-courses">
        <div className="lp-wrap">
          {/* Toolbar */}
          <div className="lx-cat-toolbar">
            <div className="lx-cat-toolbar-top">
              <div className="lx-cat-heading">
                <h2 id="lx-cat-courses" className="lx-h2">{ui.category.coursesIn}</h2>
                <span className="lx-cat-count-pill">{ui.hub.results(filtered.length)}</span>
              </div>
              <div className="lx-cat-controls">
                {courses.length >= 5 && (
                  <label className="lx-cat-search">
                    <SearchOutlined aria-hidden />
                    <input
                      type="search"
                      value={q}
                      onChange={e => setQ(e.target.value)}
                      placeholder={ui.category.searchPlaceholder}
                      aria-label={ui.category.searchPlaceholder}
                    />
                  </label>
                )}
                <div className="lx-cat-view-toggle" role="group" aria-label="View mode">
                  <button
                    type="button"
                    className={view === 'grid' ? 'is-on' : ''}
                    onClick={() => setView('grid')}
                    aria-pressed={view === 'grid'}
                  >
                    <AppstoreOutlined /> <span>{ui.category.viewGrid}</span>
                  </button>
                  <button
                    type="button"
                    className={view === 'list' ? 'is-on' : ''}
                    onClick={() => setView('list')}
                    aria-pressed={view === 'list'}
                  >
                    <BarsOutlined /> <span>{ui.category.viewList}</span>
                  </button>
                </div>
              </div>
            </div>

            {availableLevels.length > 1 && !courses.every(c => c.ladder) && (
              <div className="lx-levels lx-cat-level-tabs" role="group" aria-label={ui.level}>
                <button
                  type="button"
                  className={levelFilter === 'all' ? 'is-on' : ''}
                  onClick={() => setLevelFilter('all')}
                  aria-pressed={levelFilter === 'all'}
                >
                  {ui.allLevels}<span>{courses.length}</span>
                </button>
                {availableLevels.map(l => {
                  const cnt = courses.filter(c => c.levels.includes(l)).length;
                  return (
                    <button
                      key={l}
                      type="button"
                      className={levelFilter === l ? 'is-on' : ''}
                      onClick={() => setLevelFilter(l)}
                      aria-pressed={levelFilter === l}
                    >
                      <b>{l}</b> {ui.hub.levelNames[l]}<span>{cnt}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Staged or Flat Curriculum */}
          {filtered.length === 0 ? (
            <p className="lx-empty">{ui.hub.noResult}</p>
          ) : useStages ? (
            <div className="lx-cat-stages">
              {stages.map(({ lvl, stageNum, items, mins }) => {
                const isExpanded = !!expandedStages[lvl];
                const canCollapse = view === 'grid' && items.length > STAGE_COLLAPSE_LIMIT;
                const hiddenCount = items.length - STAGE_COLLAPSE_LIMIT;
                return (
                  <div key={lvl} className="lx-cat-stage">
                    <header className="lx-cat-stage-head">
                      <div className="lx-cat-stage-title">
                        <span className="lx-cat-stage-num">{ui.category.stageLabel(stageNum)}</span>
                        <LevelChip level={lvl} size="sm" />
                        <h3>{ui.category.stageTitle(lvl, ui.hub.levelNames[lvl])}</h3>
                      </div>
                      <p className="lx-cat-stage-desc">{tx(LEVEL_COPY[lvl].focus, lang)}</p>
                      <span className="lx-cat-stage-meta">
                        <ReadOutlined /> {ui.courses(items.length)} · <ClockCircleOutlined /> {ui.minutes(mins)}
                      </span>
                    </header>
                    <ol className={view === 'grid' ? 'lx-cat-grid' : 'lx-cat-compact-grid'}>
                      {items.map((c, idx) => {
                        const done = mounted ? courseDone(p, c.id, c.lessonCount) : 0;
                        const passed = mounted && !!p.finals[c.id]?.passed;
                        const hideOnClient = mounted && canCollapse && !isExpanded && idx >= STAGE_COLLAPSE_LIMIT;
                        return (
                          <li key={c.id} hidden={hideOnClient || undefined}>
                            <PathCourseCard
                              course={c}
                              index={indexById[c.id] ?? idx}
                              lang={lang}
                              compact={view === 'list'}
                              done={done}
                              passed={passed}
                            />
                          </li>
                        );
                      })}
                    </ol>
                    {canCollapse && (
                      <div className="lx-cat-stage-more">
                        <button
                          type="button"
                          className="lp-btn lp-btn-ghost"
                          onClick={() => setExpandedStages(prev => ({ ...prev, [lvl]: !prev[lvl] }))}
                        >
                          {isExpanded ? (
                            <>{ui.category.showLess} <UpOutlined /></>
                          ) : (
                            <>{ui.category.showAllStage(items.length, hiddenCount)} <DownOutlined /></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <ol className={view === 'grid' ? 'lx-cat-grid' : 'lx-cat-compact-grid'}>
              {filtered.map((c, i) => {
                const done = mounted ? courseDone(p, c.id, c.lessonCount) : 0;
                const passed = mounted && !!p.finals[c.id]?.passed;
                return (
                  <li key={c.id}>
                    <PathCourseCard
                      course={c}
                      index={indexById[c.id] ?? i}
                      lang={lang}
                      compact={view === 'list'}
                      done={done}
                      passed={passed}
                    />
                  </li>
                );
              })}
            </ol>
          )}

          {/* ── Horizontal Conversion Split Banner ── */}
          <div className="lx-cat-banner-grid">
            <div className="lx-cat-banner-main" style={{ '--tcta-img': `url(${imageUrl('teacher', 640)})` } as React.CSSProperties}>
              <TeacherCta lang={lang} audience={audienceOfCategory(category.id)} />
              {category.topic && (
                <Link to={TOPIC_PATHS[category.topic][lang]} className="lx-cat-banner-topic">
                  <span className="lx-cat-topic-img" aria-hidden><img src={imageUrl(category.image, 640)} alt="" loading="lazy" decoding="async" width="640" height="360" /></span>
                  <span className="lx-cat-topic-copy">
                    <strong>{ui.category.related}</strong>
                    <small>{lang === 'fr' ? 'Des cours en direct avec un professeur natif, en ligne ou en présentiel.' : 'Live classes with a native teacher, online or in person.'}</small>
                  </span>
                  <span className="lx-cat-topic-go">{ui.category.relatedLink} <ArrowRightOutlined aria-hidden /></span>
                </Link>
              )}
            </div>
            <div className="lx-cat-banner-side">
              <Link to={placementPath(lang)} className="lx-cat-test-card">
                <span className="lx-cat-test-media" aria-hidden>
                  <img src={imageUrl('placement', 640)} alt="" loading="lazy" decoding="async" width="640" height="360" />
                  <span className="lx-cat-test-badge"><ClockCircleOutlined /> ≈ 10 min</span>
                </span>
                <span className="lx-cat-test-body">
                  <span className="lx-cat-test-eyebrow">{ui.placement.eyebrow}</span>
                  <h3>{ui.hub.ctaTest}</h3>
                  <p>{ui.levelPage.notSureText}</p>
                  <ul className="lx-cat-test-points">
                    {ui.placement.points.map(x => <li key={x}><CheckOutlined aria-hidden />{x}</li>)}
                  </ul>
                  <span className="lx-cat-test-cta">
                    {ui.placement.start} <ArrowRightOutlined />
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Other Learning Paths ── */}
      <section className="lp-section lp-tint" aria-labelledby="lx-other-paths">
        <div className="lp-wrap">
          <h2 id="lx-other-paths" className="lx-h2">{ui.category.otherPathsTitle}</h2>
          <ul className="lx-cat-other-paths">
            {CATEGORIES.filter(c => c.id !== category.id).map(c => {
              const cnt = COURSES.filter(x => x.category === c.id).length;
              return (
                <li key={c.id}>
                  <Link to={categoryPath(c, lang)} className="lx-cat-other-card">
                    <img src={imageUrl(c.image, 640)} alt="" loading="lazy" width="320" height="180" />
                    <div>
                      <strong>{tx(c.name, lang)}</strong>
                      <span>{ui.courses(cnt)}</span>
                    </div>
                    <ArrowRightOutlined aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </LearnShell>
  );
}
