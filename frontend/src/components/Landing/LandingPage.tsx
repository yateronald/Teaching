import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  StarFilled,
  RightOutlined,
  LeftOutlined,
  PlayCircleOutlined,
  GlobalOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  BookOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  AimOutlined,
  ReadOutlined,
  AudioOutlined,
  SolutionOutlined,
  SmileOutlined,
  DashboardOutlined,
  FormOutlined,
  BarChartOutlined,
  ProfileOutlined,
  FolderOpenOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  MailOutlined,
  DownOutlined,
  CheckOutlined,
  LineChartOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ASSET_PATHS } from '../../utils/assets';
import DemoRequestModal from './DemoRequestModal';
import SEO from '../SEO/SEO';
import './LandingPage.css';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  exam?: string;
  video?: string;
}

const NAV_IDS = ['why', 'platform', 'exams', 'how', 'testimonials'];

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  const [langOpen, setLangOpen] = useState(false);
  const langSwitcherRef = useRef<HTMLDivElement | null>(null);

  // Close the language popup when clicking outside it (avoids the onBlur race
  // that previously caused option clicks to be swallowed before changeLanguage
  // could fire).
  useEffect(() => {
    if (!langOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (langSwitcherRef.current && !langSwitcherRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [langOpen]);

  const handleSelectLang = (lng: 'en' | 'fr') => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
      try { localStorage.setItem('i18n_lang', lng); } catch { /* ignore */ }
    }
    setLangOpen(false);
  };

  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('');

  // Platform tour: track which feature is active while scrolling
  const [activeFeature, setActiveFeature] = useState(0);
  const featureItemsRef = useRef<Array<HTMLDivElement | null>>([]);

  // How It Works: track which step is active while scrolling
  const [activeStep, setActiveStep] = useState(0);
  const stepItemsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const onScrollSections = () => {
      // The "anchor line" is at 45% of the viewport height.
      // The item whose center is closest to that line wins.
      const anchor = window.innerHeight * 0.45;

      const pick = (els: Array<HTMLDivElement | null>) => {
        const items = els.filter(Boolean) as HTMLDivElement[];
        if (items.length === 0) return -1;
        let bestIdx = 0;
        let bestDist = Infinity;
        items.forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const dist = Math.abs(center - anchor);
          if (rect.top < anchor + rect.height && dist < bestDist) {
            bestDist = dist;
            bestIdx = idx;
          }
        });
        return bestIdx;
      };

      const f = pick(featureItemsRef.current);
      if (f >= 0) setActiveFeature(f);
      const s = pick(stepItemsRef.current);
      if (s >= 0) setActiveStep(s);
    };
    window.addEventListener('scroll', onScrollSections, { passive: true });
    onScrollSections();
    return () => window.removeEventListener('scroll', onScrollSections);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      let current = '';
      for (const id of NAV_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActiveNav(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const testimonials: Testimonial[] = [
    {
      name: t('reviews.video_label'),
      role: t('reviews.video_1_role'),
      content: t('reviews.video_1_content'),
      rating: 5,
      video: ASSET_PATHS.VIDEOS.VIDEO1,
    },
    {
      name: t('reviews.video_label'),
      role: t('reviews.video_2_role'),
      content: t('reviews.video_2_content'),
      rating: 5,
      video: ASSET_PATHS.VIDEOS.VIDEO2,
    },
    { name: "Aarav Sharma", role: "TEF Canada Candidate", content: "Scored CLB 9 in speaking! Classes were structured, patient, and truly native. Practice felt like real-life conversations — exactly what I needed.", rating: 5, exam: "TEF Canada" },
    { name: "Priya Patel", role: "DELF B2 Graduate", content: "Cleared DELF B2 on my first attempt. Mock exams and feedback were spot on. The teacher's corrections improved my fluency fast.", rating: 5, exam: "DELF B2" },
    { name: "Rohan Mehta", role: "Business Professional", content: "Needed French for clients in Quebec. Flexible scheduling and industry vocabulary focus helped me present confidently in French within months.", rating: 5 },
    { name: "Sneha Kapoor", role: "Student", content: "The step-by-step curriculum and native accents made learning enjoyable. Speaking clubs boosted my confidence in just weeks!", rating: 5 },
    { name: "Arjun Iyer", role: "TCF Candidate", content: "Clear strategies for TCF listening and speaking. My scores improved quickly thanks to targeted feedback and daily practice.", rating: 5, exam: "TCF" },
  ];

  const next = () => setCurrentTestimonial((p) => (p + 1) % testimonials.length);
  const prev = () => setCurrentTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length);
  const openModal = () => setIsModalOpen(true);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const currentReview = testimonials[currentTestimonial];

  // FAQ items — rendered on the page AND emitted as FAQPage JSON-LD so the
  // structured data always matches the visible content (a Google requirement
  // for FAQ rich results).
  const faqItems = [1, 2, 3, 4, 5, 6].map((n) => ({
    q: t(`faq.q${n}`),
    a: t(`faq.a${n}`),
  }));

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const featureTitles = [
    t('platform.features.dashboard.title'),
    t('platform.features.quiz.title'),
    t('platform.features.results.title'),
    t('platform.features.bulletin.title'),
    t('platform.features.resources.title'),
    t('platform.features.schedule.title'),
    t('platform.features.exams.title'),
    t('platform.features.live.title'),
  ];

  return (
    <div className="lp">
      <SEO />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      {/* Skip-to-main link for keyboard users and accessibility */}
      <a href="#main-content" className="lp-skip-link">Skip to main content</a>

      {/* HEADER */}
      <header className={`lp-header${scrolled ? ' lp-header--scrolled' : ''}`}>
        <div className="lp-tricolore" aria-hidden="true">
          <span /><span /><span />
        </div>
        <div className="lp-container lp-header-inner">
          <a href="/" className="lp-logo" aria-label="Accueil">
            <span className="lp-logo-mark">
              <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" />
            </span>
            <span className="lp-logo-text">
              <strong>Learn French</strong>
              <em>with Natives</em>
            </span>
          </a>

          <nav className="lp-nav" aria-label="Main navigation">
            {[
              { id: 'why', label: t('nav.why') },
              { id: 'platform', label: t('nav.platform') },
              { id: 'exams', label: t('nav.exams') },
              { id: 'how', label: t('nav.how') },
              { id: 'testimonials', label: t('nav.testimonials') },
            ].map((n) => (
              <button key={n.id} className={`lp-nav-link${activeNav === n.id ? ' active' : ''}`} onClick={() => go(n.id)}>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="lp-nav-actions">
            {/* Language switcher dropdown */}
            <div ref={langSwitcherRef} className={`lp-lang${langOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="lp-lang-toggle"
                onClick={() => setLangOpen((o) => !o)}
                aria-label="Switch language"
                aria-expanded={langOpen}
              >
                <GlobalOutlined />
                <span>{i18n.language === 'en' ? 'EN' : 'FR'}</span>
                <DownOutlined className="lp-lang-chevron" />
              </button>
              {langOpen && (
                <div className="lp-lang-dropdown">
                  <button
                    type="button"
                    className={`lp-lang-option${i18n.language === 'en' ? ' is-active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); handleSelectLang('en'); }}
                  >
                    English
                    {i18n.language === 'en' && <CheckOutlined />}
                  </button>
                  <button
                    type="button"
                    className={`lp-lang-option${i18n.language === 'fr' ? ' is-active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); handleSelectLang('fr'); }}
                  >
                    Français
                    {i18n.language === 'fr' && <CheckOutlined />}
                  </button>
                </div>
              )}
            </div>
            <a href="/login" className="lp-nav-login">{t('nav.login')}</a>
            <button className="lp-btn lp-btn--primary lp-nav-cta" onClick={openModal}>
              {t('nav.demo')}
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">

      {/* HERO */}
      <section className="lp-hero" aria-label="Hero — Learn French with Native Teachers">
        <div className="lp-container lp-hero-inner">
          {/* Left — editorial content */}
          <div className="lp-hero-content">
            <p className="lp-eyebrow">
              <span className="lp-eyebrow-dash" aria-hidden="true" />
              {t('hero.badge')} · 1 000+ étudiants
            </p>
            <h1 className="lp-hero-title">
              {t('hero.title_1')}{' '}
              <em className="lp-hero-accent">{t('hero.title_accent')}</em>{' '}
              {t('hero.title_2')}
            </h1>
            <p className="lp-hero-sub">{t('hero.sub')}</p>

            <div className="lp-hero-actions">
              <button className="lp-btn lp-btn--primary lp-btn--lg" onClick={openModal}>
                {t('hero.cta_primary')}
                <RightOutlined aria-hidden="true" />
              </button>
              <button className="lp-btn lp-btn--ghost lp-btn--lg" onClick={() => go('how')}>
                {t('hero.cta_secondary')}
              </button>
            </div>

            <dl className="lp-hero-stats">
              <div className="lp-hero-stat">
                <dt>{t('hero.stat_pass')}</dt>
                <dd>98%</dd>
              </div>
              <div className="lp-hero-stat">
                <dt>{t('hero.stat_teachers')}</dt>
                <dd>15+</dd>
              </div>
              <div className="lp-hero-stat">
                <dt>500+ {t('hero.stat_reviews')}</dt>
                <dd>
                  4,9<span className="lp-hero-stat-small">/5</span>
                  <StarFilled className="lp-hero-stat-star" aria-hidden="true" />
                </dd>
              </div>
            </dl>
          </div>

          {/* Right — platform showcase */}
          <div className="lp-hero-visual">
            <figure className="lp-hero-frame">
              <img
                src="/assets/French_Platform1.png"
                alt="Learn French with Natives platform dashboard — track scores, take quizzes, attend live classes"
                width="1200"
                height="780"
                fetchPriority="high"
                decoding="async"
              />
            </figure>

            <div className="lp-hero-captions">
              <div className="lp-hero-caption">
                <span className="lp-hero-caption-icon"><LineChartOutlined /></span>
                <span className="lp-hero-caption-text">
                  <strong>{t('chip_exams.title')}</strong>
                  <span>{t('chip_exams.sub')}</span>
                </span>
              </div>
              <div className="lp-hero-caption">
                <span className="lp-hero-caption-icon lp-hero-caption-icon--live">
                  <span className="lp-live-dot" aria-hidden="true" />
                </span>
                <span className="lp-hero-caption-text">
                  <strong>{t('chip_live.title')}</strong>
                  <span>{t('chip_live.sub')}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="lp-stats" aria-label="Key statistics">
        <div className="lp-container lp-stats-grid">
          {[
            { num: '1 000+', label: t('stats.students') },
            { num: '98%', label: t('stats.pass') },
            { num: '15+', label: t('stats.teachers') },
            { num: '10 000+', label: t('stats.hours') },
          ].map((s, i) => (
            <div key={i} className="lp-stat">
              <span className="lp-stat-num">{s.num}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section id="why" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">
              <span className="lp-eyebrow-dash" aria-hidden="true" />
              {t('why.label')}
            </p>
            <h2 className="lp-heading">{t('why.title')}</h2>
            <p className="lp-subheading">{t('why.sub')}</p>
          </div>

          <div className="lp-why-grid">
            {[
              { icon: <GlobalOutlined />, title: t('why.f1.title'), desc: t('why.f1.desc') },
              { icon: <TrophyOutlined />, title: t('why.f2.title'), desc: t('why.f2.desc') },
              { icon: <ClockCircleOutlined />, title: t('why.f3.title'), desc: t('why.f3.desc') },
              { icon: <CustomerServiceOutlined />, title: t('why.f4.title'), desc: t('why.f4.desc') },
              { icon: <BookOutlined />, title: t('why.f5.title'), desc: t('why.f5.desc') },
              { icon: <SafetyCertificateOutlined />, title: t('why.f6.title'), desc: t('why.f6.desc') },
            ].map((f, i) => (
              <article key={i} className="lp-why-card">
                <span className="lp-why-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="lp-why-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM TOUR — sticky screenshot left, scroll-revealed features right */}
      <section id="platform" className="lp-platform">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">
              <span className="lp-eyebrow-dash" aria-hidden="true" />
              {t('platform.label')}
            </p>
            <h2 className="lp-heading">{t('platform.title')}</h2>
            <p className="lp-subheading">{t('platform.sub')}</p>
          </div>

          <div className="lp-platform-grid">
            {/* LEFT — sticky screenshot */}
            <div className="lp-platform-sticky">
              <figure className="lp-platform-frame">
                <div className="lp-platform-chrome" aria-hidden="true">
                  <span className="lp-chrome-dot" />
                  <span className="lp-chrome-dot" />
                  <span className="lp-chrome-dot" />
                  <span className="lp-chrome-url">app.learnfrenchwithnatives.com</span>
                </div>
                <img
                  src="/assets/french%20platform.png"
                  alt="Student dashboard showing score tracking, quizzes, resources and live classes"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="lp-platform-caption">
                  <span className="lp-platform-caption-num">{String(activeFeature + 1).padStart(2, '0')}</span>
                  <span className="lp-platform-caption-title">{featureTitles[activeFeature]}</span>
                  <span className="lp-platform-caption-count">{activeFeature + 1} / 8</span>
                </figcaption>
              </figure>

              <div className="lp-platform-progress" aria-label="Platform features">
                {featureTitles.map((title, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={title}
                    onClick={() => featureItemsRef.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    className={`lp-platform-dot${i === activeFeature ? ' is-active' : ''}`}
                  />
                ))}
                <span className="lp-platform-progress-label">
                  {String(activeFeature + 1).padStart(2, '0')} / 08
                </span>
              </div>
            </div>

            {/* RIGHT — feature stack */}
            <div className="lp-platform-features">
              {[
                {
                  icon: <DashboardOutlined />,
                  title: t('platform.features.dashboard.title'),
                  desc: t('platform.features.dashboard.desc'),
                  bullets: (t('platform.features.dashboard.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <FormOutlined />,
                  title: t('platform.features.quiz.title'),
                  desc: t('platform.features.quiz.desc'),
                  bullets: (t('platform.features.quiz.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <BarChartOutlined />,
                  title: t('platform.features.results.title'),
                  desc: t('platform.features.results.desc'),
                  bullets: (t('platform.features.results.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <ProfileOutlined />,
                  title: t('platform.features.bulletin.title'),
                  desc: t('platform.features.bulletin.desc'),
                  bullets: (t('platform.features.bulletin.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <FolderOpenOutlined />,
                  title: t('platform.features.resources.title'),
                  desc: t('platform.features.resources.desc'),
                  bullets: (t('platform.features.resources.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <CalendarOutlined />,
                  title: t('platform.features.schedule.title'),
                  desc: t('platform.features.schedule.desc'),
                  bullets: (t('platform.features.schedule.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <ExperimentOutlined />,
                  title: t('platform.features.exams.title'),
                  desc: t('platform.features.exams.desc'),
                  bullets: (t('platform.features.exams.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <VideoCameraOutlined />,
                  title: t('platform.features.live.title'),
                  desc: t('platform.features.live.desc'),
                  bullets: (t('platform.features.live.bullets', { returnObjects: true }) as string[]),
                },
              ].map((f, i) => (
                <div
                  key={i}
                  ref={(el) => { featureItemsRef.current[i] = el; }}
                  className={`lp-platform-feature${i === activeFeature ? ' is-active' : ''}`}
                >
                  <div className="lp-platform-feature-rail" aria-hidden="true">
                    <span className="lp-platform-feature-num">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {i < 7 && <span className="lp-platform-feature-connector" />}
                  </div>
                  <div className="lp-platform-feature-card">
                    <div className="lp-platform-feature-head">
                      <span className="lp-platform-feature-icon">{f.icon}</span>
                      <h3>{f.title}</h3>
                    </div>
                    <p>{f.desc}</p>
                    <ul className="lp-checklist">
                      {f.bullets.map((b, j) => (
                        <li key={j}>
                          <CheckOutlined aria-hidden="true" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXAMS */}
      <section id="exams" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">
              <span className="lp-eyebrow-dash" aria-hidden="true" />
              {t('exams.label')}
            </p>
            <h2 className="lp-heading">{t('exams.title')}</h2>
            <p className="lp-subheading">{t('exams.sub')}</p>
          </div>

          <div className="lp-exams-layout">
            {/* Featured — TEF Canada */}
            <article className="lp-exam-featured">
              <div className="lp-tricolore" aria-hidden="true">
                <span /><span /><span />
              </div>
              <p className="lp-exam-featured-tag">{t('exams.most_popular')}</p>
              <h3 className="lp-exam-featured-title">TEF Canada</h3>
              <p className="lp-exam-featured-sub">{t('exams.tef_sub')}</p>
              <p className="lp-exam-featured-desc">{t('exams.tef_desc')}</p>

              <ul className="lp-exam-featured-skills">
                {[
                  { icon: <AudioOutlined />, label: t('exams.skill_speaking') },
                  { icon: <CustomerServiceOutlined />, label: t('exams.skill_listening') },
                  { icon: <ReadOutlined />, label: t('exams.skill_reading') },
                  { icon: <SolutionOutlined />, label: t('exams.skill_writing') },
                ].map((s, i) => (
                  <li key={i}>
                    {s.icon}
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>

              <dl className="lp-exam-featured-stats">
                <div>
                  <dd>98%</dd>
                  <dt>{t('exams.tef_stat1')}</dt>
                </div>
                <div>
                  <dd>500+</dd>
                  <dt>{t('exams.tef_stat2')}</dt>
                </div>
                <div>
                  <dd>10+</dd>
                  <dt>{t('exams.tef_stat3')}</dt>
                </div>
              </dl>

              <button className="lp-btn lp-btn--light lp-btn--lg" onClick={openModal}>
                {t('exams.cta')}
                <RightOutlined aria-hidden="true" />
              </button>
            </article>

            {/* Other programs */}
            <div className="lp-exam-list">
              {[
                {
                  icon: <SafetyCertificateOutlined />,
                  title: 'DELF / DALF', sub: t('exams.delf_sub'),
                  desc: t('exams.delf_desc'),
                  tags: ['A1–B2', 'C1–C2', t('exams.tag_mock')],
                },
                {
                  icon: <AimOutlined />,
                  title: 'TCF / TEFAQ', sub: t('exams.tcf_sub'),
                  desc: t('exams.tcf_desc'),
                  tags: ['TCF Québec', 'TEFAQ', t('exams.tag_oral')],
                },
                {
                  icon: <TeamOutlined />,
                  title: t('exams.business_title'), sub: t('exams.business_sub'),
                  desc: t('exams.business_desc'),
                  tags: [t('exams.tag_meetings'), t('exams.tag_presentations'), 'Emails'],
                },
                {
                  icon: <AudioOutlined />,
                  title: t('exams.conv_title'), sub: t('exams.conv_sub'),
                  desc: t('exams.conv_desc'),
                  tags: [t('exams.tag_pronunciation'), t('exams.tag_culture'), t('exams.tag_fluency')],
                },
                {
                  icon: <SmileOutlined />,
                  title: t('exams.kids_title'), sub: t('exams.kids_sub'),
                  desc: t('exams.kids_desc'),
                  tags: [t('exams.tag_interactive'), t('exams.tag_fun'), t('exams.tag_ageadapted')],
                },
              ].map((c, i) => (
                <article key={i} className="lp-exam-tile">
                  <span className="lp-exam-tile-icon">{c.icon}</span>
                  <div className="lp-exam-tile-content">
                    <header className="lp-exam-tile-head">
                      <h4>{c.title}</h4>
                      <span className="lp-exam-tile-sub">{c.sub}</span>
                    </header>
                    <p>{c.desc}</p>
                    <div className="lp-exam-tile-tags">
                      {c.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — sticky illustration left, timeline right */}
      <section id="how" className="lp-howit">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">
              <span className="lp-eyebrow-dash" aria-hidden="true" />
              {t('how.label')}
            </p>
            <h2 className="lp-heading">{t('how.title')}</h2>
            <p className="lp-subheading">{t('how.sub')}</p>
          </div>

          <div className="lp-howit-grid">
            {/* LEFT — sticky illustration */}
            <div className="lp-howit-sticky">
              <figure className="lp-howit-figure">
                <img
                  src="/assets/how.png"
                  alt="French learning journey: book demo, get a plan, learn with native teacher, pass your exam"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption className="lp-howit-caption">
                  <span className="lp-howit-caption-num">{String(activeStep + 1).padStart(2, '0')}</span>
                  <span className="lp-howit-caption-text">
                    <strong>{t('how.step_label')} {activeStep + 1} / 4</strong>
                    <span>
                      {[
                        t('how.steps.demo.title'),
                        t('how.steps.plan.title'),
                        t('how.steps.learn.title'),
                        t('how.steps.pass.title'),
                      ][activeStep]}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </div>

            {/* RIGHT — vertical timeline */}
            <div className="lp-howit-steps">
              {[
                {
                  icon: <PhoneOutlined />,
                  title: t('how.steps.demo.title'),
                  desc: t('how.steps.demo.desc'),
                  bullets: [t('how.steps.demo.b1'), t('how.steps.demo.b2'), t('how.steps.demo.b3')],
                },
                {
                  icon: <SolutionOutlined />,
                  title: t('how.steps.plan.title'),
                  desc: t('how.steps.plan.desc'),
                  bullets: [t('how.steps.plan.b1'), t('how.steps.plan.b2'), t('how.steps.plan.b3')],
                },
                {
                  icon: <VideoCameraOutlined />,
                  title: t('how.steps.learn.title'),
                  desc: t('how.steps.learn.desc'),
                  bullets: [t('how.steps.learn.b1'), t('how.steps.learn.b2'), t('how.steps.learn.b3')],
                },
                {
                  icon: <TrophyOutlined />,
                  title: t('how.steps.pass.title'),
                  desc: t('how.steps.pass.desc'),
                  bullets: [t('how.steps.pass.b1'), t('how.steps.pass.b2'), t('how.steps.pass.b3')],
                },
              ].map((s, i) => (
                <div
                  key={i}
                  ref={(el) => { stepItemsRef.current[i] = el; }}
                  className={`lp-howit-step${i === activeStep ? ' is-active' : ''}${i < activeStep ? ' is-done' : ''}`}
                >
                  <div className="lp-howit-step-rail" aria-hidden="true">
                    <span className="lp-howit-step-dot">{i + 1}</span>
                    {i < 3 && <span className="lp-howit-step-connector" />}
                  </div>

                  <div className="lp-howit-step-card">
                    <p className="lp-howit-step-tag">
                      {s.icon}
                      {t('how.step_label')} {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <ul className="lp-checklist">
                      {s.bullets.map((b, j) => (
                        <li key={j}>
                          <CheckOutlined aria-hidden="true" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {/* Final CTA card */}
              <div className="lp-howit-cta">
                <div>
                  <h4>{t('how.cta_title')}</h4>
                  <p>{t('how.cta_sub')}</p>
                </div>
                <button className="lp-btn lp-btn--light" onClick={openModal}>
                  {t('how.cta_btn')}
                  <RightOutlined aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="lp-reviews lp-section--cream">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">
              <span className="lp-eyebrow-dash" aria-hidden="true" />
              {t('reviews.label')}
            </p>
            <h2 className="lp-heading">{t('reviews.title')}</h2>
            <p className="lp-subheading">{t('reviews.sub')}</p>
          </div>

          <div className="lp-reviews-stage">
            <div className={`lp-reviews-card${currentReview.video ? ' lp-reviews-card--video' : ''}`}>
              {currentReview.video ? (
                <>
                  <div className="lp-reviews-media">
                    <video
                      key={currentReview.video}
                      controls
                      preload="metadata"
                      playsInline
                      muted
                    >
                      {/* #t=0.1 forces browsers to render the first frame as the visible thumbnail */}
                      <source src={`${currentReview.video}#t=0.1`} type="video/mp4" />
                    </video>
                    <span className="lp-reviews-media-tag">
                      <span className="lp-live-dot" aria-hidden="true" />
                      {t('reviews.video_label')}
                    </span>
                  </div>
                  <div className="lp-reviews-body">
                    <div className="lp-stars" aria-label={`${currentReview.rating} / 5`}>
                      {[...Array(currentReview.rating)].map((_, i) => <StarFilled key={i} />)}
                    </div>
                    <h3 className="lp-reviews-quote">{currentReview.role}</h3>
                    <p className="lp-reviews-text">{currentReview.content}</p>
                    <p className="lp-reviews-meta">
                      <PlayCircleOutlined aria-hidden="true" />
                      {t('reviews.video_meta')}
                    </p>
                  </div>
                </>
              ) : (
                <div className="lp-reviews-body lp-reviews-body--quote">
                  <span className="lp-reviews-mark" aria-hidden="true">«</span>
                  <div className="lp-stars" aria-label={`${currentReview.rating} / 5`}>
                    {[...Array(currentReview.rating)].map((_, i) => <StarFilled key={i} />)}
                  </div>
                  <blockquote className="lp-reviews-text lp-reviews-text--lg">
                    {currentReview.content}
                  </blockquote>
                  <footer className="lp-reviews-author">
                    <span className="lp-reviews-avatar" aria-hidden="true">{currentReview.name.charAt(0)}</span>
                    <span className="lp-reviews-author-info">
                      <strong>{currentReview.name}</strong>
                      <span>{currentReview.role}</span>
                    </span>
                    {currentReview.exam && <span className="lp-reviews-exam">{currentReview.exam}</span>}
                  </footer>
                </div>
              )}
            </div>

            <div className="lp-reviews-controls">
              <button className="lp-reviews-nav" onClick={prev} aria-label="Précédent">
                <LeftOutlined />
              </button>
              <div className="lp-reviews-dots" aria-label="Témoignages">
                {testimonials.map((rev, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`lp-reviews-dot${i === currentTestimonial ? ' is-active' : ''}`}
                    onClick={() => setCurrentTestimonial(i)}
                    aria-label={`Témoignage ${i + 1} — ${rev.name}`}
                  >
                    {rev.video ? <PlayCircleOutlined /> : rev.name.charAt(0)}
                  </button>
                ))}
              </div>
              <button className="lp-reviews-nav" onClick={next} aria-label="Suivant">
                <RightOutlined />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — visible content backing the FAQPage structured data */}
      <section id="faq" className="lp-faq lp-section">
        <div className="lp-container lp-faq-grid">
          <div className="lp-faq-head">
            <p className="lp-eyebrow">
              <span className="lp-eyebrow-dash" aria-hidden="true" />
              {t('faq.label')}
            </p>
            <h2 className="lp-heading">{t('faq.title')}</h2>
            <p className="lp-subheading">{t('faq.sub')}</p>
            <button className="lp-btn lp-btn--primary" onClick={openModal}>
              {t('hero.cta_primary')}
              <RightOutlined aria-hidden="true" />
            </button>
          </div>

          <div className="lp-faq-list">
            {faqItems.map((item, i) => (
              <details key={i} className="lp-faq-item" {...(i === 0 ? { open: true } : {})}>
                <summary>
                  <span className="lp-faq-q">{item.q}</span>
                  <PlusOutlined className="lp-faq-toggle" aria-hidden="true" />
                </summary>
                <p className="lp-faq-a">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-finale">
        <div className="lp-container lp-finale-grid">
          <div className="lp-finale-content">
            <p className="lp-eyebrow lp-eyebrow--light">
              <span className="lp-eyebrow-dash" aria-hidden="true" />
              {t('finale.eyebrow')}
            </p>
            <h2 className="lp-finale-title">
              {t('finale.title_1')} <em>{t('finale.title_accent')}</em> {t('finale.title_2')}
            </h2>
            <p className="lp-finale-sub">{t('finale.sub')}</p>

            <div className="lp-finale-actions">
              <button className="lp-btn lp-btn--light lp-btn--lg" onClick={openModal}>
                {t('finale.cta')}
                <RightOutlined aria-hidden="true" />
              </button>
              <a href="/login" className="lp-finale-login">{t('finale.login')}</a>
            </div>

            <p className="lp-finale-trust">
              <SafetyCertificateOutlined aria-hidden="true" />
              {t('finale.trust')}
            </p>
          </div>

          <div className="lp-finale-visual">
            <img
              src="/assets/Joy.png"
              alt="Happy student learning French online with a native teacher"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      </main>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-tricolore" aria-hidden="true">
          <span /><span /><span />
        </div>
        <div className="lp-container">
          <div className="lp-footer-grid">
            {/* Brand column */}
            <div className="lp-footer-brand">
              <a href="/" className="lp-logo lp-logo--footer" aria-label="Accueil">
                <span className="lp-logo-mark">
                  <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" />
                </span>
                <span className="lp-logo-text">
                  <strong>Learn French</strong>
                  <em>with Natives</em>
                </span>
              </a>
              <p className="lp-footer-tagline">{t('footer.tagline')}</p>

              <a href="mailto:support@learnfrenchwithnatives.com" className="lp-footer-contact">
                <MailOutlined aria-hidden="true" />
                <span className="lp-footer-contact-info">
                  <strong>{t('footer.contact_label')}</strong>
                  <span>support@learnfrenchwithnatives.com</span>
                </span>
              </a>
            </div>

            {/* Link columns */}
            <div className="lp-footer-col">
              <h4>{t('footer.exams_col')}</h4>
              <ul>
                <li><button type="button" onClick={() => go('exams')}>TEF Canada</button></li>
                <li><button type="button" onClick={() => go('exams')}>DELF / DALF</button></li>
                <li><button type="button" onClick={() => go('exams')}>TCF · TCF Canada</button></li>
                <li><button type="button" onClick={() => go('exams')}>TEFAQ</button></li>
                <li><button type="button" onClick={() => go('exams')}>Français professionnel</button></li>
              </ul>
            </div>

            <div className="lp-footer-col">
              <h4>{t('footer.platform_col')}</h4>
              <ul>
                <li><button type="button" onClick={() => go('why')}>{t('footer.why')}</button></li>
                <li><button type="button" onClick={() => go('platform')}>{t('footer.dashboard')}</button></li>
                <li><button type="button" onClick={() => go('how')}>{t('footer.how')}</button></li>
                <li><button type="button" onClick={() => go('testimonials')}>{t('footer.reviews')}</button></li>
                <li><a href="/login">{t('footer.student_space')}</a></li>
              </ul>
            </div>

            <div className="lp-footer-col">
              <h4>{t('footer.company_col')}</h4>
              <ul>
                <li><button type="button" onClick={openModal}>{t('footer.book_demo')}</button></li>
                <li><a href="mailto:support@learnfrenchwithnatives.com">{t('footer.contact_us')}</a></li>
                <li><a href="#">{t('footer.terms')}</a></li>
                <li><a href="#">{t('footer.privacy')}</a></li>
                <li><a href="#">{t('footer.legal')}</a></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <p>&copy; {new Date().getFullYear()} Learn French with Natives · {t('footer.copy')}</p>
            <p>{t('footer.made')}</p>
          </div>
        </div>
      </footer>

      <DemoRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default LandingPage;
