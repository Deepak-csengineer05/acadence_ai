import React, { useState } from 'react';
import { 
  HelpCircle, Search, ChevronDown, ChevronUp, BookOpen, 
  MessageSquare, UploadCloud, Award, ShieldCheck, ArrowLeft, 
  GraduationCap, Mic, Briefcase, Zap 
} from 'lucide-react';

function HelpCenterPage({ setActiveTab, isPublic = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const faqCategories = [
    {
      category: "For Juniors — Getting Started & Exam Prep",
      icon: <GraduationCap size={18} style={{ color: 'var(--color-blue)' }} />,
      items: [
        {
          id: 1,
          q: "How does Acadence AI help me prepare for semester exams?",
          a: "Acadence AI gives you instant access to verified course notes, previous year question paper (PYQ) solutions, and lab records uploaded by seniors from your exact department. You can query Senior AI to explain difficult syllabus topics in plain English."
        },
        {
          id: 2,
          q: "Where can I find placement interview questions for specific tech companies?",
          a: "Head to the Interview Hub tab in the main navigation. You can filter by company name (e.g. Zoho, Microsoft, TCS, Infosys) to read real student interview experiences, round timelines, aptitude questions, and technical interview questions."
        },
        {
          id: 3,
          q: "How do I download or save study materials for offline revision?",
          a: "Inside the Knowledge Explorer tab, click on any document card to view its full details and click the 'Download PDF' button. Downloaded materials remain saved in your browser cache and local drive for offline revision."
        }
      ]
    },
    {
      category: "For Seniors — Contribution Points, Placement Hub & Badges",
      icon: <Award size={18} style={{ color: 'var(--color-amber)' }} />,
      items: [
        {
          id: 4,
          q: "How do I earn contribution points, streak flames, and badges?",
          a: "Uploading notes or interview reviews awards +20 contribution points upon verification. Every time a junior upvotes your resource, you earn +10 points. Logging into Acadence AI daily maintains your streak flame, unlocking badges at 5, 10, and 100+ points."
        },
        {
          id: 5,
          q: "How do I share my placement interview experience with juniors?",
          a: "Navigate to the Interview Hub tab and click 'Share Interview Experience'. Fill in the company name, role, interview rounds, coding questions asked, and your personal preparation tips."
        },
        {
          id: 6,
          q: "Can I edit or track the upvotes on my uploaded study materials?",
          a: "Yes! Visit the 'My Contributions' page from your user menu to see total views, upvotes earned, point history, and the status of your submitted files."
        }
      ]
    },
    {
      category: "Senior AI Chat & Voice Input",
      icon: <MessageSquare size={18} style={{ color: 'var(--color-violet)' }} />,
      items: [
        {
          id: 7,
          q: "What are the clickable citation badges like [1], [2] in Senior AI chat?",
          a: "Senior AI is 100% grounded in verified local course materials. Whenever Senior AI answers your prompt, it attaches clickable citation badges [1], [2]. Clicking a badge popover reveals the exact paragraph, author, and PDF document used to answer your query."
        },
        {
          id: 8,
          q: "How do I use Voice Input (Speech-to-Text) with Senior AI?",
          a: "Inside Senior AI Chat, click the Microphone button next to the chat input field. Grant your browser microphone permission, speak your question out loud, and watch your voice convert to text in real-time."
        },
        {
          id: 9,
          q: "Does Senior AI send my chat prompts to third-party cloud AI servers?",
          a: "No. Senior AI operates 100% offline using local AI (Ollama qwen3:8b) and Qdrant local vector search running directly inside your campus server intranet. Zero prompt text or student data ever leaves campus."
        }
      ]
    },
    {
      category: "For Professors & Faculty — Course Materials & Verification",
      icon: <ShieldCheck size={18} style={{ color: 'var(--color-emerald)' }} />,
      items: [
        {
          id: 10,
          q: "How can faculty members upload official syllabus guidelines and lecture slides?",
          a: "Faculty members can upload official course slides, lab manuals, and sample assignment solutions through the standard upload portal, marking them with course codes so students get instant verified answers in Senior AI."
        },
        {
          id: 11,
          q: "How is academic integrity and content quality maintained?",
          a: "All uploaded student materials undergo quick verification before being published to the student catalog. AI auto-tagging extracts key subject topics instantly so students can search by exact course codes."
        }
      ]
    }
  ];

  const toggleAccordion = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto' }}>
      {/* Back Header - Only shown when inside main app */}
      {!isPublic && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => setActiveTab ? setActiveTab('dashboard') : window.history.back()}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Campus Help Center & FAQs
          </span>
        </div>
      )}

      {/* Hero Search Banner */}
      <div className="panel" style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        padding: '32px 36px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          How can we help you today?
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Find instant answers for Juniors, Seniors, Professors, and AI Chat users.
        </p>

        <div style={{ position: 'relative', width: '100%', maxWidth: 560, margin: '0 auto' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: 16, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)',
              pointerEvents: 'none',
              zIndex: 2
            }} 
          />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search FAQs (e.g. citations, points, voice)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%',
              boxSizing: 'border-box',
              paddingLeft: 46, 
              paddingRight: 16,
              height: 46, 
              fontSize: 14, 
              borderRadius: 'var(--radius-full)' 
            }}
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {faqCategories.map((cat, cIdx) => {
          const matchingItems = cat.items.filter(item => 
            !searchQuery || 
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (matchingItems.length === 0) return null;

          return (
            <div key={cIdx} className="panel">
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {cat.icon} {cat.category}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matchingItems.map(item => {
                  const isOpen = expandedId === item.id || searchQuery.length > 0;
                  return (
                    <div 
                      key={item.id} 
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden'
                      }}
                    >
                      <button 
                        onClick={() => toggleAccordion(item.id)}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: 'var(--text-primary)',
                          fontWeight: 700,
                          fontSize: 14
                        }}
                      >
                        <span>{item.q}</span>
                        {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-blue)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                      </button>

                      {isOpen && (
                        <div style={{ padding: '0 18px 16px', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HelpCenterPage;
