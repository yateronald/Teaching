// /learn/ and /fr/apprendre/: the front door of the free courses.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRightOutlined, AudioOutlined, CheckOutlined, ClockCircleOutlined, CustomerServiceOutlined, DragOutlined, PlayCircleFilled, SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import { speak } from '../audio';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { COURSES, courseById, coursePath } from '../catalog';
import { hubPath, placementPath } from '../paths';
import { useProgress } from '../progress';
import { hubJsonLd } from '../schema';
import { CourseCard, LearnShell, useDemo, useMounted } from '../shell';
import { LEVELS, tx, type Lang, type Level } from '../types';
import { UI } from '../ui';

const ACTIVITY_ICONS = [<CustomerServiceOutlined />, <AudioOutlined />, <DragOutlined />, <TrophyOutlined />];

function TryIt({ lang }: { lang: Lang }) {
  const ui = UI[lang].hub;
  const [pick, setPick] = useState<string | null>(null);
  const course = courseById('articles-gender')!;
  const right = pick === 'un';
  return (
    <div className="lx-try-card">
      <p className="lx-try-kicker">{UI[lang].kinds.mcq} · A1</p>
      <p className="lx-try-q">{ui.tryPrompt}</p>
      <p className="lx-try-fr"><b className={`lx-gap${pick ? ' is-filled' : ''}`}>{pick ?? '   '}</b> croissant</p>
      <div className="lx-try-opts">
        {['un', 'une', 'des'].map(o => (
          <motion.button key={o} type="button" whileTap={{ scale: 0.95 }}
            className={`lx-option${pick === o ? (o === 'un' ? ' is-right' : ' is-wrong') : pick && o === 'un' ? ' is-right' : ''}`}
            onClick={() => { setPick(o); speak(`${o} croissant`); }}
            animate={pick === o && o !== 'un' ? { x: [0, -6, 6, -4, 4, 0] } : {}}>
            {o}
          </motion.button>
        ))}
      </div>
      {pick && (
        <motion.div className={`lx-try-fb${right ? ' is-right' : ' is-wrong'}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p>{right ? ui.tryRight : ui.tryWrong}</p>
          <Link to={coursePath(course, lang)} className="lx-link">{ui.tryNext} <ArrowRightOutlined /></Link>
        </motion.div>
      )}
    </div>
  );
}

export default function HubPage({ lang }: { lang: Lang }) {
  const ui = UI[lang];
  const h = ui.hub;
  const { openDemo } = useDemo();
  const p = useProgress();
  const mounted = useMounted();
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const words = q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(Boolean);
    return COURSES.filter(c => (level === 'all' || c.levels.includes(level)) && words.every(w => {
      const hay = `${tx(c.title, lang)} ${tx(c.subtitle, lang)} ${tx(CATEGORIES.find(x => x.id === c.category)!.name, lang)} ${c.level}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      return hay.includes(w);
    }));
  }, [level, q, lang]);

  const last = mounted ? p.last : undefined;

  return (
    <LearnShell lang={lang} alternates={{ en: hubPath('en'), fr: hubPath('fr') }} seo={{ title: h.metaTitle, description: h.metaDescription, path: hubPath(lang), jsonLd: hubJsonLd(lang), image: `https://www.learnfrenchwithnatives.com${imageUrl('hub-hero')}` }}>
      {/* ── Hero ── */}
      <section className="lx-hero" aria-labelledby="lx-hub-title">
        <div className="lp-wrap lx-hero-grid">
          <div className="lx-hero-copy">
            <p className="lp-eyebrow">{h.eyebrow}</p>
            <h1 id="lx-hub-title">{h.title[0]} <em>{h.title[1]}</em></h1>
            <p className="lx-hero-sub">{h.sub}</p>
            <div className="lp-hero-ctas">
              <Link to={placementPath(lang)} className="lp-btn lp-btn-primary lp-btn-lg">{h.ctaTest}<ArrowRightOutlined /></Link>
              <a href="#courses" className="lp-btn lp-btn-ghost lp-btn-lg">{h.ctaBrowse}</a>
            </div>
            <dl className="lx-hero-stats">
              {h.stats.map(([v, l]) => <div key={l}><dt>{v}</dt><dd>{l}</dd></div>)}
            </dl>
          </div>
          <div className="lx-hero-media">
            <div className="lx-hero-frame">
              <img src={imageUrl('hub-hero')} alt="" width="1200" height="675" fetchPriority="high" />
              {mounted && (
                <video className="lx-hero-video" src="/learn/video/hub.mp4" poster={imageUrl('hub-hero')} autoPlay muted loop playsInline preload="none" aria-hidden
                  onError={e => { e.currentTarget.style.display = 'none'; }} />
              )}
            </div>
            <div className="lx-float is-a" aria-hidden>
              <CheckOutlined /><span><b>{lang === 'fr' ? 'Correct !' : 'Correct!'}</b> Je suis étudiante.</span>
            </div>
            <div className="lx-float is-b" aria-hidden>
              <PlayCircleFilled /><span><b>TCF · CO</b> B2 <i className="lx-float-wave"><u /><u /><u /><u /><u /></i></span>
            </div>
          </div>
        </div>
      </section>

      {last && (
        <section className="lx-continue" aria-label={h.continueTitle}>
          <div className="lp-wrap">
            <Link to={last.path} className="lx-continue-card">
              <span className="lx-continue-k">{h.continueTitle}</span>
              <strong>{last.title}</strong>
              <em>{last.course}</em>
              <span className="lp-btn lp-btn-primary lp-btn-sm">{h.continueCta}<ArrowRightOutlined /></span>
            </Link>
          </div>
        </section>
      )}

      {/* ── Paths ── */}
      <section className="lp-section" id="paths" aria-labelledby="lx-paths-title">
        <div className="lp-wrap">
          <header className="lp-head">
            <p className="lp-eyebrow">{h.pathsEyebrow}</p>
            <h2 id="lx-paths-title">{h.pathsTitle}</h2>
            <p>{h.pathsSub}</p>
          </header>
          <ul className="lx-paths">
            {CATEGORIES.map((c, i) => {
              const n = COURSES.filter(x => x.category === c.id).length;
              return (
                <li key={c.id} className="lx-rise" style={{ animationDelay: `${0.05 + i * 0.04}s` }}>
                  <Link to={categoryPath(c, lang)} className="lx-path">
                    <div className="lx-path-img">
                      <img src={imageUrl(c.image, 640)} alt="" loading="lazy" width="640" height="360" />
                      <span className="lx-path-tag">{tx(c.tag, lang)}</span>
                    </div>
                    <div className="lx-path-body">
                      <h3>{tx(c.name, lang)}</h3>
                      <p>{tx(c.tagline, lang)}</p>
                      <span className="lx-path-foot"><b>{ui.courses(n)}</b><span className="lx-round-arrow" aria-hidden><ArrowRightOutlined /></span></span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Try it ── */}
      <section className="lp-section lp-tint" aria-labelledby="lx-try-title">
        <div className="lp-wrap lx-try">
          <div>
            <p className="lp-eyebrow">{h.tryEyebrow}</p>
            <h2 id="lx-try-title">{h.tryTitle}</h2>
            <p className="lx-try-sub">{h.trySub}</p>
            <ul className="lx-acts">
              {h.activities.map(([t, d], i) => (
                <li key={t}><span aria-hidden>{ACTIVITY_ICONS[i]}</span><div><strong>{t}</strong><p>{d}</p></div></li>
              ))}
            </ul>
          </div>
          <TryIt lang={lang} />
        </div>
      </section>

      {/* ── Catalogue ── */}
      <section className="lp-section" id="courses" aria-labelledby="lx-all-title">
        <div className="lp-wrap">
          <header className="lp-head is-left lx-all-head">
            <div>
              <p className="lp-eyebrow">{h.allEyebrow}</p>
              <h2 id="lx-all-title">{h.allTitle}</h2>
            </div>
            <label className="lx-search">
              <SearchOutlined aria-hidden />
              <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={h.search} aria-label={h.search} />
            </label>
          </header>
          <div className="lx-levels" role="group" aria-label={ui.level}>
            <button type="button" className={level === 'all' ? 'is-on' : ''} onClick={() => setLevel('all')} aria-pressed={level === 'all'}>{ui.allLevels}<span>{COURSES.length}</span></button>
            {LEVELS.slice(0, 5).map(l => (
              <button key={l} type="button" className={level === l ? 'is-on' : ''} onClick={() => setLevel(l)} aria-pressed={level === l}>
                <b>{l}</b> {h.levelNames[l]}<span>{COURSES.filter(c => c.levels.includes(l)).length}</span>
              </button>
            ))}
          </div>
          {list.length ? (
            <ul className="lx-grid">
              {list.map(c => <li key={c.id}><CourseCard course={c} lang={lang} /></li>)}
            </ul>
          ) : <p className="lx-empty">{h.noResult}</p>}
        </div>
      </section>

      {/* ── Teacher ── */}
      <section className="lp-section lx-teacher" aria-labelledby="lx-teacher-title">
        <div className="lp-wrap lx-teacher-grid">
          <div>
            <p className="lp-eyebrow is-light">{h.teacherEyebrow}</p>
            <h2 id="lx-teacher-title">{h.teacherTitle}</h2>
            <p>{h.teacherSub}</p>
            <ul>{h.teacherPoints.map(x => <li key={x}><CheckOutlined aria-hidden />{x}</li>)}</ul>
            <button type="button" className="lp-btn lp-btn-light lp-btn-lg" onClick={openDemo}>{ui.demo}<ArrowRightOutlined /></button>
          </div>
          <figure className="lx-teacher-img"><img src={imageUrl('teacher', 1200)} alt="" loading="lazy" width="1200" height="675" /></figure>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section" aria-labelledby="lx-faq-title">
        <div className="lp-wrap lp-faq-grid">
          <header className="lp-head is-left">
            <p className="lp-eyebrow">{h.faqEyebrow}</p>
            <h2 id="lx-faq-title">{h.faqTitle}</h2>
            <p className="lx-faq-time"><ClockCircleOutlined /> {lang === 'fr' ? '57 cours · 201 leçons · de 40 à 95 min par cours' : '57 courses · 201 lessons · 40 to 95 min per course'}</p>
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
