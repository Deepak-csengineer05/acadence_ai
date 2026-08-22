import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, CheckCircle2, Clock, Trash2, Filter, Mail, RefreshCw } from 'lucide-react';
import ClaySelect from '../../components/ClaySelect';

function AdminSupportInbox({ token, API_BASE }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const baseUrl = API_BASE || 'http://localhost:8000/api/v1';

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/admin/support-messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) {
      console.error("Error fetching support inbox:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [token, API_BASE]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await fetch(`${baseUrl}/admin/support-messages/${id}/status?status=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${baseUrl}/admin/support-messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    if (categoryFilter !== 'ALL' && msg.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && msg.status !== statusFilter) return false;
    return true;
  });

  const pendingCount = messages.filter(m => m.status === 'PENDING').length;
  const ratingCount = messages.filter(m => m.rating).length;
  const avgRating = ratingCount > 0 
    ? (messages.filter(m => m.rating).reduce((acc, curr) => acc + curr.rating, 0) / ratingCount).toFixed(1)
    : 'N/A';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={22} style={{ color: 'var(--color-blue)' }} /> Student Feedback & Contact Inbox
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
            Review all incoming inquiries, moderation questions, and platform ratings sent by students and faculty.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchMessages} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin-animation' : ''} /> Refresh Inbox
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid-3" style={{ gap: 16 }}>
        <div className="stat-card accent-blue">
          <span className="stat-label">Total Submissions Received</span>
          <span className="stat-value">{messages.length}</span>
        </div>
        <div className="stat-card accent-amber">
          <span className="stat-label">Pending Review Tickets</span>
          <span className="stat-value">{pendingCount}</span>
        </div>
        <div className="stat-card accent-emerald">
          <span className="stat-label">Average Student Rating</span>
          <span className="stat-value">{avgRating} {avgRating !== 'N/A' && '★'}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', overflow: 'visible', position: 'relative', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>
          <Filter size={15} /> Filter Inbox:
        </div>

        <div style={{ minWidth: 180 }}>
          <ClaySelect 
            value={categoryFilter}
            onChange={val => setCategoryFilter(val)}
            options={[
              { value: 'ALL', label: 'All Categories' },
              { value: 'general', label: 'General Question' },
              { value: 'moderation', label: 'Note Upload & Moderation' },
              { value: 'technical', label: 'Technical Issue' },
              { value: 'faculty', label: 'Faculty Request' },
              { value: 'feature', label: '🚀 Feature Request' },
              { value: 'ux', label: '🎨 UI/UX Design' },
              { value: 'bug', label: '🐛 Bug Report' },
            ]}
          />
        </div>

        <div style={{ minWidth: 160 }}>
          <ClaySelect 
            value={statusFilter}
            onChange={val => setStatusFilter(val)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'PENDING', label: '⏳ Pending' },
              { value: 'RESOLVED', label: '✓ Resolved' },
            ]}
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="panel" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading student messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Mail size={36} style={{ color: 'var(--text-muted)', marginBottom: 10, opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              No Messages Found
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              {messages.length === 0 ? 'No student contact or feedback messages submitted yet.' : 'No messages match your selected filters.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                style={{
                  background: 'var(--bg-elevated)',
                  border: `1px solid ${msg.status === 'PENDING' ? 'rgba(245,158,11,0.3)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                      {msg.name}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      ({msg.email})
                    </span>
                    <span style={{
                      padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
                      background: 'rgba(59,130,246,0.12)', color: 'var(--color-blue)', textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      {msg.category}
                    </span>
                    {msg.rating && (
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 3 }}>
                        ★ {msg.rating}/5 Rating
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 800,
                      background: msg.status === 'RESOLVED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: msg.status === 'RESOLVED' ? 'var(--color-emerald)' : 'var(--color-amber)',
                      border: `1px solid ${msg.status === 'RESOLVED' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                    }}>
                      {msg.status === 'RESOLVED' ? '✓ RESOLVED' : '⏳ PENDING'}
                    </span>

                    {msg.status !== 'RESOLVED' && (
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleUpdateStatus(msg.id, 'RESOLVED')}
                        style={{ fontSize: 12, padding: '4px 12px' }}
                      >
                        <CheckCircle2 size={13} style={{ color: 'var(--color-emerald)' }} /> Mark Resolved
                      </button>
                    )}
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDelete(msg.id)}
                      style={{ fontSize: 12, padding: '4px 10px' }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div style={{ 
                  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, 
                  background: 'var(--bg-panel)', padding: '14px 16px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}>
                  {msg.message}
                </div>

                {/* Timestamp */}
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={12} /> Received on: {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSupportInbox;
