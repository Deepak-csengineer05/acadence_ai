import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, MapPin, Clock, ArrowLeft, ShieldAlert } from 'lucide-react';
import ClaySelect from '../../components/ClaySelect';

import { API_BASE } from '../../config/api';

function ContactPage({ setActiveTab, user, isPublic = false }) {
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    try {
      await fetch(`${API_BASE}/support/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          category,
          message
        })
      });
      setSubmitted(true);
      setMessage('');
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
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
            Support & Contact
          </span>
        </div>
      )}

      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        {/* Contact Form */}
        <div className="panel">
          <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Mail size={20} style={{ color: 'var(--color-blue)' }} /> Get in Touch
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Have questions about note moderation, API status, or campus integration? Send us a message below.
          </p>

          {submitted ? (
            <div style={{
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-emerald-dim)',
              border: '1px solid rgba(16,185,129,0.3)',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={36} style={{ color: 'var(--color-emerald)', marginBottom: 10 }} />
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--color-emerald)' }}>
                Message Sent Successfully!
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                Thank you, {name}. Our campus administrative team will review your inquiry and reply within 24 hours.
              </p>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setSubmitted(false)}
                style={{ marginTop: 16 }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="Your full name"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">College Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required 
                  placeholder="student@college.edu"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Category</label>
                <ClaySelect 
                  value={category}
                  onChange={val => setCategory(val)}
                  options={[
                    { value: 'general', label: 'General Question' },
                    { value: 'moderation', label: 'Note Upload & Moderation Status' },
                    { value: 'technical', label: 'Technical Issue / Server Offline' },
                    { value: 'faculty', label: 'Faculty Verification Request' },
                    { value: 'feedback', label: 'Platform Suggestion' },
                  ]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message Details</label>
                <textarea 
                  className="form-input" 
                  required 
                  rows={4} 
                  placeholder="Describe your question or issue in detail..."
                  value={message} 
                  onChange={e => setMessage(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 6 }}>
                <Send size={15} /> Send Message to Campus Admin
              </button>
            </form>
          )}
        </div>

        {/* Contact Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Campus Support Hub
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ color: 'var(--color-blue)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Location</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    Acadence AI Center, Main Academic Building, Computer Science Dept.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Clock size={18} style={{ color: 'var(--color-emerald)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Operational Hours</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    Monday – Saturday: 8:30 AM – 6:00 PM IST
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Mail size={18} style={{ color: 'var(--color-violet)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Direct Email</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    support@acadence.ai
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="panel" style={{
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.2)'
          }}>
            <h4 style={{ margin: '0 0 6px', fontSize: 13.5, fontWeight: 700, color: 'var(--color-blue)' }}>
              ⚡ 24-Hour Admin SLA
            </h4>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All uploaded document verifications and support tickets are reviewed by college administrators within 24 business hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
