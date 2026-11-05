// A course (/learn/<path>/<course>/): what you will learn, its lessons, the
// final assessment and the certificate.
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightOutlined, AudioOutlined, CheckCircleFilled, CheckOutlined, ClockCircleOutlined, CommentOutlined, CustomerServiceOutlined,
  DragOutlined, EditOutlined, FileTextOutlined, LockOutlined, PictureOutlined, PlayCircleFilled, ReadOutlined, RiseOutlined, SafetyCertificateOutlined, TagsOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { coursePath, coursesOf } from '../catalog';
import { AUTOSTART, finalPath, hasAutostart, hubPath, lessonPath } from '../paths';
import { ladderState, useProgress } from '../progress';
import { courseJsonLd } from '../schema';
import { CourseCard, Crumbs, LearnShell, LevelChip, TeacherCta, useMounted } from '../shell';
import { LEVELS, tx, type CourseMeta, type Lang, type Lesson, type StepKind } from '../types';
import { UI } from '../ui';
import { useLessons } from '../useLessons';
import AdaptiveTest from './AdaptiveTest';
import { Overlay, useScrollLock } from './LessonPage';

export const KIND_ICON: Record<StepKind, React.ReactNode> = {
  concept: <ReadOutlined />, mcq: <CheckOutlined />, fill: <EditOutlined />, order: <DragOutlined />, match: <TagsOutlined />, categorize: <TagsOutlined />,
  dictation: <CustomerServiceOutlined />, speak: <AudioOutlined />, dialogue: <CommentOutlined />, flashcards: <FileTextOutlined />, conjugate: <EditOutlined />,
  hotspot: <PictureOutlined />, write: <EditOutlined />,
};

