import React, { useEffect, useState, useRef } from 'react';
import { Terminal, ArrowRight, BookOpen, Briefcase, FileText, CheckCircle, Code, MessageSquare, TrendingUp, Search, FolderArchive, FileClock, RefreshCw, UserX, Target, Folder, Sparkles, ShieldCheck, Brain, Lock } from 'lucide-react';
import Auth from './Auth';

function LandingPage({ onNavigate }) {
  const [titleHovered, setTitleHovered] = useState(false);
  const [heroRightVisible, setHeroRightVisible] = useState(false);

  // Intersection Observer & Scroll Class listeners
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('hero-right')) {
            setHeroRightVisible(true);
          }
        } else {
          entry.target.classList.remove('visible');
          if (entry.target.classList.contains('hero-right')) {
            setHeroRightVisible(false);
          }
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal, .reveal-slide-up, .reveal-slide-left, .reveal-slide-right, .reveal-zoom, .reveal-fade');
    elements.forEach(el => observer.observe(el));

    const handleScroll = () => {
      const header = document.querySelector('.landing-header');
      if (window.scrollY > 50) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      elements.forEach(el => observer.unobserve(el));
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll trigger active cards in sections for mobile
  useEffect(() => {
    const handleScroll = () => {
      const selectors = ['.problem-col', '.smarter-card', '.help-box', '.how-step'];
      
      if (window.innerWidth >= 768) {
        selectors.forEach(selector => {
          const cards = document.querySelectorAll(selector);
          cards.forEach(card => card.classList.remove('active'));
        });
        return;
      }

      const highlightClosest = (selector) => {
        const cards = document.querySelectorAll(selector);
        if (!cards.length) return;

        const viewportHeight = window.innerHeight;
        const centerY = viewportHeight / 2;

        let closestCard = null;
        let minDistance = Infinity;

        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.top + rect.height / 2;
          const distance = Math.abs(cardCenter - centerY);

          if (distance < minDistance) {
            minDistance = distance;
            closestCard = card;
          }
        });

        cards.forEach(card => {
          if (card === closestCard) {
            card.classList.add('active');
          } else {
            card.classList.remove('active');
          }
        });
      };

      selectors.forEach(selector => highlightClosest(selector));
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const [laptopHovered, setLaptopHovered] = useState(false);

  const scrollToProblems = () => {
    document.getElementById('problem-section').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="landing-logo">
          <img src="/ui_assets/acadence_ai_logo.png" alt="Acadence AI Logo" className="logo-img" />
          <span className="logo-text">
            {"ACADENCE AI".split("").map((char, index) => (
              <span key={index} style={{ '--char-index': index }}>{char}</span>
            ))}
          </span>
        </div>
        <nav className="landing-nav">
          <span className="nav-link nav-link-student" onClick={() => document.getElementById('built-for-section').scrollIntoView({ behavior: 'smooth' })}>For Students</span>
          <span className="nav-link nav-link-faculty" onClick={() => document.getElementById('built-for-section').scrollIntoView({ behavior: 'smooth' })}>For Faculty</span>
          <span className="nav-link nav-link-how" onClick={() => document.getElementById('how-it-works-section').scrollIntoView({ behavior: 'smooth' })}>How It Works</span>
          <span className="nav-link nav-link-resources" onClick={() => document.getElementById('helps-section').scrollIntoView({ behavior: 'smooth' })}>Resources</span>
          <span className="nav-link nav-link-about" onClick={scrollToProblems}>About Us</span>
        </nav>
        <div className="landing-nav-actions">
          <button className="btn btn-ghost-silver" onClick={() => onNavigate("login")}>Login</button>
          <button className="btn btn-gradient-get-started" onClick={() => onNavigate("register")}>
            Get Started <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-grid">
          {/* Hero Left: Text Content */}
          <div className="hero-left reveal-slide-left">
            <h1 
              className={`hero-title ${titleHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setTitleHovered(true)}
              onMouseLeave={() => setTitleHovered(false)}
            >
              <span className="hero-title-text default-text">
                Knowledge Never <br />Graduates.
              </span>
              <span className="hero-title-text hover-text">
                <span className="title-line">
                  {"Welcome to ".split("").map((char, idx) => (
                    <span key={idx} style={{ "--char-index": idx }} className="hover-char">
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
                <br />
                <span className="title-line">
                  {"Acadence AI".split("").map((char, idx) => (
                    <span key={idx} style={{ "--char-index": idx + 11 }} className="hover-char">
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                </span>
              </span>
            </h1>
            <p className="hero-subtitle">
              Acadence AI is your intelligent campus companion that helps you find, understand, and apply knowledge—anytime, anywhere.
            </p>
            <div className="hero-actions">
              <button className="btn btn-gradient-get-started btn-large" onClick={() => onNavigate("register")}>
                Get Started for Free <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </button>
              <button className="btn btn-secondary btn-large" onClick={scrollToProblems}>
                Explore Resources
              </button>
            </div>
            {/* Features Row */}
            <div className="hero-features-list">
              <div className="hero-feature-item">
                <div className="feature-icon-circle purple">
                  <Search size={18} />
                </div>
                <div className="feature-text-group">
                  <strong>Smart Search</strong>
                  <span className="feature-desc">Find anything instantly</span>
                </div>
              </div>
              <div className="hero-feature-item">
                <div className="feature-icon-circle green">
                  <BookOpen size={18} />
                </div>
                <div className="feature-text-group">
                  <strong>Trusted Knowledge</strong>
                  <span className="feature-desc">Verified by faculty</span>
                </div>
              </div>
              <div className="hero-feature-item">
                <div className="feature-icon-circle blue">
                  <Terminal size={18} />
                </div>
                <div className="feature-text-group">
                  <strong>Always Available</strong>
                  <span className="feature-desc">24/7 AI assistance</span>
                </div>
              </div>
              <div className="hero-feature-item">
                <div className="feature-icon-circle pink">
                  <CheckCircle size={18} />
                </div>
                <div className="feature-text-group">
                  <strong>Made for Campus</strong>
                  <span className="feature-desc">Built for students</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className={`hero-right reveal-slide-right ${heroRightVisible ? 'visible' : ''} ${laptopHovered ? 'laptop-hovered' : ''}`}
            onMouseEnter={() => setLaptopHovered(true)}
            onMouseLeave={() => setLaptopHovered(false)}
            onClick={() => setLaptopHovered(!laptopHovered)}
          >
            {/* Concentric Rotating Rings & Glow */}
            <div className="hero-bg-glow"></div>
            <div className="concentric-ring ring-1"></div>
            <div className="concentric-ring ring-2"></div>
            <div className="concentric-ring ring-3"></div>

            <div className="hero-interactive-scene">
              {/* Central Student Illustration */}
              <div className="hero-illustration-wrapper">
                <img src="/ui_assets/pic1.png" alt="Student with Laptop" className="hero-student-img" />
                <div className="laptop-screen-glow"></div>
              </div>

              {/* Floating macOS-Style Browser Mockup emerging from laptop screen */}
              <div className="laptop-screen-mockup">
                {/* macOS Chrome Header */}
                <div className="mockup-header">
                  <div className="mac-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <div className="mockup-url-bar">
                    <Lock size={9} className="url-lock-icon" />
                    <span>acadence.ai/dashboard</span>
                  </div>
                </div>

                {/* Mockup Dashboard Content */}
                <div className="mockup-body">
                  {/* Top search bar in mockup */}
                  <div className="mockup-search-container">
                    <div className="mockup-search-bar">
                      <Search size={11} className="search-icon" />
                      <span className="typing-text">Search notes, previous papers, interviews...</span>
                    </div>
                  </div>

                  {/* Dashboard Grid */}
                  <div className="mockup-grid">
                    {/* Item 1: Interview Experiences */}
                    <div className="mockup-card panel-interview">
                      <div className="card-top">
                        <span className="card-icon">💼</span>
                        <span className="card-title">Interviews</span>
                      </div>
                      <span className="card-subtitle">Zoho, TCS, Microsoft</span>
                    </div>

                    {/* Item 2: Previous Papers */}
                    <div className="mockup-card panel-papers">
                      <div className="card-top">
                        <span className="card-icon">📄</span>
                        <span className="card-title">Papers</span>
                      </div>
                      <span className="card-subtitle">CSE, ECE, IT, EEE</span>
                    </div>

                    {/* Item 3: Subject Notes */}
                    <div className="mockup-card panel-notes">
                      <div className="card-top">
                        <span className="card-icon">📝</span>
                        <span className="card-title">Subject Notes</span>
                      </div>
                      <span className="card-subtitle">DBMS, OS, CN, Compiler</span>
                    </div>

                    {/* Item 4: Projects */}
                    <div className="mockup-card panel-projects">
                      <div className="card-top">
                        <span className="card-icon">🛠️</span>
                        <span className="card-title">Projects</span>
                      </div>
                      <span className="card-subtitle">Mini & Major Reports</span>
                    </div>
                  </div>

                  {/* AI Study Assistant Chatbot widget */}
                  <div className="mockup-ai-widget">
                    <div className="ai-header">
                      <span>Senior AI</span>
                      <span className="status-dot"></span>
                    </div>
                    <div className="ai-chat-bubble">
                      <p className="ai-text">Explain the difference between TCP and UDP with a real-life analogy.</p>
                    </div>
                    <div className="ai-input-bar">
                      <span>Ask AI anything...</span>
                      <div className="ai-send-btn">
                        <ArrowRight size={10} color="#fff" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Problem We All Face */}
      <section id="problem-section" className="landing-section reveal-fade">
        <div className="problem-grid">
          <div className="problem-left reveal-slide-left">
            <span className="section-label red-label">The Problem We All Face</span>
            <h2 className="section-title text-left">
              Knowledge gets lost. <br />You end up starting from zero.
            </h2>
            <p className="section-desc">
              Every year, students spend countless hours searching for notes, previous papers, projects, and interview experiences. Important resources are scattered, outdated, or lost forever when seniors graduate.
            </p>
          </div>
          
          <div className="problem-right reveal-slide-right">
            <div className="problem-card">
              <div className="problem-row">
                <div className="problem-col">
                  <div className="problem-icon-circle">
                    <FolderArchive size={28} />
                  </div>
                  <span className="problem-col-label">Scattered Resources</span>
                  <div className="problem-cross-circle">✕</div>
                </div>
                <div className="problem-col">
                  <div className="problem-icon-circle">
                    <FileClock size={28} />
                  </div>
                  <span className="problem-col-label">Outdated Materials</span>
                  <div className="problem-cross-circle">✕</div>
                </div>
                <div className="problem-col">
                  <div className="problem-icon-circle">
                    <RefreshCw size={28} />
                  </div>
                  <span className="problem-col-label">Repeated Effort</span>
                  <div className="problem-cross-circle">✕</div>
                </div>
                <div className="problem-col">
                  <div className="problem-icon-circle">
                    <UserX size={28} />
                  </div>
                  <span className="problem-col-label">Limited Guidance</span>
                  <div className="problem-cross-circle">✕</div>
                </div>
                <div className="problem-col">
                  <div className="problem-icon-circle">
                    <Target size={28} />
                  </div>
                  <span className="problem-col-label">Missed Opportunities</span>
                  <div className="problem-cross-circle">✕</div>
                </div>
              </div>
              <div className="problem-card-footer">
                This leads to stress, wasted time, and missed opportunities.
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Section 3: The Smarter Way */}
      <section className="landing-section reveal-fade">
        <div className="smarter-way-grid">
          <div className="smarter-left reveal-slide-left">
            <span className="section-label blue-label">The Smarter Way</span>
            <h2 className="section-title text-left">
              All campus knowledge. <br />One intelligent platform.
            </h2>
            <p className="section-desc">
              Acadence AI organizes and connects all institutional knowledge in one place and uses intelligent search and AI assistance to deliver the right answer when you need it.
            </p>
          </div>

          <div className="smarter-right reveal-slide-right">
            <div className="smarter-cards-grid">
              <div className="smarter-card">
                <div className="smarter-card-icon orange">
                  <Folder size={24} />
                </div>
                <h4>Centralized</h4>
                <p>All notes, papers, projects and more in one place.</p>
              </div>
              <div className="smarter-card">
                <div className="smarter-card-icon blue">
                  <Search size={24} />
                </div>
                <h4>Intelligent Search</h4>
                <p>Ask in your own words get accurate answers.</p>
              </div>
              <div className="smarter-card">
                <div className="smarter-card-icon pink">
                  <Brain size={24} />
                </div>
                <h4>AI Assistance</h4>
                <p>Understand, summarize, practice, and learn faster.</p>
              </div>
              <div className="smarter-card">
                <div className="smarter-card-icon green">
                  <ShieldCheck size={24} />
                </div>
                <h4>Trusted & Verified</h4>
                <p>Quality content reviewed by faculty and peers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Built for Everyone on Campus */}
      <section id="built-for-section" className="landing-section reveal-fade">
        <h2 className="section-title">Built for Everyone on Campus</h2>
        <p className="section-subtitle" style={{ marginBottom: 40 }}>
          Providing tailored workflows to empower both learning paths and guide systems.
        </p>

        <div className="grid-2" style={{ gap: 30 }}>
          {/* For Students Card */}
          <div className="built-for-card reveal-slide-left">
            <div className="built-for-text">
              <h3>For Students</h3>
              <div className="built-for-bullets">
                <div className="bullet-item"><CheckCircle size={16} /> Find the right study material in seconds</div>
                <div className="bullet-item"><CheckCircle size={16} /> Prepare better for exams and interviews</div>
                <div className="bullet-item"><CheckCircle size={16} /> Get AI help for concepts, summaries & more</div>
                <div className="bullet-item"><CheckCircle size={16} /> Save time and focus on learning</div>
              </div>
            </div>
            <div className="built-for-img-wrapper">
              <img src="/ui_assets/pic15.png" alt="For Students Illustration" />
            </div>
          </div>

          {/* For Faculty Card */}
          <div className="built-for-card reveal-slide-right">
            <div className="built-for-text">
              <h3>For Faculty & Admins</h3>
              <div className="built-for-bullets">
                <div className="bullet-item"><CheckCircle size={16} /> Share verified content with ease</div>
                <div className="bullet-item"><CheckCircle size={16} /> Guide students with better resources</div>
                <div className="bullet-item"><CheckCircle size={16} /> Track knowledge areas and gaps</div>
                <div className="bullet-item"><CheckCircle size={16} /> Build a smarter knowledge ecosystem</div>
              </div>
            </div>
            <div className="built-for-img-wrapper">
              <img src="/ui_assets/pic16.png" alt="For Faculty Illustration" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: How It Helps You, Every Day */}
      <section id="helps-section" className="landing-section reveal-slide-up">
        <h2 className="section-title">How It Helps You, Every Day</h2>
        <div className="helps-grid">
          <div className="help-box">
            <div className="help-box-icon"><MessageSquare size={22} color="var(--color-ocean)" /></div>
            <h4>Ask Anything</h4>
            <p>Ask questions in natural language and get instant answers with sources.</p>
          </div>
          <div className="help-box">
            <div className="help-box-icon"><BookOpen size={22} color="var(--color-emerald)" /></div>
            <h4>Study Better</h4>
            <p>Summaries, flashcards, quizzes and explanations made easy.</p>
          </div>
          <div className="help-box">
            <div className="help-box-icon"><Briefcase size={22} color="var(--color-crimson)" /></div>
            <h4>Prepare Confidently</h4>
            <p>Access real interview experiences, papers and placement insights.</p>
          </div>
          <div className="help-box">
            <div className="help-box-icon"><Code size={22} color="var(--color-ocean)" /></div>
            <h4>Work on Projects</h4>
            <p>Explore project ideas, reports, code and documentation.</p>
          </div>
          <div className="help-box">
            <div className="help-box-icon"><TrendingUp size={22} color="var(--color-emerald)" /></div>
            <h4>Stay Ahead</h4>
            <p>Personalized recommendations and learning paths.</p>
          </div>
        </div>
      </section>

      {/* Section 6: How It Works */}
      <section id="how-it-works-section" className="landing-section reveal-slide-up">
        <h2 className="section-title">How It Works</h2>
        <div className="how-it-works-grid">
          <div className="how-step">
            <span className="step-num">1</span>
            <div className="how-step-icon blue">
              <Search size={26} />
            </div>
            <h4>Find</h4>
            <p>Search or ask anything in natural language.</p>
          </div>

          <div className="how-step">
            <span className="step-num">2</span>
            <div className="how-step-icon green">
              <FileText size={26} />
            </div>
            <h4>Get Intelligent Results</h4>
            <p>AI finds the most relevant and verified content.</p>
          </div>

          <div className="how-step">
            <span className="step-num">3</span>
            <div className="how-step-icon pink">
              <Brain size={26} />
            </div>
            <h4>Understand & Learn</h4>
            <p>AI helps you understand better with summaries and explanations.</p>
          </div>

          <div className="how-step">
            <span className="step-num">4</span>
            <div className="how-step-icon red">
              <TrendingUp size={26} />
            </div>
            <h4>Apply & Succeed</h4>
            <p>Use knowledge in exams, interviews, projects and beyond.</p>
          </div>
        </div>
      </section>

      {/* Section 7: Be Part of a Smarter Campus Banner */}
      <section className="landing-section reveal-zoom">
        <div className="cta-banner-card">
          <div className="cta-banner-grid">
            <div className="cta-banner-img-wrapper">
              <img src="/ui_assets/pic20.png" alt="Students Group" className="cta-banner-img" />
            </div>
            <div className="cta-banner-text">
              <h2>Be Part of a Smarter Campus</h2>
              <p>Learn better, share knowledge, and grow together. Acadence AI is here to help you achieve more.</p>
              <div className="cta-banner-actions">
                <button className="btn btn-gradient-get-started" onClick={() => onNavigate("register")}>Get Started for Free</button>
                <button className="btn btn-secondary-white" onClick={scrollToProblems}>See How It Works</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Signup Section containing Auth removed for separate page routing */}

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="landing-logo">
              <img src="/ui_assets/acadence_ai_logo.png" alt="Acadence AI Logo" className="logo-img" />
              <span>Acadence AI</span>
            </div>
            <p className="footer-desc-text">Empowering students and faculty with intelligent access to campus knowledge.</p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-col">
              <h5>For Students</h5>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('explorer')}>Study Resources</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('interviews')}>Interview Hub</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('project-hub')}>Project Catalog</span>
            </div>
            <div className="footer-col">
              <h5>For Faculty</h5>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('resource-mgmt')}>Verify Contents</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('resource-mgmt')}>Moderate Vault</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('admin-dashboard')}>Check Statistics</span>
            </div>
            <div className="footer-col">
              <h5>Company</h5>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('about')}>About Project</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('roadmap')}>Roadmap</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('contact')}>Contact Us</span>
            </div>
            <div className="footer-col">
              <h5>Support</h5>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('help')}>Help Center</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('feedback')}>Feedback</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('terms')}>Terms of Use</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Acadence AI. All rights reserved. Peer-to-Peer Academic Ecosystem.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
