import React from 'react';
import { ShieldCheck, FileText, Lock, CheckCircle2, ArrowLeft, AlertTriangle } from 'lucide-react';

function TermsPage({ setActiveTab, isPublic = false }) {
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
            Legal & Governance
          </span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="panel" style={{
        background: 'linear-gradient(135deg, rgba(244,63,94,0.06) 0%, rgba(59,130,246,0.06) 100%)',
        border: '1px solid rgba(244,63,94,0.2)',
        padding: '28px 32px'
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={24} style={{ color: 'var(--color-blue)' }} /> Terms of Use & Academic Integrity Policy
        </h1>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Effective Date: Academic Year 2026. Acadence AI is a peer-to-peer university repository dedicated to collaborative, ethical learning.
        </p>
      </div>

      {/* Policy Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Section 1: Academic Integrity */}
        <div className="panel">
          <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} style={{ color: 'var(--color-blue)' }} /> 1. Academic Integrity & Responsible Use
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            Acadence AI is built for legitimate study assistance, exam preparation, and career guidance. Students agree not to upload live, ongoing exam answer keys or active test solutions while exams are underway. All study notes, previous year question papers (PYQs), and placement interview reviews must represent genuine, student-contributed academic work.
          </p>
        </div>

        {/* Section 2: Data Privacy */}
        <div className="panel">
          <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={18} style={{ color: 'var(--color-emerald)' }} /> 2. 100% Intranet Data Privacy
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            Your privacy is guaranteed by design. All query text processed by Senior AI and vector indexing performed by Qdrant execute strictly on local campus server infrastructure. No personal student details or uploaded note contents are sold, shared, or sent to commercial third-party cloud AI vendors.
          </p>
        </div>

        {/* Section 3: Content Moderation */}
        <div className="panel">
          <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} style={{ color: 'var(--color-amber)' }} /> 3. Librarian Moderation & Content Removal
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            College administrators and faculty moderators reserve the right to edit document metadata, assign appropriate course codes, or permanently purge any document that violates campus standards, contains offensive content, or duplicates existing materials.
          </p>
        </div>

        {/* Section 4: Contribution Rewards */}
        <div className="panel">
          <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} style={{ color: 'var(--color-violet)' }} /> 4. Contribution Points & Gamification Policy
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
            Contribution points and leaderboard badges are awarded based on verified, peer-upvoted academic contributions. Points hold no monetary value and serve exclusively to recognize peer mentorship within the university community.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
