import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightOutlined, AudioOutlined, CalendarOutlined, CheckOutlined, CloseOutlined, CompassOutlined,
  CustomerServiceOutlined, DashboardOutlined, EditOutlined, ExperimentOutlined, FileTextOutlined, FolderOpenOutlined,
  ClockCircleOutlined, GlobalOutlined, LeftOutlined, MailOutlined, MessageOutlined, PlayCircleFilled, RightOutlined,
  RiseOutlined, SafetyCertificateOutlined, StarFilled, TeamOutlined, TrophyOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import SEO from '../SEO/SEO';
import { CONTACT_EMAIL, EXAM_NAMES, LANDING, PATHS, type Lang } from './landingContent';
import { landingJsonLd } from './landingSchema';
import { TOPIC_PATHS, type TopicId } from './sitePages';
import { TOPICS } from './topicContent';
import SiteHeader, { SECTIONS } from './SiteHeader';
import SiteFooter from './SiteFooter';
import { useDemoModal, usePublicPage } from './publicPage';
import './LandingPage.css';
// Imported (not in public/) so their file names carry a content hash: browsers
// can then keep them for a year, and a new version always has a new name.
import marksheet720 from '../../assets/landing/platform-marksheet-720.webp';
import marksheet960 from '../../assets/landing/platform-marksheet-960.webp';
import marksheet1600 from '../../assets/landing/platform-marksheet-1600.webp';
import dashboard800 from '../../assets/landing/platform-dashboard-800.webp';
import dashboard1400 from '../../assets/landing/platform-dashboard-1400.webp';
import video1Poster from '../../assets/landing/video1-poster.webp';
import video2Poster from '../../assets/landing/video2-poster.webp';

// ============================================================
// Public landing page (/, /fr/). Pre-rendered at build time: every section is
// real HTML before JavaScript runs; animations only enhance what is already there.
// ============================================================

// The pages that tell the whole story of each program.
const PROGRAM_TOPICS: Record<string, TopicId[]> = {
  canada: ['tcf-canada', 'tef-canada'],
  quebec: ['quebec'],
  diplomas: ['delf-dalf'],
  everyday: ['online', 'business', 'kids'],
};
// 720w is what a typical phone needs (about 380 px wide at 1.75x density).
const HERO_SRCSET = `${marksheet720} 720w, ${marksheet960} 960w, ${marksheet1600} 1600w`;
const HERO_SIZES = '(max-width: 900px) 92vw, 640px';
// Portrait phone recordings: shown in a 9:16 player so the speaker is never cropped.
const VIDEOS = [
  { src: '/assets/Video1.mp4', poster: video1Poster, duration: '1:04' },
  { src: '/assets/Video2.mp4', poster: video2Poster, duration: '0:47' },
];
const SKILL_ICONS = [<FileTextOutlined />, <CustomerServiceOutlined />, <EditOutlined />, <AudioOutlined />];
const METHOD_ICONS = [<GlobalOutlined />, <TrophyOutlined />, <CalendarOutlined />, <MessageOutlined />, <RiseOutlined />, <SafetyCertificateOutlined />];
const PLATFORM_ICONS = [<DashboardOutlined />, <EditOutlined />, <FileTextOutlined />, <ExperimentOutlined />, <FolderOpenOutlined />, <VideoCameraOutlined />];
const SIM_ICONS = [<AudioOutlined />, <EditOutlined />, <SafetyCertificateOutlined />];
const HOW_ICONS = [<CustomerServiceOutlined />, <CompassOutlined />, <TeamOutlined />, <TrophyOutlined />];
const NCLC_STEPS = [4, 5, 6, 7, 8, 9, 10];
const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const formatNumber = (n: number, lang: Lang) => n.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US').replace(/ /g, ' ');

/** Counts up once when the element scrolls into view (renders the final value without JS). */
function Counter({ value, suffix, lang }: { value: number; suffix: string; lang: Lang }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already visible: keep the final number
    setShown(0);
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1400);
        setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <span ref={ref}>{formatNumber(shown, lang)}{suffix}</span>;
}

