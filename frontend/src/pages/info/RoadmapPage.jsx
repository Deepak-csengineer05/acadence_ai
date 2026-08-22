import React from 'react';
import { 
  Sparkles, ArrowLeft, Heart, ShieldCheck, 
  MessageSquare, Zap, Rocket, Compass, Target, CheckCircle2 
} from 'lucide-react';

function RoadmapPage({ setActiveTab, isPublic = false }) {
  const storyChapters = [
    {
      chapter: "Chapter 1",
      badge: "The Origin Story",
      title: "The Spark — How the Idea Came",
      icon: <Sparkles size={22} style={{ color: 'var(--color-amber)' }} />,
      gradient: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(225,29,72,0.06) 100%)",
      border: "rgba(245,158,11,0.25)",
      story: "Every single academic year, the exact same cycle repeated itself. Graduating seniors walked out with a wealth of knowledge—handwritten exam prep notes, previous year question paper solutions, lab records, and real placement interview experiences from companies like Zoho, Microsoft, and TCS. Yet, once they left campus, all those resources vanished or got buried in messy chat groups. Incoming juniors were forced to restart from ground zero every semester.",
      highlights: [
        "Knowledge was lost when seniors graduated",
        "Juniors spent hours begging for old exam papers and interview questions",
        "Repeated effort year after year with zero institutional memory"
      ]
    },
    {
      chapter: "Chapter 2",
      badge: "The Foundation",
      title: "The First Steps — How We Started",
      icon: <Compass size={22} style={{ color: 'var(--color-blue)' }} />,
      gradient: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.06) 100%)",
      border: "rgba(59,130,246,0.25)",
      story: "We set out to build a platform that felt like a living campus memory. But we faced a major challenge: privacy and cost. Commercial cloud AI tools were expensive, and universities couldn't risk student notes or internal syllabus files leaking online. So we engineered Acadence AI to be 100% offline-first. By embedding local vector search and local AI models running directly on campus hardware, we created a fast, zero-cost, privacy-guaranteed intelligence hub.",
      highlights: [
        "Engineered 100% offline-first architecture for zero cloud data leakage",
        "Integrated local RAG vector search for instant textbook chunk retrieval",
        "Created an intuitive glassmorphic interface built for students and faculty"
      ]
    },
    {
      chapter: "Chapter 3",
      badge: "Current Capabilities",
      title: "Where We Are Today — What Acadence AI Provides Now",
      icon: <CheckCircle2 size={22} style={{ color: 'var(--color-emerald)' }} />,
      gradient: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.06) 100%)",
      border: "rgba(16,185,129,0.25)",
      story: "Today, Acadence AI is a fully functional peer-to-peer academic and placement hub! Juniors can ask Senior AI any complex course question and receive grounded answers with clickable source citation badges [1], [2] linked directly to verified PDFs. Seniors are rewarded with contribution points, daily streak flames, and leaderboard badges for sharing notes and placement reviews.",
      highlights: [
        "Senior AI with grounded responses and clickable citation popovers",
        "Speech-to-Text Voice Input for seamless natural conversational querying",
        "Dedicated Campus Placement & Interview Experience Hub",
        "Gamified contribution points, daily streak flames, and prestige badges",
        "Instant document uploads with background AI auto-tagging",
        "Verified course vault organized by department and subject codes"
      ]
    },
    {
      chapter: "Chapter 4",
      badge: "The Future Horizon",
      title: "The Horizon — What We Are Building Next",
      icon: <Target size={22} style={{ color: 'var(--color-violet)' }} />,
      gradient: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(225,29,72,0.06) 100%)",
      border: "rgba(139,92,246,0.25)",
      story: "Our journey is just beginning. We are expanding Acadence AI into an active recall study partner and automated placement recruiter. Soon, students will be able to convert any uploaded note into interactive AI flashcard quizzes, practice real-time voice technical mock interviews with an AI recruiter, and digitize handwritten whiteboard notes with automated Vision OCR.",
      highlights: [
        "1-Click AI Flashcard Generator & Spaced Repetition Active Recall Quizzes",
        "Interactive Voice & Text AI Mock Technical Placement Interviewer",
        "Automated Vision OCR for parsing handwritten notes and whiteboard pics",
        "Personalized Class Timetable & Midterm Exam Countdown Widget",
        "Canvas & Moodle LMS synchronization for automated syllabus ingestion",
        "Multi-Tenant support allowing multiple universities to connect"
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto' }}>
      {/* Back Header - Only shown inside main app */}
      {!isPublic && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setActiveTab ? setActiveTab('dashboard') : window.history.back()}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Our Story & Journey
          </span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="panel" style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(139,92,246,0.06) 100%)',
        border: '1px solid rgba(245,158,11,0.2)',
        padding: '32px 36px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 10px', fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          The Story of Acadence AI
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 700, margin: '0 auto', lineHeight: 1.6 }}>
          How a common campus frustration sparked a movement to preserve university knowledge, empower students, and build the future of offline academic AI.
        </p>
      </div>

      {/* Story Chapters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {storyChapters.map((ch, idx) => (
          <div 
            key={idx} 
            className="panel" 
            style={{ 
              background: ch.gradient,
              border: `1px solid ${ch.border}`,
              padding: '28px 32px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {ch.icon}
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {ch.chapter}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)'
                }}>
                  {ch.badge}
                </span>
              </div>
            </div>

            <h2 style={{ margin: '0 0 12px', fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
              {ch.title}
            </h2>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 20px' }}>
              {ch.story}
            </p>

            {/* Highlights Box */}
            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>
                Key Takeaways & Milestones
              </div>
              {ch.highlights.map((item, hIdx) => (
                <div key={hIdx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-primary)' }}>
                  <Rocket size={14} style={{ color: 'var(--color-blue)', flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Story Footer */}
      <div className="panel" style={{ textAlign: 'center', padding: '32px' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Be part of the next chapter!</h3>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Share your study notes, interview reviews, or ideas to help us build a smarter campus together.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab && setActiveTab('upload')}>
            <Zap size={15} /> Contribute Materials
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => setActiveTab && setActiveTab('feedback')}
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
          >
            <Heart size={15} style={{ color: 'var(--color-red)' }} /> Share Your Ideas
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoadmapPage;