/** A levelled course: the six levels, what is validated, open or locked, and the adaptive test. */
function Ladder({ lang, course, lessons, onTest }: { lang: Lang; course: CourseMeta; lessons: Lesson[]; onTest: () => void }) {
  const ui = UI[lang];
  const t = ui.ladder;
  const p = useProgress();
  const mounted = useMounted();
  const st = mounted ? ladderState(p, course.id) : { unlocked: 0, passed: new Set<number>(), current: 0, tested: undefined };
  return (
    <div>
      <h2 id="lx-syllabus" className="lx-h2">{t.title}</h2>
      <p className="lx-ladder-sub">{t.sub}</p>
      <div className="lx-adapt-card">
        <span className="lx-adapt-ico" aria-hidden><RiseOutlined /></span>
        <div>
          <h3>{t.testTitle}</h3>
          <p>{st.tested ? t.testDone(st.tested) : t.testDesc}</p>
        </div>
        <button type="button" className={`lp-btn ${st.tested ? 'lp-btn-ghost' : 'lp-btn-primary'}`} onClick={onTest}>{st.tested ? t.testRetake : t.testStart}<ArrowRightOutlined /></button>
      </div>
      <ol className="lx-ladder">
        {LEVELS.map((lvl, i) => {
          const lesson = lessons.find(l => l.level === lvl);
          if (!lesson) return null;
          const rec = mounted ? p.lessons[lesson.id] : undefined;
          const passed = st.passed.has(i);
          const locked = i > st.unlocked;
          const current = i === st.current && !passed;
          const state = passed ? 'is-done' : current ? 'is-current' : locked ? 'is-locked' : 'is-open';
          return (
            <li key={lvl} className={state}>
              <Link to={lessonPath(course, lesson, lang)} state={locked ? undefined : AUTOSTART} className="lx-ladder-row">
                <span className="lx-ladder-lvl"><b>{lvl}</b><small>{ui.hub.levelNames[lvl]}</small></span>
                <div>
                  <p className="lx-ladder-status">
                    {passed ? <><CheckCircleFilled /> {t.validated}</> : current ? <>{t.current}</> : locked ? <><LockOutlined /> {t.locked}</> : t.open}
                    {rec && <span className="lx-best">{ui.lesson.best(Math.round(rec.best * 100))}</span>}
                  </p>
                  <h3>{tx(lesson.title, lang)}</h3>
                  <p>{locked ? t.lockedHint(LEVELS[i - 1]) : tx(lesson.summary, lang)}</p>
                  <div className="lx-lesson-meta">
                    <span><ClockCircleOutlined /> {ui.minutes(lesson.minutes)}</span>
                    <span>{ui.steps(lesson.steps.length)}</span>
                  </div>
                </div>
                <span className="lx-round-arrow" aria-hidden>{locked ? <LockOutlined /> : <PlayCircleFilled />}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function CoursePage({ lang, course }: { lang: Lang; course: CourseMeta }) {
  const ui = UI[lang];
  const c = ui.course;
  const cat = CATEGORIES.find(x => x.id === course.category)!;
  const lessons = useLessons(course.id) ?? [];
  const p = useProgress();
  const mounted = useMounted();
  const title = tx(course.title, lang);
  const doneIds = mounted ? lessons.filter(l => p.lessons[l.id]).map(l => l.id) : [];
  const next = lessons.find(l => !doneIds.includes(l.id)) ?? lessons[0];
  const final = mounted ? p.finals[course.id] : undefined;
  const others = coursesOf(course.category).filter(x => x.id !== course.id);
  const [testing, setTesting] = useState(false);
  useScrollLock(testing);
  // "Take the adaptive test" links from a locked level land on #test.
  const location = useLocation();
  useEffect(() => { if (course.ladder && location.hash === '#test' && lessons.length) setTesting(true); }, [course.ladder, location.hash, lessons.length]);
  // “Start” on a course card: go straight to the lesson to do now, player open.
  const navigate = useNavigate();
  useEffect(() => {
    if (!hasAutostart(location.state) || !mounted || !lessons.length) return;
    const target = course.ladder ? ladderNext : next;
    if (target) navigate(lessonPath(course, target, lang), { replace: true, state: AUTOSTART });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, mounted, lessons.length]);
  const st = course.ladder && mounted ? ladderState(p, course.id) : null;
  const ladderNext = course.ladder ? lessons.find(l => l.level === LEVELS[st?.current ?? 0]) : undefined;

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: coursePath(course, 'en'), fr: coursePath(course, 'fr') }}
      seo={{ title: c.metaTitle(title, course.level), description: `${tx(course.subtitle, lang)} ${tx(course.description, lang)}`.slice(0, 290), path: coursePath(course, lang), jsonLd: courseJsonLd(course, lessons, lang), image: `https://www.learnfrenchwithnatives.com${imageUrl(course.image)}` }}
    >
      <section className="lx-course-hero" aria-labelledby="lx-course-title">
        <div className="lp-wrap lx-course-grid">
          <div>
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [tx(cat.name, lang), categoryPath(cat, lang)], [title]]} />
            <div className="lx-course-chips"><LevelChip level={course.level} /><span className="lx-tag is-free">{ui.free}</span></div>
            <h1 id="lx-course-title">{title}</h1>
            <p className="lx-hero-sub">{tx(course.subtitle, lang)}</p>
            <p className="lx-course-desc">{tx(course.description, lang)}</p>
            <div className="lp-hero-ctas">
              {course.ladder ? (
                <>
                  {!st?.tested && !st?.passed.size && <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => setTesting(true)}>{ui.ladder.testStart}<ArrowRightOutlined /></button>}
                  {ladderNext && (
                    <Link to={lessonPath(course, ladderNext, lang)} state={AUTOSTART} className={`lp-btn lp-btn-lg ${!st?.tested && !st?.passed.size ? 'lp-btn-ghost' : 'lp-btn-primary'}`}>
                      {st?.tested || st?.passed.size ? ui.ladder.continueAt(ladderNext.level!) : ui.ladder.startAt('A1')}<ArrowRightOutlined />
                    </Link>
                  )}
                </>
              ) : next && (
                <Link to={lessonPath(course, next, lang)} state={AUTOSTART} className="lp-btn lp-btn-primary lp-btn-lg">
                  {doneIds.length === 0 ? c.startCourse : doneIds.length === lessons.length ? c.restart : c.continueCourse}<ArrowRightOutlined />
                </Link>
              )}
            </div>
            {!course.ladder && lessons.length > 0 && (
              <ol className="lx-hero-lessons" aria-label={c.syllabus}>
                {lessons.map((l, i) => {
                  const done = doneIds.includes(l.id);
                  return (
                    <li key={l.id} className={done ? 'is-done' : ''}>
                      <Link to={lessonPath(course, l, lang)} state={AUTOSTART}>
                        <span className="lx-hero-lesson-n" aria-hidden>{done ? <CheckCircleFilled /> : i + 1}</span>
                        <span className="lx-hero-lesson-t">{tx(l.title, lang)}</span>
                        <span className="lx-hero-lesson-m">{ui.minutes(l.minutes)}</span>
                        <PlayCircleFilled className="lx-hero-lesson-p" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
            {mounted && doneIds.length > 0 && (
              <div className="lx-course-progress">
                <span>{c.yourProgress}</span>
                <i><b style={{ transform: `scaleX(${doneIds.length / lessons.length})` }} /></i>
                <strong>{doneIds.length}/{lessons.length}</strong>
              </div>
            )}
          </div>
          <aside className="lx-course-card">
            <img src={imageUrl(course.image)} alt="" width="1200" height="675" fetchPriority="high" />
            <dl>
              <div><dt>{c.level}</dt><dd>{course.level} · {course.levels.map(l => ui.hub.levelNames[l]).join(' / ')}</dd></div>
              <div><dt>{c.duration}</dt><dd>{ui.lessons(course.lessonCount)} · {ui.minutes(course.minutes)}</dd></div>
              <div><dt>{c.format}</dt><dd>{c.formatValue}</dd></div>
              <div><dt>{c.price}</dt><dd>{c.priceValue}</dd></div>
            </dl>
            <p className="lx-course-card-k">{c.includes}</p>
            <ul>{(course.ladder ? c.includeItemsLadder : c.includeItems).map(x => <li key={x}><CheckOutlined aria-hidden />{x}</li>)}</ul>
          </aside>
        </div>
      </section>

      <section className="lp-section" id="syllabus" aria-labelledby="lx-syllabus">
        <div className="lp-wrap lx-cat-layout">
          {course.ladder ? <Ladder lang={lang} course={course} lessons={lessons} onTest={() => setTesting(true)} /> : (
          <div>
            <h2 id="lx-syllabus" className="lx-h2">{c.syllabus}</h2>
            <ol className="lx-syllabus">
              {lessons.map((l, i) => {
                const rec = mounted ? p.lessons[l.id] : undefined;
                const kinds = [...new Set(l.steps.map(s => s.kind))].filter(k => k !== 'concept');
                return (
                  <li key={l.id} className={rec ? 'is-done' : ''}>
                    <Link to={lessonPath(course, l, lang)} state={AUTOSTART} className="lx-lesson-row">
                      <span className="lx-lesson-n">{rec ? <CheckCircleFilled /> : i + 1}</span>
                      <div>
                        <h3>{tx(l.title, lang)}</h3>
                        <p>{tx(l.summary, lang)}</p>
                        <div className="lx-lesson-meta">
                          <span><ClockCircleOutlined /> {ui.minutes(l.minutes)}</span>
                          <span>{ui.steps(l.steps.length)}</span>
                          <span className="lx-kinds">{kinds.slice(0, 6).map(k => <i key={k} title={ui.kinds[k]}>{KIND_ICON[k]}</i>)}</span>
                          {rec && <span className="lx-best">{ui.lesson.best(Math.round(rec.best * 100))}</span>}
                        </div>
                      </div>
                      <span className="lx-round-arrow is-play" aria-hidden><PlayCircleFilled /></span>
                    </Link>
                  </li>
                );
              })}
              <li className={`is-final${final?.passed ? ' is-done' : ''}`}>
                <Link to={finalPath(course, lang)} className="lx-lesson-row">
                  <span className="lx-lesson-n"><TrophyOutlined /></span>
                  <div>
                    <h3>{c.final}</h3>
                    <p>{c.finalDesc}</p>
                    <div className="lx-lesson-meta">
                      {final?.passed ? <span className="lx-best"><SafetyCertificateOutlined /> {c.certificateEarned} · {Math.round(final.best * 100)}%</span> : <span>{c.finalStart}</span>}
                    </div>
                  </div>
                  <span className="lx-round-arrow" aria-hidden><ArrowRightOutlined /></span>
                </Link>
              </li>
            </ol>
          </div>
          )}
          <aside className="lx-side">
            <TeacherCta lang={lang} offer={course.offer} compact />
          </aside>
        </div>
      </section>

      <section className="lp-section lp-tint" aria-labelledby="lx-outcomes">
        <div className="lp-wrap">
          <h2 id="lx-outcomes" className="lx-h2">{c.outcomes}</h2>
          <ul className="lx-outcomes">
            {course.outcomes.map((o, i) => <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{tx(o, lang)}</li>)}
          </ul>
        </div>
      </section>

      {others.length > 0 && (
        <section className="lp-section" aria-labelledby="lx-others">
          <div className="lp-wrap">
            <h2 id="lx-others" className="lx-h2">{c.otherCourses}</h2>
            <ul className="lx-grid">{others.map(o => <li key={o.id}><CourseCard course={o} lang={lang} /></li>)}</ul>
          </div>
        </section>
      )}
      {testing && (
        <Overlay>
          <AdaptiveTest lang={lang} course={course} lessons={lessons} onClose={() => setTesting(false)} />
        </Overlay>
      )}
    </LearnShell>
  );
}
