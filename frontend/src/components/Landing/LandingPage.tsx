import React, { useState, useEffect } from 'react';
import {
  StarFilled,
  RightOutlined,
  LeftOutlined,
  PlayCircleOutlined,
  GlobalOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  CheckCircleFilled,
  BookOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { ASSET_PATHS } from '../../utils/assets';
import DemoRequestModal from './DemoRequestModal';
import './LandingPage.css';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  exam?: string;
}

const NAV_IDS = ['why', 'exams', 'how', 'videos', 'testimonials'];

const LandingPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('');

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

  const t = testimonials[currentTestimonial];

  return (
    <div className="lp">
      {/* HEADER */}
      <header className={`lp-header${scrolled ? ' lp-header--scrolled' : ''}`}>
        <div className="lp-container">
          <div className="lp-header-inner">
            <div className="lp-logo">
              <img src={ASSET_PATHS.LOGOS.MAIN} alt="Logo" />
              <span>Learn French with Natives</span>
            </div>
            <nav className="lp-nav">
              {[
                { id: 'why', label: 'Why Us' },
                { id: 'exams', label: 'Exams' },
                { id: 'how', label: 'How It Works' },
                { id: 'videos', label: 'Videos' },
                { id: 'testimonials', label: 'Reviews' },
              ].map((n) => (
                <button key={n.id} className={`lp-nav-link${activeNav === n.id ? ' active' : ''}`} onClick={() => go(n.id)}>
                  {n.label}
                </button>
              ))}
              <button className="lp-btn lp-btn--primary lp-btn--sm" onClick={openModal}>Request a Demo</button>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-left">
            <p className="lp-hero-eyebrow">🇫🇷 Trusted by 1,000+ students worldwide</p>
            <h1 className="lp-hero-title">
              Master French with <span>Native Speakers</span>
            </h1>
            <p className="lp-hero-desc">
              Personalized courses to help you pass TEF, DELF, DALF, TCF & TEFAQ exams with confidence.
              Learn from certified native French teachers who bring the language to life.
            </p>
            <div className="lp-hero-actions">
              <button className="lp-btn lp-btn--white lp-btn--lg" onClick={openModal}>
                Book Your Free Demo <RightOutlined />
              </button>
              <button className="lp-btn lp-btn--ghost lp-btn--lg" onClick={() => go('exams')}>
                Explore Courses
              </button>
            </div>
            <div className="lp-hero-proof">
              <div className="lp-hero-avatars">
                {['A','P','R','S','M'].map((c,i) => <div key={i} className="lp-hero-av">{c}</div>)}
              </div>
              <div>
                <strong>4.9/5 average rating</strong>
                <span>from 500+ verified reviews</span>
              </div>
            </div>
          </div>
          <div className="lp-hero-right">
            <div className="lp-hero-card">
              <div className="lp-hero-card-top">
                <div className="lp-hero-card-icon">🇫🇷</div>
                <div>
                  <strong>French Exam Preparation</strong>
                  <span>All major certifications</span>
                </div>
              </div>
              <div className="lp-hero-exams">
                {['TEF Canada','DELF','DALF','TCF','TEFAQ'].map((e) => (
                  <div key={e} className="lp-hero-exam-item">
                    <CheckCircleFilled className="lp-check" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>
              <div className="lp-hero-card-stats">
                <div className="lp-hero-stat">
                  <strong>98%</strong>
                  <span>Pass rate</span>
                </div>
                <div className="lp-hero-stat-divider" />
                <div className="lp-hero-stat">
                  <strong>15+</strong>
                  <span>Native teachers</span>
                </div>
                <div className="lp-hero-stat-divider" />
                <div className="lp-hero-stat">
                  <strong>1,000+</strong>
                  <span>Students</span>
                </div>
              </div>
              <button className="lp-btn lp-btn--primary lp-btn--full" onClick={openModal}>
                Start Learning Today <RightOutlined />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="lp-stats">
        <div className="lp-container lp-stats-grid">
          {[
            { icon: <TeamOutlined />, num: '1,000+', label: 'Students Trained' },
            { icon: <TrophyOutlined />, num: '98%', label: 'Exam Pass Rate' },
            { icon: <GlobalOutlined />, num: '15+', label: 'Native Teachers' },
            { icon: <ClockCircleOutlined />, num: '10,000+', label: 'Hours Taught' },
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
            <p className="lp-label">Why Choose Us</p>
            <h2 className="lp-heading">Everything You Need to Succeed in French</h2>
            <p className="lp-subheading">Native expertise, proven strategies, and personalized attention — all in one place.</p>
          </div>
          <div className="lp-features-grid">
            {[
              { icon: <GlobalOutlined />, color: '#dbeafe', iconColor: '#1a56db', title: '100% Native Teachers', desc: 'Every instructor is a certified native French speaker with years of teaching experience.' },
              { icon: <TrophyOutlined />, color: '#fef3c7', iconColor: '#d97706', title: 'Exam-Focused Curriculum', desc: 'Targeted preparation for TEF, DELF, DALF, TCF, and TEFAQ with mock tests.' },
              { icon: <ClockCircleOutlined />, color: '#d1fae5', iconColor: '#059669', title: 'Flexible Scheduling', desc: 'Individual or group sessions that fit your lifestyle, timezone, and pace.' },
              { icon: <CustomerServiceOutlined />, color: '#ede9fe', iconColor: '#7c3aed', title: 'Personalized Feedback', desc: 'Detailed corrections and progress tracking tailored to your goals.' },
              { icon: <BookOutlined />, color: '#fce7f3', iconColor: '#db2777', title: 'Structured Curriculum', desc: 'Step-by-step learning paths from beginner A1 to advanced C2 levels.' },
              { icon: <SafetyCertificateOutlined />, color: '#ccfbf1', iconColor: '#0d9488', title: 'Guaranteed Results', desc: '98% of our students pass their target exam on the first attempt.' },
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

      {/* EXAMS */}
      <section id="exams" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head lp-section-head--center">
            <p className="lp-label">Exam Preparation</p>
            <h2 className="lp-heading">We Prepare You for Every Major French Exam</h2>
            <p className="lp-subheading">Real exam simulations, expert feedback, and proven strategies to maximize your score.</p>
          </div>
          <div className="lp-exams-grid">
            {[
              { emoji: '🇨🇦', title: 'TEF Canada', sub: 'Immigration & Citizenship', desc: 'Achieve the CLB score you need for Express Entry and citizenship applications.', tags: ['Speaking','Listening','Reading','Writing'] },
              { emoji: '📜', title: 'DELF / DALF', sub: 'Official French Diploma', desc: 'Master every level from A1 to C2 with structured practice and mock exams.', tags: ['A1–B2','C1–C2','Mock Exams'] },
              { emoji: '🎯', title: 'TCF / TEFAQ', sub: 'Quebec Immigration', desc: 'Intensive speaking and listening practice for Quebec immigration exams.', tags: ['TCF Québec','TEFAQ','Oral Practice'] },
              { emoji: '💼', title: 'Business French', sub: 'Professional Skills', desc: 'French for meetings, presentations, and client communication.', tags: ['Meetings','Presentations','Emails'] },
              { emoji: '🗣️', title: 'Conversational', sub: 'Everyday Fluency', desc: 'Build real-world speaking confidence through immersive practice.', tags: ['Pronunciation','Culture','Fluency'] },
              { emoji: '👶', title: 'French for Kids', sub: 'Ages 6–16', desc: 'Fun, interactive lessons with stories, games, and activities.', tags: ['Interactive','Fun','Age-Appropriate'] },
            ].map((c, i) => (
              <div key={i} className="lp-exam-card">
                <span className="lp-exam-emoji">{c.emoji}</span>
                <h3>{c.title}</h3>
                <p className="lp-exam-sub">{c.sub}</p>
                <p className="lp-exam-desc">{c.desc}</p>
                <div className="lp-exam-tags">
                  {c.tags.map((t) => <span key={t} className="lp-exam-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="lp-section lp-section--gray">
        <div className="lp-container">
          <div className="lp-section-head lp-section-head--center">
            <p className="lp-label">How It Works</p>
            <h2 className="lp-heading">Start Learning in 4 Simple Steps</h2>
            <p className="lp-subheading">From your first demo to exam success — we guide you every step of the way.</p>
          </div>
          <div className="lp-steps">
            {[
              { icon: '📞', title: 'Book a Free Demo', desc: 'Schedule a complimentary session to meet your teacher and discuss your goals.' },
              { icon: '📋', title: 'Get Your Plan', desc: 'Receive a personalized learning plan tailored to your level and target exam.' },
              { icon: '💻', title: 'Start Learning', desc: 'Attend live sessions with your native teacher. Practice all four skills.' },
              { icon: '🏆', title: 'Pass Your Exam', desc: 'Take mock tests, get feedback, and walk into your exam with confidence.' },
            ].map((s, i) => (
              <div key={i} className="lp-step">
                <div className="lp-step-num">{s.icon}</div>
                <div className="lp-step-line">{i < 3 && <div className="lp-step-connector" />}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section id="videos" className="lp-section">
        <div className="lp-container">
          <div className="lp-section-head lp-section-head--center">
            <p className="lp-label">See Us in Action</p>
            <h2 className="lp-heading">Experience Our Teaching Method</h2>
            <p className="lp-subheading">Watch real sessions and hear from students who achieved their goals.</p>
          </div>
          <div className="lp-videos">
            {[
              { poster: ASSET_PATHS.IMAGES.VIDEO1_THUMBNAIL, src: ASSET_PATHS.VIDEOS.VIDEO1, title: 'Our Teaching Approach', desc: 'See how our native speakers create an immersive experience' },
              { poster: ASSET_PATHS.IMAGES.VIDEO2_THUMBNAIL, src: ASSET_PATHS.VIDEOS.VIDEO2, title: 'Student Success Stories', desc: 'Hear from students who passed their exams' },
            ].map((v, i) => (
              <div key={i} className="lp-video-card">
                <div className="lp-video-wrap">
                  <video controls poster={v.poster} className="lp-video" preload="metadata">
                    <source src={v.src} type="video/mp4" />
                  </video>
                  <div className="lp-video-overlay"><PlayCircleOutlined /></div>
                </div>
                <div className="lp-video-info">
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="lp-section lp-section--gray">
        <div className="lp-container">
          <div className="lp-section-head lp-section-head--center">
            <p className="lp-label">Student Reviews</p>
            <h2 className="lp-heading">What Our Students Say</h2>
            <p className="lp-subheading">Real results from real students who trusted us with their French journey.</p>
          </div>
          <div className="lp-testimonial-row">
            <button className="lp-carousel-btn" onClick={prev} aria-label="Previous"><LeftOutlined /></button>
            <div className="lp-testimonial-card">
              <div className="lp-stars">
                {[...Array(t.rating)].map((_, i) => <StarFilled key={i} />)}
              </div>
              <p className="lp-testimonial-text">"{t.content}"</p>
              <div className="lp-testimonial-author">
                <div className="lp-author-av">{t.name.charAt(0)}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                  {t.exam && <span className="lp-exam-badge">{t.exam}</span>}
                </div>
              </div>
            </div>
            <button className="lp-carousel-btn" onClick={next} aria-label="Next"><RightOutlined /></button>
          </div>
          <div className="lp-dots">
            {testimonials.map((_, i) => (
              <button key={i} className={`lp-dot${i === currentTestimonial ? ' active' : ''}`} onClick={() => setCurrentTestimonial(i)} aria-label={`Testimonial ${i+1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-section">
        <div className="lp-container">
          <div className="lp-pricing-box">
            <h3>Personalized Pricing for Your Goals</h3>
            <p>Every student is unique. Book a free demo to discuss the best plan with your teacher — no commitment required.</p>
            <button className="lp-btn lp-btn--white lp-btn--lg" onClick={openModal}>Get Your Custom Quote <RightOutlined /></button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-container">
          <h2>Ready to Start Your French Journey?</h2>
          <p>Join 1,000+ students who chose the native way to learn French. Your first demo is free.</p>
          <button className="lp-btn lp-btn--white lp-btn--lg" onClick={openModal}>Book Free Demo <RightOutlined /></button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <img src={ASSET_PATHS.LOGOS.MAIN} alt="Logo" className="lp-footer-logo" />
              <p>Your trusted partner in French language mastery. Native speakers, proven methods, real results.</p>
            </div>
            <div className="lp-footer-col">
              <h4>Courses</h4>
              <ul><li>TEF Canada Prep</li><li>DELF / DALF</li><li>TCF & TEFAQ</li><li>Business French</li><li>Conversational</li></ul>
            </div>
            <div className="lp-footer-col">
              <h4>Company</h4>
              <ul><li>About Us</li><li>Our Teachers</li><li>Success Stories</li><li>Contact</li></ul>
            </div>
            <div className="lp-footer-col">
              <h4>Support</h4>
              <ul><li>Help Center</li><li>Terms of Service</li><li>Privacy Policy</li><li>FAQ</li></ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>&copy; {new Date().getFullYear()} Learn French with Natives. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <DemoRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default LandingPage;
