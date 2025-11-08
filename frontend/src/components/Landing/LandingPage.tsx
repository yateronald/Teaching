import React, { useState } from 'react';
import {
  BookOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  TrophyOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  StarFilled,
  RightOutlined,
  LeftOutlined
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

const LandingPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const testimonials: Testimonial[] = [
    {
      name: "Aarav Sharma",
      role: "TEF Canada Candidate",
      content: "Scored CLB 9 in speaking! Classes were structured, patient, and truly native. Practice felt like real-life conversations—exactly what I needed.",
      rating: 5,
      exam: "TEF Canada"
    },
    {
      name: "Priya Patel",
      role: "DELF B2 Graduate",
      content: "Cleared DELF B2 on my first attempt. Mock exams and feedback were spot on. The teacher’s corrections improved my fluency fast.",
      rating: 5,
      exam: "DELF B2"
    },
    {
      name: "Rohan Mehta",
      role: "Business Professional",
      content: "Needed French for clients in Quebec. Flexible scheduling and industry vocabulary focus helped me present confidently in French.",
      rating: 5
    },
    {
      name: "Sneha Kapoor",
      role: "Student",
      content: "The step-by-step curriculum and native accents made learning enjoyable. Speaking clubs boosted my confidence in just weeks!",
      rating: 5
    },
    {
      name: "Arjun Iyer",
      role: "TCF Candidate",
      content: "Clear strategies for TCF listening and speaking. My scores improved quickly thanks to targeted feedback and daily practice.",
      rating: 5,
      exam: "TCF"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleGetStarted = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives Logo" className="logo" />
              <span className="brand-name">Learn French with Natives</span>
            </div>
            <button className="cta-button primary" onClick={handleGetStarted}>
              Request a Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="badge">
                <UserOutlined /> Over 1000 Satisfied Students
              </div>
              
              <h1 className="hero-title">
                Learn French with <span className="highlight">Native Speakers</span>
              </h1>
              
              <p className="hero-subtitle">
                The most effective method to master French and succeed in your exams. 
                Personalized courses with experienced native-speaking teachers.
              </p>
              
              <div className="cta-buttons">
                <button className="cta-button primary large" onClick={handleGetStarted}>
                  Request a Demo <RightOutlined />
                </button>
                <button className="cta-button secondary large" onClick={() => {
                  document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  Explore Courses
                </button>
              </div>
              
              <div className="hero-features">
                <div className="feature-item">
                  <BookOutlined className="feature-icon" />
                  <span>Individual Courses</span>
                </div>
                <div className="feature-item">
                  <SafetyCertificateOutlined className="feature-icon" />
                  <span>Guaranteed Certification</span>
                </div>
              </div>
            </div>
            
            <div className="hero-image-wrapper">
              <img 
                src={ASSET_PATHS.IMAGES.FR_BACKGROUND} 
                alt="Native French Teacher" 
                className="hero-image"
                loading="eager"
              />
              <div className="success-card">
                <div className="success-icons">
                  <div className="icon-circle blue"></div>
                  <div className="icon-circle green"></div>
                  <div className="icon-circle purple"></div>
                </div>
                <div className="success-text">
                  <strong>Join 1000+ students</strong>
                  <p>Who passed their exams</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Satisfied Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">15+</div>
              <div className="stat-label">Native Teachers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Hours Taught</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose FrenchMaster?</h2>
            <p className="section-subtitle">Everything you need to succeed in French</p>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <TrophyOutlined />
              </div>
              <h3>Expert Exam Preparation</h3>
              <p>Specialized training for TEF Canada, DELF, DALF, TCF, and TEFAQ with proven strategies and practice materials.</p>
              <ul className="benefit-list">
                <li><CheckCircleOutlined /> TEF Canada Certification</li>
                <li><CheckCircleOutlined /> DELF/DALF Preparation</li>
                <li><CheckCircleOutlined /> TCF & TEFAQ Training</li>
              </ul>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <GlobalOutlined />
              </div>
              <h3>Native French Speakers</h3>
              <p>Learn from certified native teachers with years of experience in language education and cultural immersion.</p>
              <ul className="benefit-list">
                <li><CheckCircleOutlined /> Certified Instructors</li>
                <li><CheckCircleOutlined /> Personalized Feedback</li>
                <li><CheckCircleOutlined /> Cultural Insights</li>
              </ul>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">
                <BookOutlined />
              </div>
              <h3>Flexible Learning</h3>
              <p>Tailored courses for work, immigration, or personal growth with flexible scheduling to fit your lifestyle.</p>
              <ul className="benefit-list">
                <li><CheckCircleOutlined /> Custom Schedule</li>
                <li><CheckCircleOutlined /> One-on-One Sessions</li>
                <li><CheckCircleOutlined /> Group Classes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Course Offerings */}
      <section id="courses" className="courses-section">
        <div className="container">
          
          <div className="pricing-note">
            <h3>Personalized Pricing</h3>
            <p>
              Our pricing is tailored to your goals and schedule. Please
              request a demo to discuss the best plan and price directly with your
              teacher.
            </p>
            <div className="note-actions">
              <button className="cta-button primary" onClick={handleGetStarted}>
                Request a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="video-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Experience Our Teaching Method</h2>
            <p className="section-subtitle">See how our native speakers help students achieve fluency</p>
          </div>
          
          <div className="video-grid">
            <div className="video-card">
              <div className="video-wrapper">
                <video 
                  controls 
                  poster={ASSET_PATHS.IMAGES.VIDEO1_THUMBNAIL}
                  className="demo-video"
                  preload="metadata"
                  aria-label="Introduction to FrenchMaster teaching method"
                >
                  <source src={ASSET_PATHS.VIDEOS.VIDEO1} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="video-play-overlay">
                  <PlayCircleOutlined />
                </div>
              </div>
              <h3>Student Success Stories</h3>
              <p>Hear from students who achieved their goals</p>
            </div>
            
            <div className="video-card">
              <div className="video-wrapper">
                <video 
                  controls 
                  poster={ASSET_PATHS.IMAGES.VIDEO2_THUMBNAIL}
                  className="demo-video"
                  preload="metadata"
                  aria-label="Student success story and testimonial"
                >
                  <source src={ASSET_PATHS.VIDEOS.VIDEO2} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="video-play-overlay">
                  <PlayCircleOutlined />
                </div>
              </div>
              <h3>Student Success Stories</h3>
              <p>Hear from students who achieved their goals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">Real results from real students</p>
          </div>
          
          <div className="testimonial-carousel">
            <button 
              className="carousel-button prev" 
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
              title="Previous"
            >
              <LeftOutlined />
            </button>
            
            <div className="testimonial-card-wrapper">
              <div className="testimonial-card">
                <div className="stars">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <StarFilled key={i} />
                  ))}
                </div>
                <p className="testimonial-content">
                  "{testimonials[currentTestimonial].content}"
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                  <div className="author-info">
                    <strong>{testimonials[currentTestimonial].name}</strong>
                    <span>{testimonials[currentTestimonial].role}</span>
                    {testimonials[currentTestimonial].exam && (
                      <span className="exam-badge">{testimonials[currentTestimonial].exam}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className="carousel-button next" 
              onClick={nextTestimonial}
              aria-label="Next testimonial"
              title="Next"
            >
              <RightOutlined />
            </button>
          </div>
          
          <div className="carousel-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" className="footer-logo" />
              <p>Your trusted partner in French language mastery</p>
            </div>
            
            <div className="footer-section">
              <h4>Courses</h4>
              <ul>
                <li>TEF Canada Prep</li>
                <li>DELF/DALF</li>
                <li>TCF & TEFAQ</li>
                <li>General French</li>
                <li>Business French</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li>About Us</li>
                <li>Our Teachers</li>
                <li>Success Stories</li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>FAQ</li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Learn French with Natives. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Request Modal */}
      <DemoRequestModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default LandingPage;