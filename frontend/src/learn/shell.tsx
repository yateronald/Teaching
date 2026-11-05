// Frame shared by every page of the learning space: the site header and
// footer, the demo form, the head tags, and small building blocks (course
// cards, breadcrumbs, the teacher call to action).
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckCircleFilled, ClockCircleOutlined, PlayCircleFilled, ReadOutlined, RightOutlined } from '@ant-design/icons';
import SEO from '../components/SEO/SEO';
import SiteHeader from '../components/Landing/SiteHeader';
import SiteFooter from '../components/Landing/SiteFooter';
import { PATHS } from '../components/Landing/landingContent';
import { useDemoModal, usePublicPage } from '../components/Landing/publicPage';
import { CATEGORIES, imageUrl } from './categories';
import { coursePath } from './catalog';
import { AUTOSTART } from './paths';
import { useProgress, courseDone } from './progress';
import { tx, type CourseMeta, type Lang } from './types';
import { UI } from './ui';
import '../components/Landing/LandingPage.css';
import './learn.css';

interface DemoApi { openDemo: () => void; openOffer: (offer: string) => void }
const DemoCtx = createContext<DemoApi>({ openDemo: () => {}, openOffer: () => {} });
export const useDemo = () => useContext(DemoCtx);

/** True after the first render in the browser (progress, video: never in the pre-rendered HTML). */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

interface ShellProps {
  lang: Lang;
  alternates: Record<Lang, string>;
  seo: { title: string; description: string; path: string; jsonLd?: object; noindex?: boolean; image?: string };
  children: React.ReactNode;
  bare?: boolean;
}

export function LearnShell({ lang, alternates, seo, children, bare = false }: ShellProps) {
  const { openDemo, openExamOffer, modal } = useDemoModal();
  usePublicPage(lang);
  return (
    <DemoCtx.Provider value={{ openDemo, openOffer: openExamOffer }}>
      <div className="lp lx" lang={lang}>
        <SEO lang={lang} title={seo.title} description={seo.description} path={seo.path} alternates={alternates} jsonLd={seo.jsonLd} noindex={seo.noindex} image={seo.image} />
        <a href="#main" className="lp-skip">{lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>
        {!bare && <SiteHeader lang={lang} alternates={alternates} sectionBase={PATHS[lang]} onDemo={openDemo} />}
        <main id="main">{children}</main>
        {!bare && <SiteFooter lang={lang} sectionBase={PATHS[lang]} onDemo={openDemo} />}
        {modal}
      </div>
    </DemoCtx.Provider>
  );
}

export function Crumbs({ items, lang }: { items: [string, string?][]; lang: Lang }) {
  return (
    <nav className="lx-crumbs" aria-label={UI[lang].breadcrumb}>
      <ol>
        {items.map(([label, to], i) => (
          <li key={i}>
            {to ? <Link to={to}>{label}</Link> : <span aria-current="page">{label}</span>}
            {i < items.length - 1 && <RightOutlined aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LevelChip({ level, size = 'md' }: { level: string; size?: 'sm' | 'md' }) {
  const first = level.slice(0, 2);
  return <span className={`lx-lvl is-${first.toLowerCase()} is-${size}`}>{level}</span>;
}

export function CourseCard({ course, lang, compact = false }: { course: CourseMeta; lang: Lang; compact?: boolean }) {
  const ui = UI[lang];
  const p = useProgress();
  const mounted = useMounted();
  const done = mounted ? courseDone(p, course.id, course.lessonCount) : 0;
  const passed = mounted && p.finals[course.id]?.passed;
  const cat = CATEGORIES.find(c => c.id === course.category)!;
  return (
    <article className={`lx-course-card${compact ? ' is-compact' : ''}`}>
      <div className="lx-cc-img">
        <img src={imageUrl(course.image, 640)} alt="" loading="lazy" width="640" height="360" />
        <LevelChip level={course.level} size="sm" />
        {course.popular && !done && <span className="lx-cc-flag">{ui.popular}</span>}
        {passed && <span className="lx-cc-flag is-done"><CheckCircleFilled /> {ui.completed}</span>}
      </div>
      <div className="lx-cc-body">
        <p className="lx-cc-cat">{tx(cat.name, lang)}</p>
        <h3><Link to={coursePath(course, lang)} className="lx-stretch">{tx(course.title, lang)}</Link></h3>
        {!compact && <p className="lx-cc-sub">{tx(course.subtitle, lang)}</p>}
        <div className="lx-cc-meta">
          <span><ReadOutlined /> {ui.lessons(course.lessonCount)}</span>
          <span><ClockCircleOutlined /> {ui.minutes(course.minutes)}</span>
          <Link to={coursePath(course, lang)} state={AUTOSTART} className="lx-cc-start" aria-label={`${done ? ui.continue : ui.start} : ${tx(course.title, lang)}`}><PlayCircleFilled />{done ? ui.continue : ui.start}</Link>
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

export function TeacherCta({ lang, offer, variant = 'general', compact = false }: { lang: Lang; offer?: string; variant?: 'general' | 'writing' | 'speaking'; compact?: boolean }) {
  const { openDemo, openOffer } = useDemo();
  const c = UI[lang].cta;
  const [title, text, button] = offer ? c.exam(offer) : c[variant];
  return (
    <aside className={`lx-tcta${compact ? ' is-compact' : ''}`}>
      <div className="lx-tcta-flag" aria-hidden><i /><i /><i /></div>
      <p className="lx-tcta-eyebrow">{UI[lang].end.ctaEyebrow}</p>
      <h3>{title}</h3>
      <p>{text}</p>
      <button type="button" className="lp-btn lp-btn-light" onClick={() => (offer ? openOffer(offer) : openDemo())}>{button}<ArrowRightOutlined /></button>
    </aside>
  );
}
