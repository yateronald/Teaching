// One learning path (/learn/french-grammar/…): its courses, level by level.
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckOutlined, ClockCircleOutlined, PlayCircleFilled, ReadOutlined } from '@ant-design/icons';
import { TOPIC_PATHS } from '../../components/Landing/sitePages';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { coursePath, coursesOf } from '../catalog';
import { AUTOSTART, hubPath, placementPath } from '../paths';
import { courseDone, useProgress } from '../progress';
import { categoryJsonLd } from '../schema';
import { categoryLevelPath, categoryLevels } from '../levels';
import { Crumbs, LearnShell, LevelChip, useDemo, useMounted } from '../shell';
import { tx, type CategoryMeta, type Lang } from '../types';
import { UI } from '../ui';

export default function CategoryPage({ lang, category }: { lang: Lang; category: CategoryMeta }) {
  const ui = UI[lang];
  const courses = coursesOf(category.id).sort((a, b) => a.level.localeCompare(b.level));
  const p = useProgress();
  const mounted = useMounted();
  const { openDemo } = useDemo();
  const name = tx(category.name, lang);
  const total = courses.reduce((n, c) => n + c.minutes, 0);

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: categoryPath(category, 'en'), fr: categoryPath(category, 'fr') }}
      seo={{ title: ui.category.metaTitle(name), description: tx(category.description, lang).slice(0, 300), path: categoryPath(category, lang), jsonLd: categoryJsonLd(category, lang), image: `https://www.learnfrenchwithnatives.com${imageUrl(category.image)}` }}
    >
      <section className="lx-cat-hero" aria-labelledby="lx-cat-title">
        <div className="lp-wrap lx-cat-hero-grid">
          <div>
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [name]]} />
            <p className="lp-eyebrow">{tx(category.tag, lang)}</p>
            <h1 id="lx-cat-title">{name}</h1>
            <p className="lx-hero-sub">{tx(category.description, lang)}</p>
            <p className="lx-cat-facts">
              <span><ReadOutlined /> {ui.courses(courses.length)}</span>
              <span><ClockCircleOutlined /> {ui.minutes(total)}</span>
              <span><CheckOutlined /> {ui.free} · {ui.noSignup}</span>
            </p>
            {categoryLevels(category).length > 0 && (
              <nav className="lx-level-nav" aria-label={ui.levelPage.byLevel}>
                {categoryLevels(category).map(l => <Link key={l} to={categoryLevelPath(category, l, lang)}>{l}</Link>)}
              </nav>
            )}
          </div>
          <figure className="lx-cat-img"><img src={imageUrl(category.image)} alt="" width="1200" height="675" fetchPriority="high" /></figure>
        </div>
      </section>

      <section className="lp-section lx-cat-list" aria-labelledby="lx-cat-courses">
        <div className="lp-wrap lx-cat-layout">
          <div>
            <h2 id="lx-cat-courses" className="lx-h2">{ui.category.coursesIn}</h2>
            <ol className="lx-rows">
              {courses.map((c, i) => {
                const done = mounted ? courseDone(p, c.id, c.lessonCount) : 0;
                return (
                  <li key={c.id} className="lx-rise" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="lx-row">
                      <img src={imageUrl(c.image, 640)} alt="" loading="lazy" width="640" height="360" />
                      <div className="lx-row-body">
                        <div className="lx-row-top"><LevelChip level={c.level} size="sm" />{c.popular && <span className="lx-tag">{ui.popular}</span>}</div>
                        <h3><Link to={coursePath(c, lang)} className="lx-stretch">{tx(c.title, lang)}</Link></h3>
                        <p>{tx(c.subtitle, lang)}</p>
                        <div className="lx-row-meta">
                          <span><ReadOutlined /> {ui.lessons(c.lessonCount)}</span>
                          <span><ClockCircleOutlined /> {ui.minutes(c.minutes)}</span>
                          {done > 0 && <span className="lx-row-done">{done}/{c.lessonCount} {ui.done.toLowerCase()}</span>}
                        </div>
                      </div>
                      <Link to={coursePath(c, lang)} state={AUTOSTART} className="lx-row-start"><PlayCircleFilled />{done > 0 ? ui.continue : ui.start}</Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <aside className="lx-side">
            <div className="lx-side-card">
              <p className="lx-side-title">{ui.category.sideTitle}</p>
              <p>{ui.category.sideText}</p>
              <button type="button" className="lp-btn lp-btn-primary" onClick={openDemo}>{ui.demo}<ArrowRightOutlined /></button>
              {category.topic && <Link to={TOPIC_PATHS[category.topic][lang]} className="lx-link">{ui.category.relatedLink} →</Link>}
            </div>
            <Link to={placementPath(lang)} className="lx-side-test">
              <strong>{ui.hub.ctaTest}</strong>
              <span>{ui.placement.points[0]}</span>
              <ArrowRightOutlined />
            </Link>
            <nav className="lx-side-nav" aria-label={ui.hub.pathsEyebrow}>
              <p>{ui.hub.pathsEyebrow}</p>
              <ul>
                {CATEGORIES.filter(c => c.id !== category.id).map(c => <li key={c.id}><Link to={categoryPath(c, lang)}>{tx(c.name, lang)}</Link></li>)}
              </ul>
            </nav>
          </aside>
        </div>
      </section>
    </LearnShell>
  );
}
