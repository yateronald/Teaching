import React, { useState, useEffect, useRef } from 'react';
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
  FireOutlined,
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
  LoginOutlined,
  PhoneOutlined,
  RocketOutlined,
  MailOutlined,
  HeartFilled,
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

  // Sticky-image scrolly section: track which feature is active
  const [activeFeature, setActiveFeature] = useState(0);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const featureItemsRef = useRef<Array<HTMLDivElement | null>>([]);

  // How It Works scrolly section: track which step is active
  const [activeStep, setActiveStep] = useState(0);
  const stepItemsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const onScrollFeatures = () => {
      const items = featureItemsRef.current.filter(Boolean) as HTMLDivElement[];
      if (items.length === 0) return;
      // The "anchor line" is at 45% of the viewport height.
      // The feature whose top is closest to (and not past) that line wins.
      const anchor = window.innerHeight * 0.45;
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
      setActiveFeature(bestIdx);

      // Same algorithm for "How It Works" steps
      const stepEls = stepItemsRef.current.filter(Boolean) as HTMLDivElement[];
      if (stepEls.length > 0) {
        let bestStepIdx = 0;
        let bestStepDist = Infinity;
        stepEls.forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const dist = Math.abs(center - anchor);
          if (rect.top < anchor + rect.height && dist < bestStepDist) {
            bestStepDist = dist;
            bestStepIdx = idx;
          }
        });
        setActiveStep(bestStepIdx);
      }
    };
    window.addEventListener('scroll', onScrollFeatures, { passive: true });
    onScrollFeatures();
    return () => window.removeEventListener('scroll', onScrollFeatures);
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

  return (
    <div className="lp">
      <SEO />
      {/* Skip-to-main link for keyboard users and accessibility */}
      <a href="#main-content" className="lp-skip-link">Skip to main content</a>
      {/* HEADER */}
      <header className={`lp-header${scrolled ? ' lp-header--scrolled' : ''}`}>
        <div className="lp-container">
          <div className="lp-header-inner">
            <a href="/" className="lp-logo" aria-label="Accueil">
              <span className="lp-logo-mark">
                <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" />
              </span>
              <span className="lp-logo-text">
                <strong>Learn French</strong>
                <em>with Natives</em>
              </span>
            </a>

            <nav className="lp-nav">
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
              <div ref={langSwitcherRef} className={`lp-lang-switcher${langOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="lp-lang-toggle"
                  onClick={() => setLangOpen((o) => !o)}
                  aria-label="Switch language"
                  aria-expanded={langOpen}
                >
                  <span className="lp-lang-toggle-flag">
                    {i18n.language === 'en' ? '🇬🇧' : '🇫🇷'}
                  </span>
                  <span className="lp-lang-toggle-label">
                    {i18n.language === 'en' ? 'EN' : 'FR'}
                  </span>
                  <span className="lp-lang-toggle-chevron">▾</span>
                </button>
                {langOpen && (
                  <div className="lp-lang-dropdown">
                    <button
                      type="button"
                      className={`lp-lang-option${i18n.language === 'en' ? ' is-active' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); handleSelectLang('en'); }}
                    >
                      <span>🇬🇧</span> English
                    </button>
                    <button
                      type="button"
                      className={`lp-lang-option${i18n.language === 'fr' ? ' is-active' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); handleSelectLang('fr'); }}
                    >
                      <span>🇫🇷</span> Français
                    </button>
                  </div>
                )}
              </div>
              <a href="/login" className="lp-nav-login">
                <LoginOutlined />
                <span>{t('nav.login')}</span>
              </a>
              <button className="lp-nav-cta" onClick={openModal}>
                <span>{t('nav.demo')}</span>
                <span className="lp-nav-cta-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content">

      {/* HERO */}
      <section className="lp-hero" aria-label="Hero — Learn French with Native Teachers">
        <div className="lp-container lp-hero-inner">
          {/* Left panel — content */}
          <div className="lp-hero-content">
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-dot" />
              <span>{t('hero.badge')} · 1 000+ étudiants</span>
            </div>
            <h1 className="lp-hero-title">
              {t('hero.title_1')}{' '}
              <span className="lp-hero-accent">{t('hero.title_accent')}</span>{' '}
              {t('hero.title_2')}
            </h1>
            <p className="lp-hero-sub">
              {t('hero.sub')}
            </p>

            <div className="lp-hero-actions">
              <button className="lp-hero-cta" onClick={openModal}>
                {t('hero.cta_primary')}
                <span className="lp-hero-cta-arrow"><RightOutlined /></span>
              </button>
              <button className="lp-hero-cta-secondary" onClick={() => go('how')}>
                {t('hero.cta_secondary')}
              </button>
            </div>

            <div className="lp-hero-stats-row">
              <div className="lp-hero-stat-pill">
                <strong>98%</strong>
                <span>{t('hero.stat_pass')}</span>
              </div>
              <div className="lp-hero-stat-pill">
                <strong>15+</strong>
                <span>{t('hero.stat_teachers')}</span>
              </div>
              <div className="lp-hero-stat-pill">
                <strong>4,9/5</strong>
                <span>500+ {t('hero.stat_reviews')}</span>
              </div>
            </div>
          </div>

          {/* Right panel — platform showcase */}
          <div className="lp-hero-visual">
            {/* Floating chip — above the image */}
            <div className="lp-hero-chip lp-hero-chip--exams">
              <div className="lp-hero-chip-icon">📊</div>
              <div>
                <strong>{t('chip_exams.title')}</strong>
                <span>{t('chip_exams.sub')}</span>
              </div>
            </div>

            <div className="lp-hero-photo">
              <img
                src="/assets/French_Platform1.png"
                alt="Learn French with Natives platform dashboard — track scores, take quizzes, attend live classes"
                width="1200"
                height="780"
                fetchPriority="high"
                decoding="async"
              />
              <div className="lp-hero-photo-glow" />
            </div>

            {/* Floating chip — below the image */}
            <div className="lp-hero-chip lp-hero-chip--live">
              <div className="lp-hero-chip-live-dot" />
              <div>
                <strong>{t('chip_live.title')}</strong>
                <span>{t('chip_live.sub')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="lp-stats" aria-label="Key statistics">
        <div className="lp-container lp-stats-grid">
          {[
            { icon: <TeamOutlined />, num: '1,000+', label: t('stats.students') },
            { icon: <TrophyOutlined />, num: '98%', label: t('stats.pass') },
            { icon: <GlobalOutlined />, num: '15+', label: t('stats.teachers') },
            { icon: <ClockCircleOutlined />, num: '10,000+', label: t('stats.hours') },
          ].map((s, i) => (
            <div key={i} className="lp-stat">
              <div className="lp-stat-icon">{s.icon}</div>
              <div className="lp-stat-num">{s.num}</div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section id="why" className="lp-section lp-section--gray">
        <div className="lp-container">
          <div className="lp-section-head lp-section-head--center">
            <p className="lp-label">{t('why.label')}</p>
            <h2 className="lp-heading">{t('why.title')}</h2>
            <p className="lp-subheading">{t('why.sub')}</p>
          </div>
          <div className="lp-features-grid">
            {[
              { icon: <GlobalOutlined />, color: '#dbeafe', iconColor: '#1a56db', title: t('why.f1.title'), desc: t('why.f1.desc') },
              { icon: <TrophyOutlined />, color: '#fef3c7', iconColor: '#d97706', title: t('why.f2.title'), desc: t('why.f2.desc') },
              { icon: <ClockCircleOutlined />, color: '#d1fae5', iconColor: '#059669', title: t('why.f3.title'), desc: t('why.f3.desc') },
              { icon: <CustomerServiceOutlined />, color: '#ede9fe', iconColor: '#7c3aed', title: t('why.f4.title'), desc: t('why.f4.desc') },
              { icon: <BookOutlined />, color: '#fce7f3', iconColor: '#db2777', title: t('why.f5.title'), desc: t('why.f5.desc') },
              { icon: <SafetyCertificateOutlined />, color: '#ccfbf1', iconColor: '#0d9488', title: t('why.f6.title'), desc: t('why.f6.desc') },
            ].map((f, i) => (
              <div key={i} className="lp-feature-card">
                <div className="lp-feature-icon" style={{ background: f.color, color: f.iconColor }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
         PLATFORM TOUR — sticky image on the left, scroll-revealed features on the right
         ───────────────────────────────────────────────────────────────────── */}
      <section id="platform" className="lp-platform" ref={featuresRef}>
        <div className="lp-container">
          <div className="lp-section-head lp-section-head--center">
            <p className="lp-label">{t('platform.label')}</p>
            <h2 className="lp-heading">{t('platform.title')}</h2>
            <p className="lp-subheading">
              {t('platform.sub')}
            </p>
          </div>

          <div className="lp-platform-grid">
            {/* LEFT — sticky image */}
            <div className="lp-platform-sticky">
              <div className="lp-platform-frame">
                {/* Browser-style chrome */}
                <div className="lp-platform-chrome">
                  <span className="lp-chrome-dot lp-chrome-dot--r" />
                  <span className="lp-chrome-dot lp-chrome-dot--y" />
                  <span className="lp-chrome-dot lp-chrome-dot--g" />
                  <div className="lp-chrome-url">app.learnfrenchwithnatives.com</div>
                </div>
                <div className="lp-platform-screen">
                  <img
                    src="/assets/french%20platform.png"
                    alt="Student dashboard showing score tracking, quizzes, resources and live classes"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Floating feature label badge */}
                  <div className="lp-platform-badge">
                    <span className="lp-platform-badge-num">
                      {String(activeFeature + 1).padStart(2, '0')}
                    </span>
                    <span className="lp-platform-badge-text">
                      {[
                        t('platform.features.dashboard.title'),
                        t('platform.features.quiz.title'),
                        t('platform.features.results.title'),
                        t('platform.features.bulletin.title'),
                        t('platform.features.resources.title'),
                        t('platform.features.schedule.title'),
                        t('platform.features.exams.title'),
                        t('platform.features.live.title'),
                      ][activeFeature]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vertical progress indicator */}
              <div className="lp-platform-progress">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Aller à la fonctionnalité ${i + 1}`}
                    onClick={() => featureItemsRef.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    className={`lp-platform-dot${i === activeFeature ? ' is-active' : ''}${i < activeFeature ? ' is-done' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT — feature stack */}
            <div className="lp-platform-features">
              {[
                {
                  icon: <DashboardOutlined />,
                  color: '#6366f1',
                  title: t('platform.features.dashboard.title'),
                  desc: t('platform.features.dashboard.desc'),
                  bullets: (t('platform.features.dashboard.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <FormOutlined />,
                  color: '#a855f7',
                  title: t('platform.features.quiz.title'),
                  desc: t('platform.features.quiz.desc'),
                  bullets: (t('platform.features.quiz.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <BarChartOutlined />,
                  color: '#ec4899',
                  title: t('platform.features.results.title'),
                  desc: t('platform.features.results.desc'),
                  bullets: (t('platform.features.results.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <ProfileOutlined />,
                  color: '#0ea5e9',
                  title: t('platform.features.bulletin.title'),
                  desc: t('platform.features.bulletin.desc'),
                  bullets: (t('platform.features.bulletin.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <FolderOpenOutlined />,
                  color: '#f59e0b',
                  title: t('platform.features.resources.title'),
                  desc: t('platform.features.resources.desc'),
                  bullets: (t('platform.features.resources.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <CalendarOutlined />,
                  color: '#14b8a6',
                  title: t('platform.features.schedule.title'),
                  desc: t('platform.features.schedule.desc'),
                  bullets: (t('platform.features.schedule.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <ExperimentOutlined />,
                  color: '#7c3aed',
                  title: t('platform.features.exams.title'),
                  desc: t('platform.features.exams.desc'),
                  bullets: (t('platform.features.exams.bullets', { returnObjects: true }) as string[]),
                },
                {
                  icon: <VideoCameraOutlined />,
                  color: '#22c55e',
                  title: t('platform.features.live.title'),
                  desc: t('platform.features.live.desc'),
                  bullets: (t('platform.features.live.bullets', { returnObjects: true }) as string[]),
                },
              ].map((f, i) => (
                <div
                  key={i}
                  ref={(el) => { featureItemsRef.current[i] = el; }}
                  className={`lp-platform-feature${i === activeFeature ? ' is-active' : ''}`}
                  data-index={i + 1}
                >
                  <div className="lp-platform-feature-num">
                    <span>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="lp-platform-feature-body">
                    <div
                      className="lp-platform-feature-icon"
                      style={{
                        background: `linear-gradient(135deg, ${f.color}20, ${f.color}08)`,
                        color: f.color,
                        borderColor: `${f.color}33`,
                      }}
                    >
                      {f.icon}
                    </div>
                    <h3 style={{ color: i === activeFeature ? '#0f172a' : '#475569' }}>{f.title}</h3>
                    <p>{f.desc}</p>
                    <ul className="lp-platform-feature-bullets">
                      {f.bullets.map((b, j) => (
                        <li key={j}>
                          <span className="lp-platform-bullet-dot" style={{ background: f.color }} />
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
          <div className="lp-section-head lp-section-head--center">
            <p className="lp-label">{t('exams.label')}</p>
            <h2 className="lp-heading">{t('exams.title')}</h2>
            <p className="lp-subheading">{t('exams.sub')}</p>
          </div>

          <div className="lp-exams-layout">
            {/* Featured exam — TEF Canada */}
            <div className="lp-exam-featured">
              <div className="lp-exam-featured-bg" />
              <div className="lp-exam-featured-flag">CA</div>

              <div className="lp-exam-featured-tag">
                <FireOutlined /> {t('exams.most_popular')}
              </div>

              <h3 className="lp-exam-featured-title">TEF Canada</h3>
              <p className="lp-exam-featured-sub">{t('exams.tef_sub')}</p>
              <p className="lp-exam-featured-desc">
                {t('exams.tef_desc')}
              </p>

              <div className="lp-exam-featured-skills">
                {[
                  { icon: <AudioOutlined />, label: t('exams.skill_speaking') },
                  { icon: <CustomerServiceOutlined />, label: t('exams.skill_listening') },
                  { icon: <ReadOutlined />, label: t('exams.skill_reading') },
                  { icon: <SolutionOutlined />, label: t('exams.skill_writing') },
                ].map((s, i) => (
                  <div key={i} className="lp-exam-featured-skill">
                    <span className="lp-exam-featured-skill-icon">{s.icon}</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="lp-exam-featured-stats">
                <div>
                  <strong>98%</strong>
                  <span>{t('exams.tef_stat1')}</span>
                </div>
                <div className="lp-exam-featured-stats-divider" />
                <div>
                  <strong>500+</strong>
                  <span>{t('exams.tef_stat2')}</span>
                </div>
                <div className="lp-exam-featured-stats-divider" />
                <div>
                  <strong>10+</strong>
                  <span>{t('exams.tef_stat3')}</span>
                </div>
              </div>

              <button className="lp-exam-featured-cta" onClick={openModal}>
                {t('exams.cta')}
                <RightOutlined />
              </button>
            </div>

            {/* Other exams — compact grid */}
            <div className="lp-exam-list">
              {[
                {
                  icon: <SafetyCertificateOutlined />, color: '#7c3aed', soft: 'rgba(124,58,237,0.1)',
                  title: 'DELF / DALF', sub: t('exams.delf_sub'),
                  desc: t('exams.delf_desc'),
                  tags: ['A1–B2', 'C1–C2', t('exams.tag_mock')],
                },
                {
                  icon: <AimOutlined />, color: '#0891b2', soft: 'rgba(8,145,178,0.1)',
                  title: 'TCF / TEFAQ', sub: t('exams.tcf_sub'),
                  desc: t('exams.tcf_desc'),
                  tags: ['TCF Québec', 'TEFAQ', t('exams.tag_oral')],
                },
                {
                  icon: <TeamOutlined />, color: '#d97706', soft: 'rgba(217,119,6,0.1)',
                  title: t('exams.business_title'), sub: t('exams.business_sub'),
                  desc: t('exams.business_desc'),
                  tags: [t('exams.tag_meetings'), t('exams.tag_presentations'), 'Emails'],
                },
                {
                  icon: <AudioOutlined />, color: '#db2777', soft: 'rgba(219,39,119,0.1)',
                  title: t('exams.conv_title'), sub: t('exams.conv_sub'),
                  desc: t('exams.conv_desc'),
                  tags: [t('exams.tag_pronunciation'), t('exams.tag_culture'), t('exams.tag_fluency')],
                },
                {
                  icon: <SmileOutlined />, color: '#0d9488', soft: 'rgba(13,148,136,0.1)',
                  title: t('exams.kids_title'), sub: t('exams.kids_sub'),
                  desc: t('exams.kids_desc'),
                  tags: [t('exams.tag_interactive'), t('exams.tag_fun'), t('exams.tag_ageadapted')],
                },
              ].map((c, i) => (
                <div key={i} className="lp-exam-tile">
                  <div className="lp-exam-tile-icon" style={{ background: c.soft, color: c.color }}>
                    {c.icon}
                  </div>
                  <div className="lp-exam-tile-content">
                    <h4>{c.title}</h4>
                    <p className="lp-exam-tile-sub">{c.sub}</p>
                    <p className="lp-exam-tile-desc">{c.desc}</p>
                    <div className="lp-exam-tile-tags">
                      {c.tags.map((t) => <span key={t} className="lp-exam-tile-tag">{t}</span>)}
                    </div>
                  </div>
                  <div className="lp-exam-tile-arrow"><RightOutlined /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
         HOW IT WORKS — sticky illustration on the left, scroll-revealed steps on the right
         ───────────────────────────────────────────────────────────────────── */}
      <section id="how" className="lp-howit">
        <div className="lp-container">
          <div className="lp-section-head lp-section-head--center">
            <p className="lp-label">{t('how.label')}</p>
            <h2 className="lp-heading">{t('how.title')}</h2>
            <p className="lp-subheading">{t('how.sub')}</p>
          </div>

          <div className="lp-howit-grid">
            {/* LEFT — sticky illustration */}
            <div className="lp-howit-sticky">
              <div className="lp-howit-illu">
                {/* Decorative backdrop layers */}
                <div className="lp-howit-illu-bg" />
                <div className="lp-howit-illu-grid" />
                <div className="lp-howit-illu-blob lp-howit-illu-blob--1" />
                <div className="lp-howit-illu-blob lp-howit-illu-blob--2" />

                {/* Image */}
                <img
                  src="/assets/how.png"
                  alt="French learning journey: book demo, get a plan, learn with native teacher, pass your exam"
                  loading="lazy"
                  decoding="async"
                />

                {/* Floating step badge */}
                <div className="lp-howit-badge">
                  <span className="lp-howit-badge-num">{String(activeStep + 1).padStart(2, '0')}</span>
                  <div className="lp-howit-badge-text">
                    <strong>{t('how.step_label')} {activeStep + 1} / 4</strong>
                    <span>
                      {[
                        t('how.steps.demo.title'),
                        t('how.steps.plan.title'),
                        t('how.steps.learn.title'),
                        t('how.steps.pass.title'),
                      ][activeStep]}
                    </span>
                  </div>
                </div>

                {/* Progress ring — wraps the full circle */}
                <div className="lp-howit-progress">
                  <svg viewBox="0 0 36 36">
                    <defs>
                      <linearGradient id="lp-howit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4338ca" />
                        <stop offset="50%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <circle cx="18" cy="18" r="17" className="lp-howit-progress-track" pathLength={100} />
                    <circle
                      cx="18" cy="18" r="17"
                      className="lp-howit-progress-fill"
                      pathLength={100}
                      style={{
                        strokeDasharray: 100,
                        strokeDashoffset: 100 - ((activeStep + 1) / 4) * 100,
                      }}
                    />
                  </svg>
                </div>

                {/* Percentage chip floating at top of the circle */}
                <div className="lp-howit-progress-chip">
                  <strong>{Math.round(((activeStep + 1) / 4) * 100)}%</strong>
                  <span>de progression</span>
                </div>
              </div>
            </div>

            {/* RIGHT — vertical timeline */}
            <div className="lp-howit-steps">
              {[
                {
                  icon: <PhoneOutlined />,
                  color: '#6366f1',
                  title: t('how.steps.demo.title'),
                  desc: t('how.steps.demo.desc'),
                  bullets: [t('how.steps.demo.b1'), t('how.steps.demo.b2'), t('how.steps.demo.b3')],
                },
                {
                  icon: <SolutionOutlined />,
                  color: '#a855f7',
                  title: t('how.steps.plan.title'),
                  desc: t('how.steps.plan.desc'),
                  bullets: [t('how.steps.plan.b1'), t('how.steps.plan.b2'), t('how.steps.plan.b3')],
                },
                {
                  icon: <VideoCameraOutlined />,
                  color: '#0ea5e9',
                  title: t('how.steps.learn.title'),
                  desc: t('how.steps.learn.desc'),
                  bullets: [t('how.steps.learn.b1'), t('how.steps.learn.b2'), t('how.steps.learn.b3')],
                },
                {
                  icon: <TrophyOutlined />,
                  color: '#f59e0b',
                  title: t('how.steps.pass.title'),
                  desc: t('how.steps.pass.desc'),
                  bullets: [t('how.steps.pass.b1'), t('how.steps.pass.b2'), t('how.steps.pass.b3')],
                },
              ].map((s, i) => (
                <div
                  key={i}
                  ref={(el) => { stepItemsRef.current[i] = el; }}
                  className={`lp-howit-step${i === activeStep ? ' is-active' : ''}`}
                >
                  <div className="lp-howit-step-rail">
                    <span
                      className="lp-howit-step-dot"
                      style={{
                        background: i <= activeStep ? `linear-gradient(135deg, ${s.color}, ${s.color}cc)` : '#e2e8f0',
                        boxShadow: i === activeStep ? `0 0 0 6px ${s.color}22, 0 0 0 12px ${s.color}10` : 'none',
                      }}
                    >
                      <span className="lp-howit-step-dot-inner">{i + 1}</span>
                    </span>
                    {i < 3 && (
                      <span
                        className="lp-howit-step-connector"
                        style={{
                          background: i < activeStep
                            ? `linear-gradient(180deg, ${s.color} 0%, ${['#a855f7', '#0ea5e9', '#f59e0b'][i]} 100%)`
                            : '#e2e8f0',
                        }}
                      />
                    )}
                  </div>

                  <div className="lp-howit-step-card">
                    <div
                      className="lp-howit-step-icon"
                      style={{
                        background: `linear-gradient(135deg, ${s.color}18, ${s.color}06)`,
                        color: s.color,
                        borderColor: `${s.color}26`,
                      }}
                    >
                      {s.icon}
                    </div>
                    <span className="lp-howit-step-tag" style={{ color: s.color }}>{t('how.step_label')} {String(i + 1).padStart(2, '0')}</span>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <ul className="lp-howit-step-bullets">
                      {s.bullets.map((b, j) => (
                        <li key={j}>
                          <span className="lp-howit-bullet-tick" style={{ background: s.color }}>
                            <svg viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6L5 8.5L9.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {/* Final CTA card */}
              <div className="lp-howit-cta">
                <div className="lp-howit-cta-inner">
                  <RocketOutlined className="lp-howit-cta-icon" />
                  <div>
                    <h4>{t('how.cta_title')}</h4>
                    <p>{t('how.cta_sub')}</p>
                  </div>
                  <button className="lp-howit-cta-btn" onClick={openModal}>
                    <span>{t('how.cta_btn')}</span>
                    <span className="lp-howit-cta-btn-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
         TESTIMONIALS — orbital circular layout with video + text testimonials
         ───────────────────────────────────────────────────────────────────── */}
      <section id="testimonials" className="lp-reviews">
        <div className="lp-reviews-bg-blob lp-reviews-bg-blob--1" />
        <div className="lp-reviews-bg-blob lp-reviews-bg-blob--2" />
        <div className="lp-reviews-bg-grid" />

        <div className="lp-container">
          <div className="lp-section-head lp-section-head--center">
            <p className="lp-label">{t('reviews.label')}</p>
            <h2 className="lp-heading">{t('reviews.title')}</h2>
            <p className="lp-subheading">{t('reviews.sub')}</p>
          </div>

          <div className="lp-reviews-stage">
            {/* Decorative orbital ring (SVG) */}
            <svg className="lp-reviews-orbit" viewBox="0 0 600 600" aria-hidden="true">
              <defs>
                <linearGradient id="lp-orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4338ca" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <circle cx="300" cy="300" r="282" fill="none" stroke="url(#lp-orbit-grad)" strokeWidth="1.5" strokeDasharray="4 8" />
              <circle cx="300" cy="300" r="232" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="1" strokeDasharray="2 6" />
            </svg>

            {/* Orbital avatars — positioned around the center */}
            <div className="lp-reviews-orbit-items">
              {testimonials.map((rev, i) => {
                const angle = (i / testimonials.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 47; // % of stage — keeps bigger bubbles clear of the center card
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;
                const isActive = i === currentTestimonial;
                const isVideo = !!rev.video;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`lp-reviews-orbit-item${isActive ? ' is-active' : ''}${isVideo ? ' is-video' : ''}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => setCurrentTestimonial(i)}
                    aria-label={`Voir le témoignage de ${rev.name}`}
                  >
                    {isVideo ? (
                      <PlayCircleOutlined className="lp-reviews-orbit-play" />
                    ) : (
                      <span className="lp-reviews-orbit-letter">{rev.name.charAt(0)}</span>
                    )}
                    {isActive && <span className="lp-reviews-orbit-pulse" />}
                  </button>
                );
              })}
            </div>

            {/* Center stage card */}
            <div className={`lp-reviews-card${currentReview.video ? ' lp-reviews-card--video' : ''}`}>
              {currentReview.video ? (
                <>
                  {/* Phone-frame mockup for vertical phone-recorded video */}
                  <div className="lp-reviews-phone">
                    <div className="lp-reviews-phone-notch" />
                    <video
                      key={currentReview.video}
                      controls
                      className="lp-reviews-phone-video"
                      preload="metadata"
                      playsInline
                      muted
                    >
                      {/* #t=0.1 forces browsers to render the first frame as the visible thumbnail */}
                      <source src={`${currentReview.video}#t=0.1`} type="video/mp4" />
                    </video>
                    <div className="lp-reviews-phone-tag">
                      <span className="lp-reviews-phone-tag-dot" />
                      {t('reviews.video_label')}
                    </div>
                  </div>
                  <div className="lp-reviews-card-side">
                    <div className="lp-stars">
                      {[...Array(currentReview.rating)].map((_, i) => <StarFilled key={i} />)}
                    </div>
                    <h3 className="lp-reviews-card-quote">{currentReview.role}</h3>
                    <p className="lp-reviews-card-text">{currentReview.content}</p>
                    <div className="lp-reviews-card-meta">
                      <span className="lp-reviews-card-meta-icon">
                        <PlayCircleOutlined />
                      </span>
                      <span>{t('reviews.video_meta')}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Quote mark decoration */}
                  <span className="lp-reviews-quote-mark">"</span>
                  <div className="lp-stars">
                    {[...Array(currentReview.rating)].map((_, i) => <StarFilled key={i} />)}
                  </div>
                  <p className="lp-reviews-card-text lp-reviews-card-text--lg">{currentReview.content}</p>
                  <div className="lp-reviews-card-author">
                    <div className="lp-reviews-card-avatar">{currentReview.name.charAt(0)}</div>
                    <div className="lp-reviews-card-author-info">
                      <strong>{currentReview.name}</strong>
                      <span>{currentReview.role}</span>
                      {currentReview.exam && <span className="lp-reviews-exam-badge">{currentReview.exam}</span>}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Carousel controls */}
            <button className="lp-reviews-nav lp-reviews-nav--prev" onClick={prev} aria-label="Précédent">
              <LeftOutlined />
            </button>
            <button className="lp-reviews-nav lp-reviews-nav--next" onClick={next} aria-label="Suivant">
              <RightOutlined />
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
         FINAL CTA — clean split layout: Joy illustration + motivational copy
         ───────────────────────────────────────────────────────────────────── */}
      <section className="lp-finale">
        <div className="lp-container">
          <div className="lp-finale-grid">
            {/* Left — Joy illustration */}
            <div className="lp-finale-visual">
              <div className="lp-finale-visual-glow" />
              <img
                src="/assets/Joy.png"
                alt="Happy student learning French online with a native teacher"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Right — copy + CTAs */}
            <div className="lp-finale-content">
              <div className="lp-finale-eyebrow">
                <span className="lp-finale-eyebrow-dot" />
                {t('finale.eyebrow')}
              </div>

              <h2 className="lp-finale-title">
                {t('finale.title_1')} <span className="lp-finale-title-accent">{t('finale.title_accent')}</span> {t('finale.title_2')}
              </h2>

              <p className="lp-finale-sub">
                {t('finale.sub')}
              </p>

              <div className="lp-finale-actions">
                <button className="lp-finale-cta" onClick={openModal}>
                  <span>{t('finale.cta')}</span>
                  <span className="lp-finale-cta-arrow">→</span>
                </button>
                <a href="/login" className="lp-finale-cta-secondary">
                  {t('finale.login')}
                </a>
              </div>

              <div className="lp-finale-mini">
                <SafetyCertificateOutlined />
                <span>{t('finale.trust')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>

      {/* ─────────────────────────────────────────────────────────────────────
         FOOTER — clean French-localized footer with support email
         ───────────────────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            {/* Brand column */}
            <div className="lp-footer-brand">
              <a href="/" className="lp-footer-logo-row" aria-label="Accueil">
                <span className="lp-footer-logo-mark">
                  <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" />
                </span>
                <span className="lp-footer-logo-text">
                  <strong>Learn French</strong>
                  <em>with Natives</em>
                </span>
              </a>
              <p className="lp-footer-tagline">
                {t('footer.tagline')}
              </p>

              <a href="mailto:support@learnfrenchwithnatives.com" className="lp-footer-contact">
                <span className="lp-footer-contact-icon">
                  <MailOutlined />
                </span>
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
            <p className="lp-footer-copy">
              &copy; {new Date().getFullYear()} Learn French with Natives · {t('footer.copy')}
            </p>
            <p className="lp-footer-made">
              {t('footer.made')} <HeartFilled />
            </p>
          </div>
        </div>
      </footer>

      <DemoRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default LandingPage;
