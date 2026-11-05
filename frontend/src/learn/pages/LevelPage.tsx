// A level page (/learn/level/b2/) or a path at one level (/learn/tcf-canada/level-b2/):
// what a learner can do at that level, the matching lessons of the levelled
// courses (TCF, TEF) and the courses of that level.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckOutlined, ClockCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { coursePath } from '../catalog';
import { getLessons, loadLessons } from '../content/registry';
import { LEVEL_COPY, categoryLevelPath, categoryLevels, coursesAtLevel, levelPath } from '../levels';
import { hubPath, lessonPath, placementPath } from '../paths';
import { levelJsonLd } from '../schema';
import { CourseCard, Crumbs, LearnShell, LevelChip, TeacherCta } from '../shell';
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

export default function LevelPage({ lang, level, category }: { lang: Lang; level: Level; category?: CategoryMeta }) {
  const ui = UI[lang];
  const t = ui.levelPage;
  const copy = LEVEL_COPY[level];
  const levelName = tx(copy.name, lang);
  const catName = category ? tx(category.name, lang) : '';
  const ladder = ladderCoursesFor(level, category);
  const courses = coursesAtLevel(level, category?.id).filter(c => !c.ladder);
  const lessonsById = useManyLessons(ladder.map(c => c.id));
  const ladderLessons = ladder
    .map(c => ({ course: c, lesson: lessonsById[c.id]?.find(l => l.level === level) }))
    .filter((x): x is { course: CourseMeta; lesson: Lesson } => !!x.lesson);

  const path = category ? categoryLevelPath(category, level, lang) : levelPath(level, lang);
  const alternates = category
    ? { en: categoryLevelPath(category, level, 'en'), fr: categoryLevelPath(category, level, 'fr') }
    : { en: levelPath(level, 'en'), fr: levelPath(level, 'fr') };
  const h1 = category ? t.h1Cat(catName, level) : t.h1(level, levelName);
  const count = ladder.length + courses.length;
  const description = `${tx(copy.canDo, lang)} ${t.metaDescription(level, count)}`.slice(0, 300);
  const siblings: { level: Level; to: string }[] = category
    ? categoryLevels(category).map(l => ({ level: l, to: categoryLevelPath(category, l, lang) }))
    : LEVELS.map(l => ({ level: l, to: levelPath(l, lang) }));
  const trail: [string, string][] = [
    [ui.home, lang === 'fr' ? '/fr/' : '/'],
    [ui.learnHome, hubPath(lang)],
    ...(category ? [[catName, categoryPath(category, lang)] as [string, string]] : []),
    [`${lang === 'fr' ? 'Niveau' : 'Level'} ${level}`, path],
  ];
  const items = [
    ...ladderLessons.map(({ course, lesson }) => ({ name: `${tx(lesson.title, lang)} · ${tx(course.title, lang)}`, path: lessonPath(course, lesson, lang) })),
    ...courses.map(c => ({ name: tx(c.title, lang), path: coursePath(c, lang) })),
  ];
  const image = category?.image ?? (courses[0]?.image ?? 'hub-hero');

  return (
    <LearnShell
      lang={lang}
      alternates={alternates}
      seo={{
        title: category ? t.metaTitleCat(catName, level) : t.metaTitle(level, levelName),
        description,
        path,
        jsonLd: levelJsonLd({ lang, path, name: h1, description, items, trail }),
        image: `https://www.learnfrenchwithnatives.com${imageUrl(image)}`,
      }}
    >
      <section className="lx-cat-hero" aria-labelledby="lx-level-title">
        <div className="lp-wrap lx-cat-hero-grid">
          <div>
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], ...(category ? [[catName, categoryPath(category, lang)] as [string, string]] : []), [`${lang === 'fr' ? 'Niveau' : 'Level'} ${level}`]]} />
            <p className="lp-eyebrow">{category ? tx(category.tag, lang) : t.eyebrow}</p>
            <h1 id="lx-level-title">{h1}</h1>
            <p className="lx-hero-sub">{tx(copy.canDo, lang)}</p>
            <p className="lx-cat-facts">
              <span><ReadOutlined /> {t.items(count)}</span>
              <span><CheckOutlined /> {ui.free} · {ui.noSignup}</span>
            </p>
            <nav className="lx-level-nav" aria-label={t.otherLevels}>
              {siblings.map(s => (
                <Link key={s.level} to={s.to} className={s.level === level ? 'is-on' : ''} aria-current={s.level === level ? 'page' : undefined}>{s.level}</Link>
              ))}
            </nav>
          </div>
          <figure className="lx-cat-img"><img src={imageUrl(image)} alt="" width="1200" height="675" fetchPriority="high" /></figure>
        </div>
      </section>

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
                  {ladderLessons.map(({ course, lesson }) => (
                    <li key={lesson.id}>
                      <Link to={lessonPath(course, lesson, lang)} className="lx-lesson-row">
                        <span className="lx-lesson-n"><LevelChip level={level} size="sm" /></span>
                        <div>
                          <p className="lx-level-from">{t.fromCourse} · {tx(course.title, lang)}</p>
                          <h3>{tx(lesson.title, lang)}</h3>
                          <p>{tx(lesson.summary, lang)}</p>
                          <div className="lx-lesson-meta"><span><ClockCircleOutlined /> {ui.minutes(lesson.minutes)}</span><span>{ui.steps(lesson.steps.length)}</span></div>
                        </div>
                        <span className="lx-round-arrow" aria-hidden><ArrowRightOutlined /></span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </>
            )}

            {courses.length > 0 && (
              <>
                <h2 className="lx-h2 lx-level-courses">{t.coursesTitle(level)}</h2>
                <ul className="lx-grid">{courses.map(c => <li key={c.id}><CourseCard course={c} lang={lang} /></li>)}</ul>
              </>
            )}
          </div>

          <aside className="lx-side">
            <Link to={placementPath(lang)} className="lx-side-test">
              <strong>{t.notSure}</strong>
              <span>{t.notSureText}</span>
              <ArrowRightOutlined />
            </Link>
            <TeacherCta lang={lang} compact />
            <nav className="lx-side-nav" aria-label={t.byLevel}>
              {category && <p><Link to={levelPath(level, lang)}>{t.allLevels} ({level}) →</Link></p>}
              <p>{ui.hub.pathsEyebrow}</p>
              <ul>
                {CATEGORIES.filter(c => c.id !== category?.id && categoryLevels(c).includes(level)).map(c => (
                  <li key={c.id}><Link to={categoryLevelPath(c, level, lang)}>{tx(c.name, lang)} · {level}</Link></li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </section>
    </LearnShell>
  );
}
