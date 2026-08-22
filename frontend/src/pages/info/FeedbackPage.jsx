import React, { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, ArrowLeft, Heart, Sparkles } from 'lucide-react';
import ClaySelect from '../../components/ClaySelect';

import { API_BASE } from '../../config/api';

function FeedbackPage({ setActiveTab, user, isPublic = false }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('feature');
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion) return;
    try {
      await fetch(`${API_BASE}/support/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.full_name || 'Anonymous Student',
          email: user?.email || 'student@acadence.ai',
          category: feedbackType,
          message: suggestion,
          rating
        })
      });
      setSubmitted(true);
      setSuggestion('');
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 840, margin: '0 auto' }}>
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
            Platform Feedback
          </span>
        </div>
      )}

      <div className="panel">
        <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Sparkles size={20} style={{ color: 'var(--color-amber)' }} /> Help Shape Acadence AI
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 24 }}>
          We build Acadence AI directly based on student and faculty suggestions. Share your ideas, feature requests, or report UI bugs below.
        </p>

        {submitted ? (
          <div style={{
            padding: '28px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-emerald-dim)',
            border: '1px solid rgba(16,185,129,0.3)',
            textAlign: 'center'
          }}>
            <CheckCircle2 size={40} style={{ color: 'var(--color-emerald)', marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: 'var(--color-emerald)' }}>
              Thank You for Your Feedback!
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
              Your rating of {rating}/5 stars and feature suggestion have been submitted to the product development team.
            </p>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setSubmitted(false)}
              style={{ marginTop: 18 }}
            >
              Submit Another Suggestion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Star Rating Picker */}
            <div className="form-group">
              <label className="form-label">How would you rate your overall experience?</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.15s ease'
                    }}
                  >
                    <Star 
                      size={28} 
                      style={{
                        color: (hoverRating || rating) >= star ? '#fbbf24' : 'var(--text-muted)',
                        fill: (hoverRating || rating) >= star ? '#fbbf24' : 'transparent'
                      }} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Type Selector */}
            <div className="form-group">
              <label className="form-label">Feedback Type</label>
              <ClaySelect 
                value={feedbackType}
                onChange={val => setFeedbackType(val)}
                options={[
                  { value: 'feature', label: '🚀 Feature Request / New Idea' },
                  { value: 'ux', label: '🎨 UI/UX Design Improvement' },
                  { value: 'bug', label: '🐛 Bug Report / Error Issue' },
                  { value: 'general', label: '💭 General Thought or Compliment' },
                ]}
              />
            </div>

            {/* Feedback Input */}
            <div className="form-group">
              <label className="form-label">Your Suggestions & Thoughts</label>
              <textarea 
                className="form-input" 
                required 
                rows={5} 
                placeholder="What features or improvements would make Acadence AI even better for your studies?"
                value={suggestion} 
                onChange={e => setSuggestion(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button className="btn btn-primary" type="submit" style={{ marginTop: 6 }}>
              <Send size={15} /> Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default FeedbackPage;
