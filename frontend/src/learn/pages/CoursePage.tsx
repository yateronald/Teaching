// A course (/learn/<path>/<course>/), laid out like an online-course platform:
// a banner with the call to action, key facts, in-page tabs, what you will
// learn, the syllabus, the certificate and related courses.
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightOutlined, AudioOutlined, CheckCircleFilled, CheckOutlined, ClockCircleOutlined, CommentOutlined, CustomerServiceOutlined,
  DragOutlined, EditOutlined, FileTextOutlined, LockOutlined, PictureOutlined, PlayCircleFilled, ReadOutlined, RiseOutlined, SafetyCertificateOutlined, TagsOutlined, ThunderboltOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { courseAbout, coursePath, coursesOf } from '../catalog';
import { AUTOSTART, finalPath, hasAutostart, hubPath, lessonPath } from '../paths';
import { ladderState, useProgress } from '../progress';
import { courseJsonLd } from '../schema';
import { Crumbs, LearnShell, TeacherCta, useMounted } from '../shell';
import { CourseRow } from '../components/CourseRow';
import './course.css';
import { LEVELS, tx, type CourseMeta, type Lang, type Lesson, type StepKind } from '../types';
import { audienceOfCategory } from '../../promo/model';
import { UI } from '../ui';
import { useLessons } from '../useLessons';
import AdaptiveTest from './AdaptiveTest';
import { Overlay, useScrollLock } from './LessonPage';
import { canOpen, courseTier } from '../access';
import { hasLockedLessons } from '../content/registry';
import { AccessGate, TierBadge } from '../account/AccessGate';
import { useCourseUnlock } from '../account/useCourseUnlock';
import { effectiveLevel, freeForAllCopy, useAccount } from '../account/store';

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
  const loaded = useLessons(course.id);
  const lessons = loaded ?? [];
  // Locked lessons this account may open come from the server.
  useCourseUnlock(course.id, loaded);
  const account = useAccount();
  // While the courses are free for everyone, everything opens.
  const access = { ...account.access, level: effectiveLevel(account) };
  const openToAll = freeForAllCopy(account);
  const tier = openToAll ? 'visitor' : courseTier(course.id);
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

  const fr = lang === 'fr';
  const about = courseAbout(course);
  const levelLabel = course.levels.length > 2
    ? `${ui.hub.levelNames[course.levels[0]]} → ${ui.hub.levelNames[course.levels[course.levels.length - 1]]}`
    : course.levels.map(l => ui.hub.levelNames[l]).join(' / ');
  const kindsAll = [...new Set(lessons.flatMap(l => l.steps.map(s => s.kind)))].filter(k => k !== 'concept');
  const started = course.ladder ? !!(st?.tested || st?.passed.size) : doneIds.length > 0;
  const startLesson = course.ladder ? ladderNext : next;

  // In-page tabs: the section under the tabs is highlighted as you scroll.
  const tabs: [string, string][] = [
    ['about', fr ? 'À propos' : 'About'],
    ['outcomes', fr ? 'Objectifs' : 'Outcomes'],
    ['syllabus', course.ladder ? (fr ? 'Niveaux' : 'Levels') : (fr ? 'Programme' : 'Syllabus')],
    ...(course.ladder ? [] : [['certificate', fr ? 'Certificat' : 'Certificate'] as [string, string]]),
    ...(others.length ? [['related', fr ? 'Cours similaires' : 'Related courses'] as [string, string]] : []),
  ];
  const [tab, setTab] = useState('about');
  const tabIds = tabs.map(t => t[0]).join(',');
  useEffect(() => {
    const ids = tabIds.split(',');
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let cur = ids[0];
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top < 190) cur = id;
        }
        setTab(cur);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [tabIds]);
  const goTo = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** The main call to action, the same in the banner and the side card. */
  const cta = (variant: 'light' | 'primary', size = ' lp-btn-lg') => course.ladder ? (
    <>
      {!st?.tested && !st?.passed.size && <button type="button" className={`lp-btn lp-btn-${variant}${size}`} onClick={() => setTesting(true)}>{ui.ladder.testStart}<ArrowRightOutlined /></button>}
      {ladderNext && (
        <Link to={lessonPath(course, ladderNext, lang)} state={AUTOSTART} className={`lp-btn${size} ${!st?.tested && !st?.passed.size ? 'lp-btn-ghost cp-btn-ghost' : `lp-btn-${variant}`}`}>
          {st?.tested || st?.passed.size ? ui.ladder.continueAt(ladderNext.level!) : ui.ladder.startAt('A1')}<ArrowRightOutlined />
        </Link>
      )}
    </>
  ) : next ? (
    <Link to={lessonPath(course, next, lang)} state={AUTOSTART} className={`lp-btn lp-btn-${variant}${size}`}>
      <PlayCircleFilled /> {doneIds.length === 0 ? c.startCourse : doneIds.length === lessons.length ? c.restart : c.continueCourse}
    </Link>
  ) : null;

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: coursePath(course, 'en'), fr: coursePath(course, 'fr') }}
      seo={{ title: c.metaTitle(title, course.level), description: `${tx(course.subtitle, lang)} ${tx(about.description, lang)}`.slice(0, 290), path: coursePath(course, lang), jsonLd: courseJsonLd(course, lessons, lang), image: `https://www.learnfrenchwithnatives.com${imageUrl(course.image)}` }}
    >
      {/* ── Banner ── */}
      <section className="cp-hero" aria-labelledby="lx-course-title">
        <div className="cp-hero-bg" aria-hidden><img src={imageUrl(course.image, 640)} alt="" width="640" height="360" /></div>
        <div className="lp-wrap cp-hero-grid">
          <div className="cp-hero-copy">
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [tx(cat.name, lang), categoryPath(cat, lang)], [title]]} />
            <p className="cp-provider"><span className="crs-logo" aria-hidden>LF</span>Learn French with Natives<span aria-hidden>·</span><Link to={categoryPath(cat, lang)}>{tx(cat.name, lang)}</Link></p>
            <h1 id="lx-course-title">{title}</h1>
            <p className="cp-sub">{tx(course.subtitle, lang)}</p>
            <p className="cp-teacher">
              <img src={imageUrl('teacher', 640)} alt="" width="640" height="360" loading="lazy" decoding="async" />
              <span>{fr ? 'Créé par l’équipe pédagogique de Learn French with Natives' : 'Created by the Learn French with Natives teaching team'}</span>
            </p>
            <div className="cp-ctas">
              {cta('light')}
              <span className="cp-cta-note">{tier === 'visitor'
                ? <><CheckCircleFilled aria-hidden /> {fr ? 'Gratuit · Sans inscription' : 'Free · No sign-up'}</>
                : <TierBadge lang={lang} tier={tier} level={access.level} />}</span>
            </div>
            {mounted && !course.ladder && doneIds.length > 0 && (
              <div className="cp-progress">
                <span>{c.yourProgress}</span>
                <i><b style={{ transform: `scaleX(${doneIds.length / lessons.length})` }} /></i>
                <strong>{doneIds.length}/{lessons.length}</strong>
              </div>
            )}
          </div>
          <div className="cp-hero-media">
            {startLesson ? (
              <Link to={lessonPath(course, startLesson, lang)} state={AUTOSTART} className="cp-preview" aria-label={fr ? `Commencer : ${title}` : `Start: ${title}`}>
                <img src={imageUrl(course.image)} alt="" width="1200" height="675" fetchPriority="high" />
                <span className="cp-play" aria-hidden><PlayCircleFilled /></span>
                <span className="cp-preview-label">{started ? (fr ? 'Reprendre où vous en étiez' : 'Resume where you left off') : (fr ? 'Commencer la première leçon' : 'Start the first lesson')}</span>
              </Link>
            ) : (
              <span className="cp-preview"><img src={imageUrl(course.image)} alt="" width="1200" height="675" fetchPriority="high" /></span>
            )}
          </div>
        </div>
      </section>

      {/* ── Key facts ── */}
      <div className="lp-wrap">
        <ul className="cp-strip">
          <li><span className="cp-strip-ico" aria-hidden><ReadOutlined /></span><div><strong>{course.ladder ? (fr ? '6 niveaux, A1 → C2' : '6 levels, A1 → C2') : ui.lessons(course.lessonCount)}</strong><small>{ui.minutes(course.minutes)} {fr ? 'au total' : 'in total'}</small></div></li>
          <li><span className="cp-strip-ico" aria-hidden><RiseOutlined /></span><div><strong>{course.level} · {levelLabel}</strong><small>{fr ? 'Niveau du CECRL' : 'CEFR level'}</small></div></li>
          <li><span className="cp-strip-ico" aria-hidden><ClockCircleOutlined /></span><div><strong>{fr ? 'À votre rythme' : 'Flexible schedule'}</strong><small>{fr ? 'Pause et reprise à tout moment' : 'Pause and resume at any time'}</small></div></li>
          <li><span className="cp-strip-ico" aria-hidden>{course.ladder ? <ThunderboltOutlined /> : <SafetyCertificateOutlined />}</span><div><strong>{course.ladder ? (fr ? 'Test adaptatif' : 'Adaptive test') : c.certificate}</strong><small>{course.ladder ? (fr ? 'Commencez à votre vrai niveau' : 'Start at your real level') : (fr ? 'Après l’évaluation finale' : 'After the final assessment')}</small></div></li>
        </ul>
      </div>

      {/* ── In-page tabs ── */}
      <nav className="cp-tabs" aria-label={fr ? 'Sections du cours' : 'Course sections'}>
        <div className="lp-wrap">
          {tabs.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={tab === id ? 'is-on' : undefined} aria-current={tab === id ? 'true' : undefined} onClick={e => goTo(e, id)}>{label}</a>
          ))}
        </div>
      </nav>

      <section className="cp-body">
        <div className="lp-wrap cp-layout">
          <div className="cp-main">
            <section id="about" className="cp-block" aria-labelledby="cp-about-title">
              <h2 id="cp-about-title">{fr ? 'À propos de ce cours' : 'About this course'}</h2>
              <p className="cp-desc">{tx(about.description, lang)}</p>
              <div className="cp-learn" id="outcomes">
                <h3>{c.outcomes}</h3>
                <ul>{about.outcomes.map((o, i) => <li key={i}><CheckOutlined aria-hidden />{tx(o, lang)}</li>)}</ul>
              </div>
              {kindsAll.length > 0 && (
                <div className="cp-skills">
                  <h3>{fr ? 'Activités au programme' : 'What you will practise'}</h3>
                  <ul>{kindsAll.map(k => <li key={k}>{KIND_ICON[k]}{ui.kinds[k]}</li>)}</ul>
                </div>
              )}
            </section>

            <section id="syllabus" className="cp-block" aria-labelledby="lx-syllabus">
              {course.ladder ? <Ladder lang={lang} course={course} lessons={lessons} onTest={() => setTesting(true)} /> : (
                <>
                  <h2 id="lx-syllabus">{fr ? `Programme · ${lessons.length} leçons` : `Syllabus · ${lessons.length} lessons`}</h2>
                  <p className="cp-block-sub">{course.guidedLessons
                    ? fr
                      ? `Pour le parcours ${course.level}, commencez par ${course.guidedLessons.count === 1 ? 'la leçon 1' : `les leçons 1 à ${course.guidedLessons.count}`}. Les leçons suivantes restent accessibles pour approfondir.`
                      : `For the ${course.level} path, start with ${course.guidedLessons.count === 1 ? 'lesson 1' : `lessons 1–${course.guidedLessons.count}`}. Open the later lessons whenever you’re ready to go further.`
                    : course.category === 'verbs'
                      ? fr ? 'Repérez les groupes dans des phrases, puis vérifiez vos réponses dans les exercices.' : 'Spot verb groups in sentences, then check your understanding with exercises.'
                      : fr ? 'Chaque leçon alterne explications, audio natif et exercices corrigés. Suivez-les dans l’ordre ou choisissez librement.' : 'Each lesson mixes explanations, native audio and corrected exercises. Take them in order or pick freely.'}</p>
                  <ol className="cp-syllabus">
                    {lessons.map((l, i) => {
                      const rec = mounted ? p.lessons[l.id] : undefined;
                      const kinds = [...new Set(l.steps.map(s => s.kind))].filter(k => k !== 'concept');
                      const isNext = mounted && !rec && next?.id === l.id && doneIds.length > 0;
                      return (
                        <li key={l.id} className={`${rec ? 'is-done' : ''}${isNext ? ' is-next' : ''}`}>
                          <Link to={lessonPath(course, l, lang)} state={AUTOSTART} className="cp-lesson">
                            <span className="cp-lesson-n" aria-hidden>{rec ? <CheckCircleFilled /> : i + 1}</span>
                            <div className="cp-lesson-body">
                              <p className="cp-lesson-k">
                                <b>{fr ? `Leçon ${i + 1}` : `Lesson ${i + 1}`}</b>
                                <span><ClockCircleOutlined aria-hidden /> {ui.minutes(l.minutes)}</span>
                                <span>{ui.steps(l.steps.length)}</span>
                                {l.locked && !canOpen(access.level, l.locked) && <TierBadge lang={lang} tier={l.locked} level={access.level} />}
                                {rec && <span className="lx-best">{ui.lesson.best(Math.round(rec.best * 100))}</span>}
                              </p>
                              <h3>{tx(l.title, lang)}</h3>
                              <p className="cp-lesson-sum">{tx(l.summary, lang)}</p>
                              <ul className="cp-lesson-kinds" aria-label={c.activityTypes}>
                                {kinds.slice(0, 6).map(k => <li key={k}>{KIND_ICON[k]}{ui.kinds[k]}</li>)}
                              </ul>
                            </div>
                            <span className="cp-lesson-go">{rec ? (fr ? 'Revoir' : 'Review') : (fr ? 'Commencer' : 'Start')}<PlayCircleFilled aria-hidden /></span>
                          </Link>
                        </li>
                      );
                    })}
                    <li className={`is-final${final?.passed ? ' is-done' : ''}`}>
                      <Link to={finalPath(course, lang)} className="cp-lesson">
                        <span className="cp-lesson-n" aria-hidden><TrophyOutlined /></span>
                        <div className="cp-lesson-body">
                          <p className="cp-lesson-k"><b>{fr ? 'Évaluation' : 'Assessment'}</b><span>10 questions</span></p>
                          <h3>{c.final}</h3>
                          <p className="cp-lesson-sum">{c.finalDesc}</p>
                        </div>
                        <span className="cp-lesson-go">{final?.passed ? `${Math.round(final.best * 100)}%` : c.finalStart}<ArrowRightOutlined aria-hidden /></span>
                      </Link>
                    </li>
                  </ol>
                </>
              )}
            </section>

            {!course.ladder && (
              <section id="certificate" className="cp-block cp-cert" aria-labelledby="cp-cert-title">
                <div className="cp-cert-copy">
                  <p className="lp-eyebrow">{c.certificate}</p>
                  <h2 id="cp-cert-title">{final?.passed ? c.certificateEarned : (fr ? 'Obtenez votre certificat' : 'Earn your certificate')}</h2>
                  <p>{c.finalDesc}</p>
                  <Link to={finalPath(course, lang)} className="lp-btn lp-btn-primary">
                    {final?.passed ? <><SafetyCertificateOutlined /> {c.certificateEarned}</> : <>{c.finalStart} <ArrowRightOutlined /></>}
                  </Link>
                </div>
                <div className="cp-cert-card" aria-hidden>
                  <span className="cp-cert-flag"><i /><i /><i /></span>
                  <span className="cp-cert-seal"><SafetyCertificateOutlined /></span>
                  <small>{c.certificate}</small>
                  <strong>{title}</strong>
                  <span className="cp-cert-meta">{course.level} · Learn French with Natives</span>
                  <span className="cp-cert-lines"><i /><i /></span>
                </div>
              </section>
            )}
          </div>

          <aside className="cp-aside">
            <div className="cp-aside-card">
              <p className="cp-aside-price">{tier === 'visitor' ? <><b>{ui.free}</b><span>{c.priceValue}</span></>
                : tier === 'free' ? <><b>{ui.free}</b><span>{fr ? 'Avec un compte gratuit' : 'With a free account'}</span></>
                : <><b>Premium</b><span>{fr ? 'Inclus dans Premium' : 'Included in Premium'}</span></>}</p>
              <div className="cp-aside-cta">{cta('primary', '')}</div>
              <dl>
                <div><dt>{c.level}</dt><dd>{course.level} · {levelLabel}</dd></div>
                <div><dt>{c.duration}</dt><dd>{ui.lessons(course.lessonCount)} · {ui.minutes(course.minutes)}</dd></div>
                <div><dt>{c.format}</dt><dd>{c.formatValue}</dd></div>
              </dl>
              <p className="cp-aside-k">{c.includes}</p>
              <ul>{(course.ladder ? c.includeItemsLadder : c.includeItems).map(x => (openToAll ? x.replace(/ \(Premium\)$/, '') : x)).map(x => <li key={x}><CheckOutlined aria-hidden />{x}</li>)}</ul>
            </div>
            <TeacherCta lang={lang} offer={course.offer} audience={audienceOfCategory(course.category, course.id)} compact />
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section id="related" className="cp-related" aria-label={c.otherCourses}>
          <div className="lp-wrap">
            <CourseRow
              lang={lang}
              headingLevel={2}
              title={c.otherCourses}
              sub={tx(cat.tagline, lang)}
              courses={others}
              action={<Link to={categoryPath(cat, lang)} className="ah-row-all">{fr ? 'Tout voir' : 'View all'} <ArrowRightOutlined /></Link>}
            />
          </div>
        </section>
      )}
      {testing && (
        <Overlay>
          {hasLockedLessons(lessons) ? (
            <div className="lx-end-wrap">
              <button type="button" className="lx-end-close" onClick={() => setTesting(false)} aria-label={ui.lesson.backToCourse}>×</button>
              <AccessGate lang={lang} tier={tier === 'visitor' ? 'free' : tier} />
            </div>
          ) : <AdaptiveTest lang={lang} course={course} lessons={lessons} onClose={() => setTesting(false)} />}
        </Overlay>
      )}
    </LearnShell>
  );
}