interface Props { lang?: Lang }

const LandingPage: React.FC<Props> = ({ lang = 'en' }) => {
  const c = LANDING[lang];
  const other: Lang = lang === 'en' ? 'fr' : 'en';
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState('');
  const { openDemo, modal } = useDemoModal();
  usePublicPage(lang);
  const [program, setProgram] = useState(0);
  const [quote, setQuote] = useState(0);
  const [video, setVideo] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [announce, setAnnounce] = useState(true);
  const [suggest, setSuggest] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const quotePaused = useRef(false);

  // Offer the other language when the browser prefers it (never redirect: crawlers must see both pages).
  useEffect(() => {
    try {
      if (sessionStorage.getItem('lp_lang_hint')) return;
      const preferred = (navigator.languages?.[0] || navigator.language || '').slice(0, 2);
      setSuggest(preferred === other);
      setAnnounce(localStorage.getItem('lp_announce') !== 'closed');
    } catch { /* storage unavailable */ }
  }, [other]);

  // Active section in the navigation.
  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    SECTIONS.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  // Reveal-on-scroll.
  //
  // The rule that matters: a section may never stay invisible. An earlier
  // version watched a list of nodes captured once, so when React replaced one
  // — a language switch, the rotating quotes, the banner closing — the new
  // node was hidden with nobody watching it, and the section stayed blank
  // until the page was reloaded.
  //
  // This version asks the document itself on every frame that could matter
  // (scroll, resize, anchor jump, any change to the tree), and a short timer
  // reveals anything still hidden near the viewport. Missing a node is no
  // longer possible; the worst case is that it appears without its animation.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // With reduced motion nothing is ever hidden in the first place.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const reveal = (reach: number) => {
      frame = 0;
      const limit = window.innerHeight * reach;
      root.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)')
        .forEach(el => { if (el.getBoundingClientRect().top < limit) el.classList.add('is-in'); });
    };
    const scan = () => reveal(0.92);
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(scan); };

    scan();                          // what is already on screen never animates in
    root.classList.add('lp-animate');
    scan();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    // React replacing a node counts as a reason to look again.
    const tree = new MutationObserver(schedule);
    tree.observe(root, { childList: true, subtree: true });
    // Last resort, just after the first paint: anything near the viewport shows.
    const safety = window.setTimeout(() => reveal(1.6), 900);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
      tree.disconnect();
      window.clearTimeout(safety);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Rotating testimonials (paused on hover / focus, off with reduced motion).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => { if (!quotePaused.current) setQuote(q => (q + 1) % c.reviews.quotes.length); }, 7000);
    return () => window.clearInterval(id);
  }, [c.reviews.quotes.length]);

  const playVideo = (i: number) => {
    setVideo(i);
    setPlaying(true);
    requestAnimationFrame(() => videoRef.current?.play().catch(() => { /* user can press play */ }));
  };
  const closeSuggest = () => { setSuggest(false); try { sessionStorage.setItem('lp_lang_hint', '1'); } catch { /* ignore */ } };
  const closeAnnounce = () => { setAnnounce(false); try { localStorage.setItem('lp_announce', 'closed'); } catch { /* ignore */ } };

  const q = c.reviews.quotes[quote];

  return (
    <div className="lp" ref={rootRef} lang={lang}>
      <SEO
        lang={lang}
        title={c.meta.title}
        description={c.meta.description}
        path={PATHS[lang]}
        imageAlt={c.meta.ogAlt}
        alternates={{ en: PATHS.en, fr: PATHS.fr }}
        jsonLd={landingJsonLd(lang)}
      />
      <a href="#main" className="lp-skip">{c.skip}</a>

      {suggest && (
        <div className="lp-suggest" role="note">
          <span>{c.langSuggest.text}</span>
          <Link to={PATHS[other]} hrefLang={other} onClick={closeSuggest}>{c.langSuggest.link} <ArrowRightOutlined /></Link>
          <button type="button" onClick={closeSuggest} aria-label={c.langSuggest.dismiss}><CloseOutlined /></button>
        </div>
      )}

      {announce && (
        <div className="lp-announce">
          <div className="lp-wrap">
            <span className="lp-announce-tag">{c.announce.tag}</span>
            <span className="lp-announce-text">{c.announce.text}</span>
            <a href="#simulator" className="lp-announce-link">{c.announce.link} <ArrowRightOutlined /></a>
            <button type="button" className="lp-announce-close" onClick={closeAnnounce} aria-label={c.langSuggest.dismiss}><CloseOutlined /></button>
          </div>
        </div>
      )}

      <SiteHeader lang={lang} alternates={PATHS} active={active} onDemo={openDemo} />

      <main id="main">
        {/* ── Hero ── */}
        <section className="lp-hero" aria-labelledby="lp-hero-title">
          <div className="lp-hero-bg" aria-hidden />
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-eyebrow"><span className="lp-flag" aria-hidden />{c.hero.eyebrow}</p>
              <h1 id="lp-hero-title">{c.hero.before} <em>{c.hero.accent}</em> {c.hero.after}</h1>
              <p className="lp-hero-sub">{c.hero.sub}</p>
              <div className="lp-hero-ctas">
                <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={openDemo}>{c.hero.ctaPrimary}<ArrowRightOutlined /></button>
                <a href="#simulator" className="lp-btn lp-btn-ghost lp-btn-lg"><PlayCircleFilled />{c.hero.ctaSecondary}</a>
              </div>
              <ul className="lp-hero-trust">
                <li><span className="lp-stars" aria-hidden>{[0, 1, 2, 3, 4].map(i => <StarFilled key={i} />)}</span><strong>{c.hero.rating}</strong> {c.hero.ratingLabel}</li>
                <li><CheckOutlined aria-hidden /> {c.hero.pass}</li>
                <li><CheckOutlined aria-hidden /> {c.hero.students}</li>
              </ul>
            </div>

            <div className="lp-hero-visual">
              <figure className="lp-frame">
                <div className="lp-frame-bar" aria-hidden><i /><i /><i /><span>app.learnfrenchwithnatives.com</span></div>
                <img
                  src={marksheet1600}
                  srcSet={HERO_SRCSET}
                  sizes={HERO_SIZES}
                  width="1600"
                  height="900"
                  alt={c.hero.imageAlt}
                  fetchPriority="high"
                  decoding="async"
                />
              </figure>
              <div className="lp-float lp-float-result" aria-hidden>
                <span className="lp-float-label">{c.hero.cardResult.label}</span>
                <div className="lp-float-score"><strong>13</strong><span>/20</span><em>{c.hero.cardResult.level}</em><b>{c.hero.cardResult.nclc}</b></div>
                <div className="lp-float-track">{NCLC_STEPS.map(s => <i key={s} className={s <= 8 ? 'is-on' : ''} />)}</div>
              </div>
              <div className="lp-float lp-float-live" aria-hidden>
                <span className="lp-live-dot" />
                <div><strong>{c.hero.cardLive.title}</strong><span>{c.hero.cardLive.sub}</span></div>
              </div>
              <div className="lp-float lp-float-examiner" aria-hidden>
                <span className="lp-eq"><i /><i /><i /><i /><i /></span>
                {c.hero.cardExaminer}
              </div>
            </div>
          </div>
        </section>

        {/* ── Exams marquee ── */}
        <section className="lp-marquee" aria-label={c.marquee.label}>
          <p className="lp-marquee-label">{c.marquee.label}</p>
          <div className="lp-marquee-viewport">
            <ul className="lp-marquee-track">
              {[...EXAM_NAMES, ...EXAM_NAMES].map((name, i) => (
                <li key={i} aria-hidden={i >= EXAM_NAMES.length || undefined}>{name}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="lp-stats" aria-label={c.statsLabel}>
          <div className="lp-wrap lp-stats-grid">
            {c.stats.map(s => (
              <div key={s.label} className="lp-stat" data-reveal>
                <strong><Counter value={s.value} suffix={s.suffix} lang={lang} /></strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Programs ── */}
        <section id="programs" className="lp-section" aria-labelledby="lp-programs-title">
          <div className="lp-wrap">
            <header className="lp-head" data-reveal>
              <p className="lp-eyebrow">{c.programs.eyebrow}</p>
              <h2 id="lp-programs-title">{c.programs.title}</h2>
              <p>{c.programs.sub}</p>
            </header>
            <div className="lp-tabs" role="tablist" aria-label={c.programs.eyebrow} data-reveal>
              {c.programs.items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`lp-tab-${item.id}`}
                  aria-selected={program === i}
                  aria-controls={`lp-panel-${item.id}`}
                  tabIndex={program === i ? 0 : -1}
                  className={program === i ? 'is-active' : ''}
                  onClick={() => setProgram(i)}
                  onKeyDown={e => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                      const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + c.programs.items.length) % c.programs.items.length;
                      setProgram(next);
                      document.getElementById(`lp-tab-${c.programs.items[next].id}`)?.focus();
                    }
                  }}
                >
                  <span>{item.tab}</span>
                  <small>{item.exams}</small>
                </button>
              ))}
            </div>
            {c.programs.items.map((item, i) => (
              <div key={item.id} id={`lp-panel-${item.id}`} role="tabpanel" aria-labelledby={`lp-tab-${item.id}`} hidden={program !== i} className="lp-program">
                <div className="lp-program-main">
                  <p className="lp-program-exams">{item.exams}</p>
                  <h3>{item.title}</h3>
                  <p className="lp-program-desc">{item.desc}</p>
                  <h4>{c.programs.includes}</h4>
                  <ul className="lp-checks">{item.includes.map(x => <li key={x}><CheckOutlined aria-hidden />{x}</li>)}</ul>
                  {PROGRAM_TOPICS[item.id] && (
                    <p className="lp-program-links">
                      <span>{c.programs.learnMore}</span>
                      {PROGRAM_TOPICS[item.id].map(id => (
                        <Link key={id} to={TOPIC_PATHS[id][lang]}>{TOPICS[lang][id].name}<ArrowRightOutlined aria-hidden /></Link>
                      ))}
                    </p>
                  )}
                </div>
                <aside className="lp-program-card">
                  <dl>
                    <div><dt>{c.programs.goal}</dt><dd>{item.goal}</dd></div>
                    <div><dt>{c.programs.format}</dt><dd>{item.format}</dd></div>
                    <div><dt>{c.programs.levels}</dt><dd>{item.levels}</dd></div>
                  </dl>
                  <button type="button" className="lp-btn lp-btn-primary" onClick={openDemo}>{c.programs.cta}<ArrowRightOutlined /></button>
                </aside>
              </div>
            ))}
          </div>
        </section>

        {/* ── Simulator ── */}
        <section id="simulator" className="lp-section lp-dark" aria-labelledby="lp-sim-title">
          <div className="lp-wrap lp-sim-grid">
            <div className="lp-sim-copy" data-reveal>
              <p className="lp-eyebrow is-light">{c.simulator.eyebrow}</p>
              <h2 id="lp-sim-title">{c.simulator.title}</h2>
              <p className="lp-sim-sub">{c.simulator.sub}</p>
              <ul className="lp-sim-features">
                {c.simulator.features.map((f, i) => (
                  <li key={f.title}>
                    <span className="lp-sim-icon" aria-hidden>{SIM_ICONS[i]}</span>
                    <div><h3>{f.title}</h3><p>{f.desc}</p></div>
                  </li>
                ))}
              </ul>
              <button type="button" className="lp-btn lp-btn-light" onClick={openDemo}>{c.simulator.cta}<ArrowRightOutlined /></button>
            </div>
            <figure className="lp-report" data-reveal aria-label={c.simulator.report.title}>
              <header className="lp-report-head">
                <span>{c.simulator.report.title}</span>
                <span className="lp-report-badge">TCF Canada</span>
              </header>
              <div className="lp-report-score">
                <div><span>{c.simulator.report.scoreLabel}</span><strong>13<small>/20</small></strong></div>
                <div className="lp-report-badges"><b>{c.simulator.report.level}</b><b className="is-dark">{c.simulator.report.nclc}</b></div>
              </div>
              <ol className="lp-report-track" aria-label={c.simulator.report.track}>
                {NCLC_STEPS.map(s => (
                  <li key={s} className={`${s <= 8 ? 'is-on' : ''}${s === 8 ? ' is-here' : ''}`}><i /><span>{c.simulator.report.track} {s}</span></li>
                ))}
              </ol>
              <ul className="lp-report-criteria">
                {c.simulator.report.criteria.map(([label, score]) => (
                  <li key={label}>
                    <span>{label}</span>
                    <span className="lp-bar"><i style={{ '--w': `${(score / 20) * 100}%` } as React.CSSProperties} /></span>
                    <b>{String(score).replace('.', lang === 'fr' ? ',' : '.')}</b>
                  </li>
                ))}
              </ul>
              <p className="lp-report-next"><RiseOutlined /> {c.simulator.report.next}</p>
              <figcaption>{c.simulator.disclaimer}</figcaption>
            </figure>
          </div>
        </section>

        {/* ── Method ── */}
        {/* ── The four papers ── */}
        <section id="skills" className="lp-section lp-tint" aria-labelledby="lp-skills-title">
          <div className="lp-wrap">
            <header className="lp-head" data-reveal>
              <p className="lp-eyebrow">{c.skills.eyebrow}</p>
              <h2 id="lp-skills-title">{c.skills.title}</h2>
              <p>{c.skills.sub}</p>
            </header>
            <div className="lp-skills">
              {c.skills.items.map((s, i) => (
                <article key={s.code} className={`lp-skill is-${s.code.toLowerCase()}`} data-reveal>
                  <header>
                    <span className="lp-skill-icon" aria-hidden>{SKILL_ICONS[i]}</span>
                    <span className="lp-skill-code">{s.code}</span>
                  </header>
                  <h3>{s.name}</h3>
                  <p className="lp-skill-label">{s.label}</p>
                  <p className="lp-skill-desc">{s.desc}</p>
                  <ul className="lp-skill-meta">
                    <li><ClockCircleOutlined aria-hidden /> {s.format}</li>
                    <li><TrophyOutlined aria-hidden /> {s.score}</li>
                  </ul>
                </article>
              ))}
            </div>
            <div className="lp-skills-foot" data-reveal>
              <div>
                <h3>{c.skills.foot.title}</h3>
                <p>{c.skills.foot.desc}</p>
              </div>
              <button type="button" className="lp-btn lp-btn-primary" onClick={openDemo}>{c.skills.cta}<ArrowRightOutlined /></button>
            </div>
          </div>
        </section>

        <section id="method" className="lp-section" aria-labelledby="lp-method-title">
          <div className="lp-wrap">
            <header className="lp-head" data-reveal>
              <p className="lp-eyebrow">{c.method.eyebrow}</p>
              <h2 id="lp-method-title">{c.method.title}</h2>
              <p>{c.method.sub}</p>
            </header>
            <div className="lp-bento">
              {c.method.items.map((m, i) => (
                <article key={m.title} className={`lp-bento-card is-${i + 1}`} data-reveal>
                  <span className="lp-bento-icon" aria-hidden>{METHOD_ICONS[i]}</span>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                  {i === 0 && <div className="lp-bento-figure" aria-hidden><strong>15+</strong><span>{c.stats[2].label}</span></div>}
                  {i === 4 && (
                    <ol className="lp-ladder" aria-hidden>
                      {CEFR.map((l, k) => <li key={l} style={{ '--h': `${30 + k * 14}%` } as React.CSSProperties}><i /><span>{l}</span></li>)}
                    </ol>
                  )}
                  {i === 5 && <div className="lp-bento-figure is-big" aria-hidden><strong>98%</strong></div>}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Platform ── */}
        <section id="platform" className="lp-section lp-tint" aria-labelledby="lp-platform-title">
          <div className="lp-wrap lp-platform-grid">
            <div className="lp-platform-copy">
              <header className="lp-head is-left" data-reveal>
                <p className="lp-eyebrow">{c.platform.eyebrow}</p>
                <h2 id="lp-platform-title">{c.platform.title}</h2>
                <p>{c.platform.sub}</p>
              </header>
              <ul className="lp-platform-list">
                {c.platform.features.map((f, i) => (
                  <li key={f.title} data-reveal>
                    <span aria-hidden>{PLATFORM_ICONS[i]}</span>
                    <div><h3>{f.title}</h3><p>{f.desc}</p></div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lp-shots" data-reveal>
              <figure className="lp-shot is-back">
                <img src={dashboard800} srcSet={`${dashboard800} 800w, ${dashboard1400} 1084w`} sizes="(max-width: 900px) 80vw, 520px" width="1084" height="795" alt={c.platform.altDashboard} loading="lazy" decoding="async" />
              </figure>
              <figure className="lp-shot is-front">
                <img src={marksheet960} srcSet={HERO_SRCSET} sizes="(max-width: 900px) 84vw, 560px" width="1600" height="900" alt={c.platform.altMarksheet} loading="lazy" decoding="async" />
              </figure>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="lp-section" aria-labelledby="lp-how-title">
          <div className="lp-wrap">
            <header className="lp-head" data-reveal>
              <p className="lp-eyebrow">{c.how.eyebrow}</p>
              <h2 id="lp-how-title">{c.how.title}</h2>
              <p>{c.how.sub}</p>
            </header>
            <ol className="lp-steps" data-reveal>
              {c.how.steps.map((s, i) => (
                <li key={s.title} className="lp-step">
                  <span className="lp-step-dot" aria-hidden>{HOW_ICONS[i]}</span>
                  <span className="lp-step-n">{c.how.step} {i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section id="reviews" className="lp-section lp-tint" aria-labelledby="lp-reviews-title">
          <div className="lp-wrap">
            <header className="lp-head" data-reveal>
              <p className="lp-eyebrow">{c.reviews.eyebrow}</p>
              <h2 id="lp-reviews-title">{c.reviews.title}</h2>
              <p>{c.reviews.sub}</p>
            </header>
            <div className="lp-reviews-grid">
              <div className="lp-video-card" data-reveal>
                <div className="lp-video">
                  {playing ? (
                    <video ref={videoRef} key={VIDEOS[video].src} controls playsInline preload="metadata" poster={VIDEOS[video].poster}>
                      <source src={VIDEOS[video].src} type="video/mp4" />
                    </video>
                  ) : (
                    <button type="button" className="lp-video-poster" onClick={() => playVideo(video)} aria-label={`${c.reviews.play}: ${c.reviews.videos[video].title}`}>
                      <img src={VIDEOS[video].poster} alt="" width={480} height={848} loading="lazy" decoding="async" />
                      <span className="lp-video-play"><PlayCircleFilled /></span>
                      <span className="lp-video-time">{VIDEOS[video].duration}</span>
                    </button>
                  )}
                </div>
                <div className="lp-video-side">
                  <p className="lp-video-kicker"><span className="lp-live-dot" />{c.reviews.videoLabel}</p>
                  <div className="lp-video-switch">
                    {c.reviews.videos.map((v, i) => (
                      <button key={v.title} type="button" className={video === i ? 'is-active' : ''} aria-pressed={video === i}
                        onClick={() => (playing ? playVideo(i) : setVideo(i))}>
                        <span className="lp-video-thumb">
                          <img src={VIDEOS[i].poster} alt="" width={480} height={848} loading="lazy" decoding="async" />
                          <PlayCircleFilled />
                        </span>
                        <span className="lp-video-meta"><strong>{v.title}</strong><span>{v.desc}</span><em>{VIDEOS[i].duration}</em></span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lp-quotes" data-reveal
                onMouseEnter={() => { quotePaused.current = true; }} onMouseLeave={() => { quotePaused.current = false; }}
                onFocus={() => { quotePaused.current = true; }} onBlur={() => { quotePaused.current = false; }}>
                <div className="lp-rating">
                  <strong>{c.hero.rating.split('/')[0]}</strong>
                  <div><span className="lp-stars" aria-hidden>{[0, 1, 2, 3, 4].map(i => <StarFilled key={i} />)}</span><span>{c.reviews.summary}</span></div>
                </div>
                <figure className="lp-quote" aria-live="polite">
                  <blockquote key={quote}>“{q.text}”</blockquote>
                  <figcaption>
                    <span className="lp-avatar" aria-hidden>{q.name.charAt(0)}</span>
                    <span><strong>{q.name}</strong><em>{q.role}</em></span>
                    {q.exam && <b>{q.exam}</b>}
                  </figcaption>
                </figure>
                <div className="lp-quote-nav">
                  <button type="button" onClick={() => setQuote(i => (i - 1 + c.reviews.quotes.length) % c.reviews.quotes.length)} aria-label={c.reviews.prev}><LeftOutlined /></button>
                  <div className="lp-dots">
                    {c.reviews.quotes.map((x, i) => (
                      <button key={x.name} type="button" className={i === quote ? 'is-active' : ''} onClick={() => setQuote(i)} aria-label={`${x.name}`} aria-current={i === quote || undefined} />
                    ))}
                  </div>
                  <button type="button" onClick={() => setQuote(i => (i + 1) % c.reviews.quotes.length)} aria-label={c.reviews.next}><RightOutlined /></button>
                </div>
                {/* All testimonials stay in the HTML for search engines and screen readers. */}
                <ul className="lp-visually-hidden">
                  {c.reviews.quotes.map(x => <li key={x.name}>{x.name}, {x.role}: {x.text}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="lp-section" aria-labelledby="lp-faq-title">
          <div className="lp-wrap lp-faq-grid">
            <header className="lp-head is-left" data-reveal>
              <p className="lp-eyebrow">{c.faq.eyebrow}</p>
              <h2 id="lp-faq-title">{c.faq.title}</h2>
              <p>{c.faq.sub}</p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="lp-faq-mail"><MailOutlined /> {c.faq.more}</a>
            </header>
            <div className="lp-faq-list" data-reveal>
              {c.faq.items.map((item, i) => (
                <details key={item.q} className="lp-faq-item" open={i === 0 || undefined}>
                  <summary><h3>{item.q}</h3><span className="lp-faq-icon" aria-hidden /></summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final call to action ── */}
        <section className="lp-finale" aria-labelledby="lp-finale-title">
          <div className="lp-wrap lp-finale-inner" data-reveal>
            <h2 id="lp-finale-title">{c.finale.title}</h2>
            <p>{c.finale.sub}</p>
            <div className="lp-finale-ctas">
              <button type="button" className="lp-btn lp-btn-light lp-btn-lg" onClick={openDemo}>{c.finale.cta}<ArrowRightOutlined /></button>
              <a href="/login" className="lp-finale-login">{c.finale.login}</a>
            </div>
            <p className="lp-finale-trust"><SafetyCertificateOutlined /> {c.finale.trust}</p>
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} onDemo={openDemo} />

      {modal}
    </div>
  );
};

export default LandingPage;
