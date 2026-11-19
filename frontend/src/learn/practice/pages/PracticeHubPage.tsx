// /learn/practice/ and /fr/apprendre/pratique/: the home of the practice
// space. It says what practising here means, then offers the five skills
// (Reading, Listening, Dictation, Grammar, Vocabulary): the open ones lead to
// their library, the others are announced.
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckOutlined, ClockCircleOutlined, FileTextOutlined, SoundOutlined } from '@ant-design/icons';
import { imageUrl } from '../../categories';
import { hubPath, placementPath } from '../../paths';
import { Crumbs, LearnShell, TeacherCta } from '../../shell';
import type { Lang } from '../../types';
import { UI } from '../../ui';
import { P } from '../copy';
import { practicePath } from '../meta';
import { skillOverview } from '../overview';
import '../practice.css';

const SITE = 'https://www.learnfrenchwithnatives.com';
const HOW_ICONS = [<ClockCircleOutlined />, <SoundOutlined />, <CheckOutlined />];

export default function PracticeHubPage({ lang }: { lang: Lang }) {
  const c = P[lang];
  const p = c.practice;
  const ui = UI[lang];
  const skills = skillOverview(lang);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${p.title[0]} ${p.title[1]}`,
    description: p.metaDescription,
    url: `${SITE}${practicePath(lang)}`,
    inLanguage: lang,
    isAccessibleForFree: true,
    hasPart: skills.filter(s => s.ready && s.path).map(s => ({ '@type': 'CollectionPage', name: s.name, url: `${SITE}${s.path}` })),
  };

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: practicePath('en'), fr: practicePath('fr') }}
      seo={{ title: p.metaTitle, description: p.metaDescription, path: practicePath(lang), jsonLd, image: `${SITE}${imageUrl('cat-reading')}` }}
    >
      <section className="rx-lib-hero" aria-labelledby="px-title">
        <div className="lp-wrap">
          <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [c.crumb]]} />
          <div className="rx-lib-copy">
            <p className="lp-eyebrow">{p.eyebrow}</p>
            <h1 id="px-title">{p.title[0]} <em>{p.title[1]}</em></h1>
            <p className="lx-hero-sub">{p.intro}</p>
            <ul className="px-facts">
              {p.facts.map(f => <li key={f}><CheckOutlined aria-hidden />{f}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="lp-section px-skills-sec" aria-labelledby="px-skills-title">
        <div className="lp-wrap">
          <header className="px-skills-head">
            <h2 id="px-skills-title">{p.skillsTitle}</h2>
            <p>{p.skillsSub}</p>
          </header>
          <ul className="px-skills">
            {skills.map(s => (
              <li key={s.id}>
                <article className={`px-skill${s.ready ? '' : ' is-soon'}`}>
                  <div className="px-skill-img">
                    <img src={imageUrl(s.image, 640)} srcSet={`${imageUrl(s.image, 640)} 640w, ${imageUrl(s.image, 1200)} 1200w`}
                      sizes="(min-width: 1100px) 360px, (min-width: 700px) 46vw, calc(100vw - 36px)"
                      alt="" width="640" height="360" loading="lazy" decoding="async" />
                    {!s.ready && <span className="px-skill-soon">{p.soonCard}</span>}
                  </div>
                  <div className="px-skill-body">
                    <p className="px-skill-k"><span className="px-skill-ico" aria-hidden>{s.icon}</span>{s.line}</p>
                    <h3>{s.ready && s.path ? <Link to={s.path} className="lx-stretch">{s.name}</Link> : s.name}</h3>
                    <p className="px-skill-desc">{s.desc}</p>
                    {s.ready && (
                      <div className="px-skill-foot">
                        <span className="px-skill-meta"><FileTextOutlined aria-hidden /> {[s.count, s.levels].filter(Boolean).join(' · ')}</span>
                        <span className="px-skill-go" aria-hidden="true">{p.open} <ArrowRightOutlined /></span>
                      </div>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <p className="px-soon-note"><ClockCircleOutlined aria-hidden /> {p.soonNote}</p>
        </div>
      </section>

      <section className="lp-section lp-tint" aria-labelledby="px-how-title">
        <div className="lp-wrap">
          <header className="lp-head"><h2 id="px-how-title">{p.howTitle}</h2></header>
          <ol className="rx-how">
            {p.how.map(([t, d], i) => (
              <li key={t}>
                <span className="rx-how-n" aria-hidden>{HOW_ICONS[i]}</span>
                <strong>{t}</strong>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lp-section" aria-labelledby="px-start-title">
        <div className="lp-wrap px-start">
          <div>
            <h2 id="px-start-title">{p.startTitle}</h2>
            <p>{p.startText}</p>
            <Link to={placementPath(lang)} className="lp-btn lp-btn-primary">{p.startCta} <ArrowRightOutlined /></Link>
          </div>
          <TeacherCta lang={lang} compact />
        </div>
      </section>
    </LearnShell>
  );
}
