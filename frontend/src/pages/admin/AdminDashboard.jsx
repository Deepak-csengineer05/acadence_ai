import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Award, CheckCircle2, AlertCircle, RefreshCw, 
  Megaphone, Cpu, Database, Server, Flame, ArrowRight, ShieldCheck, 
  MessageSquare, Zap, Activity, BarChart2, Plus, X 
} from 'lucide-react';

function AdminDashboard({ reports, token, API_BASE, setActiveTab, fetchDashboardData, pendingResources = [] }) {
  const [systemStatus, setSystemStatus] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Announcement Modal state
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [postingAnn, setPostingAnn] = useState(false);
  const [annStatus, setAnnStatus] = useState(null);

  const [supportMessages, setSupportMessages] = useState([]);

  const baseUrl = API_BASE || 'http://localhost:8000';

  const fetchSupportMessages = async () => {
    try {
      const res = await fetch(`${baseUrl}/admin/support-messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSupportMessages(await res.json());
      }
    } catch (e) {
      console.error("Error fetching support messages:", e);
    }
  };

  const handleUpdateSupportStatus = async (id, status) => {
    try {
      await fetch(`${baseUrl}/admin/support-messages/${id}/status?status=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchSupportMessages();
    } catch (e) {
      console.error("Error updating support status:", e);
    }
  };

  const handleDeleteSupportMessage = async (id) => {
    try {
      await fetch(`${baseUrl}/admin/support-messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchSupportMessages();
    } catch (e) {
      console.error("Error deleting support message:", e);
    }
  };

  const fetchRealtimeMetrics = async () => {
    setRefreshing(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [sysRes, aiRes] = await Promise.all([
        fetch(`${baseUrl}/admin/system-status`, { headers }),
        fetch(`${baseUrl}/admin/ai-monitoring/stats`, { headers })
      ]);

      if (sysRes.ok) {
        setSystemStatus(await sysRes.json());
      }
      if (aiRes.ok) {
        setAiStats(await aiRes.json());
      }
    } catch (e) {
      console.error("Error fetching admin telemetry:", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRealtimeMetrics();
    fetchSupportMessages();
  }, [token, API_BASE]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    setPostingAnn(true);

    try {
      const res = await fetch(`${baseUrl}/admin/announcements?title=${encodeURIComponent(annTitle)}&content=${encodeURIComponent(annContent)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setAnnStatus({ type: 'success', msg: 'Global announcement published to all students!' });
        setAnnTitle('');
        setAnnContent('');
        if (fetchDashboardData) fetchDashboardData();
        setTimeout(() => {
          setAnnStatus(null);
          setShowAnnounceModal(false);
        }, 2000);
      } else {
        setAnnStatus({ type: 'error', msg: 'Failed to post announcement.' });
      }
    } catch (err) {
      setAnnStatus({ type: 'error', msg: 'Network error posting announcement.' });
    } finally {
      setPostingAnn(false);
    }
  };

  const pendingCount = pendingResources ? pendingResources.length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Welcome Panel */}
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 className="panel-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={22} style={{ color: 'var(--color-emerald)' }} /> Executive Command Center & Real-Time Telemetry
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Live real-time operational metrics, AI vector engine status, and campus platform oversight.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={fetchRealtimeMetrics}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? 'spinning' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowAnnounceModal(true)}
            >
              <Megaphone size={14} /> Post Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Pending Action Banner */}
      {pendingCount > 0 && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(225,29,72,0.08) 100%)',
          border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,158,11,0.2)',
              color: 'var(--color-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                {pendingCount} Pending Submission{pendingCount > 1 ? 's' : ''} Awaiting Moderation
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                Student uploads and placement reviews require administrative review before going live.
              </div>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab && setActiveTab('resource-mgmt')}
            style={{ background: 'var(--color-amber)', borderColor: 'var(--color-amber)' }}
          >
            Moderate Submissions <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Main Metric Cards */}
      {reports && (
        <div className="grid-4">
          <div className="stat-card accent-blue">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{reports.summary?.total_students ?? 0}</span>
          </div>
          <div className="stat-card accent-emerald">
            <span className="stat-label">Approved Docs</span>
            <span className="stat-value">{reports.summary?.approved_documents ?? 0}</span>
          </div>
          <div className="stat-card accent-violet">
            <span className="stat-label">Approved Placements</span>
            <span className="stat-value">{reports.summary?.approved_interviews ?? 0}</span>
          </div>
          <div className="stat-card accent-coral">
            <span className="stat-label">Placed Students</span>
            <span className="stat-value">{reports.summary?.placement_success_count ?? 0}</span>
          </div>
        </div>
      )}

      {/* Real-Time System Telemetry & AI Status Grid */}
      <div className="grid-2">
        {/* Real-Time Engine Health */}
        <div className="panel">
          <div className="panel-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} /> Real-Time Engine & Server Telemetry
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* FastAPI API */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Server size={18} style={{ color: 'var(--color-blue)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>FastAPI API Server</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Port 8000 — Local HTTP</div>
                </div>
              </div>
              <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: 'var(--color-emerald)' }}>
                ONLINE 🟢
              </span>
            </div>

            {/* Ollama LLM */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Cpu size={18} style={{ color: 'var(--color-violet)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                    Ollama Local LLM ({systemStatus?.ollama?.target_model || 'qwen3:8b'})
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {systemStatus?.ollama?.url || 'http://localhost:11434'}
                  </div>
                </div>
              </div>
              <span style={{
                padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
                background: systemStatus?.ollama?.online ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                color: systemStatus?.ollama?.online ? 'var(--color-emerald)' : 'var(--color-red)'
              }}>
                {systemStatus?.ollama?.online ? 'OPERATIONAL ⚡' : 'OFFLINE 🔴'}
              </span>
            </div>

            {/* Qdrant Vector Engine */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={18} style={{ color: 'var(--color-emerald)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                    Qdrant Local Vector Engine
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {systemStatus?.qdrant?.indexed_vectors_count ?? 0} Chunks Vectorized
                  </div>
                </div>
              </div>
              <span style={{
                padding: '3px 9px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
                background: systemStatus?.qdrant?.online ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                color: systemStatus?.qdrant?.online ? 'var(--color-emerald)' : 'var(--color-red)'
              }}>
                {systemStatus?.qdrant?.online ? 'ACTIVE 🎯' : 'INACTIVE 🔴'}
              </span>
            </div>

            {/* SQLite Storage */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Zap size={18} style={{ color: 'var(--color-amber)' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>SQLite Database Storage</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>database.db file size</div>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                {systemStatus?.sqlite_db_size_kb ? `${systemStatus.sqlite_db_size_kb} KB` : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time AI Search Analytics */}
        <div className="panel">
          <div className="panel-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={16} /> AI Chatbot Usage & Search Analytics
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Tokens</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-blue)', fontFamily: 'var(--font-heading)' }}>
                {aiStats?.total_tokens_used ?? 0}
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Accuracy Rate</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)' }}>
                {aiStats?.search_accuracy_percentage ?? 100}%
              </div>
            </div>
          </div>

          {/* Popular Student AI Queries */}
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.6px' }}>
            Top Asked Student AI Questions
          </div>
          {aiStats?.popular_queries && aiStats.popular_queries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {aiStats.popular_queries.map((q, idx) => (
                <div key={idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 12.5, padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)'
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>"{q.query}"</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-blue)' }}>{q.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
              No AI chat logs recorded yet today.
            </div>
          )}
        </div>
      </div>

      {/* Top Student Contributors Leaderboard */}
      {reports?.contribution_details && reports.contribution_details.length > 0 && (
        <div className="panel">
          <div className="panel-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={16} style={{ color: 'var(--color-red)' }} /> Top Student Contributors (Leaderboard Rank)
            </span>
          </div>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Academic Year</th>
                  <th style={{ textAlign: 'right' }}>Contribution Points</th>
                </tr>
              </thead>
              <tbody>
                {reports.contribution_details.map((student, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 800, color: idx === 0 ? 'var(--color-amber)' : 'var(--text-muted)' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {student.student_name}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {student.academic_year} Year
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-emerald)', fontSize: 15 }}>
                      {student.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Support & Contact Messages Inbox */}
      <div className="panel" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="panel-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={20} style={{ color: 'var(--color-blue)' }} /> Student Support & Feedback Inbox
          </h2>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
            {supportMessages.length} Messages Received
          </span>
        </div>

        {supportMessages.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No support or contact messages received yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {supportMessages.map((msg) => (
              <div 
                key={msg.id} 
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                      {msg.name}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      ({msg.email})
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                      background: 'rgba(59,130,246,0.12)', color: 'var(--color-blue)', textTransform: 'uppercase'
                    }}>
                      {msg.category}
                    </span>
                    {msg.rating && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24' }}>
                        ★ {msg.rating}/5 Rating
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 800,
                      background: msg.status === 'RESOLVED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: msg.status === 'RESOLVED' ? 'var(--color-emerald)' : 'var(--color-amber)'
                    }}>
                      {msg.status}
                    </span>
                    {msg.status !== 'RESOLVED' && (
                      <button 
                        className="btn btn-secondary btn-sm" 
                        onClick={() => handleUpdateSupportStatus(msg.id, 'RESOLVED')}
                        style={{ fontSize: 11, padding: '3px 10px' }}
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDeleteSupportMessage(msg.id)}
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
                  {msg.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Submitted on: {new Date(msg.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Announcement Modal */}
      {showAnnounceModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 20
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: 500, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Megaphone size={18} style={{ color: 'var(--color-blue)' }} /> Post Global Student Announcement
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAnnounceModal(false)}><X size={18} /></button>
            </div>

            {annStatus && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 14, fontSize: 13, fontWeight: 600,
                background: annStatus.type === 'error' ? 'var(--color-red-dim)' : 'var(--color-emerald-dim)',
                color: annStatus.type === 'error' ? 'var(--color-red)' : 'var(--color-emerald)'
              }}>
                {annStatus.msg}
              </div>
            )}

            <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Announcement Title</label>
                <input 
                  type="text" className="form-input" required placeholder="e.g. Campus Placement Drive Schedule — Zoho 2026"
                  value={annTitle} onChange={e => setAnnTitle(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Announcement Content</label>
                <textarea 
                  className="form-input" required rows={4} placeholder="Details about academic deadlines or placement procedures..."
                  value={annContent} onChange={e => setAnnContent(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAnnounceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={postingAnn}>
                  {postingAnn ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
