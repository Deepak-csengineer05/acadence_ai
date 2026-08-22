import React from 'react';
import { TrendingUp, Heart, Megaphone, ArrowRight, MessageSquare, Search, Zap, Clock, Sparkles, BookOpen } from 'lucide-react';

const TAB_MAP = {
  'ai-chat': { label: 'Senior AI Chat', icon: <MessageSquare size={14} /> },
  'explorer': { label: 'Knowledge Explorer', icon: <Search size={14} /> },
  'interviews': { label: 'Interview Hub', icon: <Zap size={14} /> },
  'upload': { label: 'Upload Materials', icon: <BookOpen size={14} /> },
  'leaderboard': { label: 'Leaderboard & Badges', icon: <Sparkles size={14} /> },
  'notifications': { label: 'Notifications', icon: <Megaphone size={14} /> },
  'profile': { label: 'My Profile', icon: <BookOpen size={14} /> },
  'settings': { label: 'Settings', icon: <Clock size={14} /> },
  'admin-dashboard': { label: 'Admin Dashboard', icon: <TrendingUp size={14} /> },
  'admin-moderate': { label: 'Resource Moderation', icon: <BookOpen size={14} /> },
  'admin-users': { label: 'User Management', icon: <Search size={14} /> },
  'admin-ai-monitoring': { label: 'AI Engine Monitoring', icon: <MessageSquare size={14} /> },
};

const ADMIN_TABS = ['admin-dashboard', 'admin-moderate', 'admin-users', 'admin-ai-monitoring', 'resource-mgmt', 'support-inbox', 'user-mgmt', 'ai-monitoring', 'reports', 'system-status', 'announcements'];

function getRecentlyVisited(userRole) {
  try {
    const stored = JSON.parse(localStorage.getItem('recently_visited_tabs') || '[]');
    if (Array.isArray(stored) && stored.length > 0) {
      const filtered = stored.filter(key => userRole === 'admin' || (!ADMIN_TABS.includes(key) && !key.startsWith('admin-')));
      const items = filtered.map(key => TAB_MAP[key] ? { ...TAB_MAP[key], tab: key } : null).filter(Boolean);
      if (items.length > 0) return items;
    }
  } catch (e) {}
  return [
    { label: 'Senior AI Chat', tab: 'ai-chat', icon: <MessageSquare size={14} /> },
    { label: 'Knowledge Explorer', tab: 'explorer', icon: <Search size={14} /> },
    { label: 'Interview Hub', tab: 'interviews', icon: <Zap size={14} /> },
  ];
}

function Dashboard({ user, announcements, trendingFiles, setActiveTab }) {
  if (!user) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.full_name?.split(' ')[0] || 'Student';

  const recentlyVisited = getRecentlyVisited(user.role);

  // Consistent illustration selection based on name
  const illustrationIndex = user.full_name ? (user.full_name.charCodeAt(0) % 20) + 1 : 14;

  return (
    <div>
      {/* Hero Greeting */}
      <div className="dashboard-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <p className="dashboard-greeting">{greeting}, {firstName}! 👋</p>
          <p className="dashboard-subtitle">
            {trendingFiles.length > 0
              ? `${trendingFiles.length} trending documents in the knowledge base this week.`
              : 'Welcome back to your academic workspace.'}
          </p>
          <div className="dashboard-hero-actions">
            <button className="btn btn-primary" onClick={() => setActiveTab('ai-chat')}>
              <MessageSquare size={15} /> Ask Senior AI
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTab('explorer')}>
              <Search size={15} /> Explore Knowledge
            </button>
          </div>
        </div>
        <div className="dashboard-hero-ill">
          <img 
            src={`/ui_assets/pic${illustrationIndex}.png`} 
            alt="Academic Companion" 
            style={{ 
              height: '110px', 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25))'
            }} 
          />
        </div>
      </div>

      {/* Stat Strip */}
      <div className="stats-strip">
        <div className="stat-card accent-red">
          <div className="stat-icon red"><TrendingUp size={18} /></div>
          <div className="stat-label">Contribution Points</div>
          <div className="stat-value">{user.contribution_points ?? 0}</div>
          <div className="stat-desc">Keep uploading to earn more</div>
        </div>
        <div className="stat-card accent-emerald">
          <div className="stat-icon green"><Zap size={18} /></div>
          <div className="stat-label">Daily Streak</div>
          <div className="stat-value">{user.streak_count ?? 0} <span style={{ fontSize: 16 }}>Days</span></div>
          <div className="stat-desc">Login daily to maintain</div>
        </div>
        <div className="stat-card accent-blue">
          <div className="stat-icon blue"><BookOpen size={18} /></div>
          <div className="stat-label">Knowledge Docs</div>
          <div className="stat-value">{trendingFiles.length}</div>
          <div className="stat-desc">In the knowledge base</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="stat-icon amber"><MessageSquare size={18} /></div>
          <div className="stat-label">Announcements</div>
          <div className="stat-value">{announcements.length}</div>
          <div className="stat-desc">Board posts this month</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-2">
        {/* Announcements */}
        <div className="panel">
          <div className="panel-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={16} /> Board Announcements
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {announcements.length} posts
            </span>
          </div>
          {announcements.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Megaphone size={22} /></div>
              <p className="empty-state-title">No announcements yet</p>
              <p className="empty-state-desc">Check back later for placement drives and academic notices.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {announcements.map((ann, idx) => (
                <div key={ann.id} style={{
                  padding: '14px 0',
                  borderBottom: idx < announcements.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', background: 'var(--color-red)',
                      flexShrink: 0, marginTop: 6
                    }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>
                        {ann.title}
                      </h4>
                      <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {ann.content}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Trending + Recently Visited + New Contributions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Trending */}
          <div className="panel">
            <div className="panel-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} /> Trending Knowledge
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveTab('explorer')}
                style={{ fontSize: 12 }}
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            {trendingFiles.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <div className="empty-state-icon"><TrendingUp size={20} /></div>
                <p className="empty-state-desc">No trending documents yet.</p>
              </div>
            ) : (
              <div>
                {trendingFiles.slice(0, 5).map((doc, idx) => (
                  <div key={doc.id} className="trending-doc-item" onClick={() => setActiveTab('explorer')}>
                    <span className="trending-rank">#{idx + 1}</span>
                    <span className="trending-doc-title">{doc.title}</span>
                    <span className="trending-upvotes">
                      <Heart size={11} fill="currentColor" /> {doc.upvotes}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Visited */}
          <div className="panel">
            <div className="panel-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} /> Recently Visited
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentlyVisited.map(item => (
                <div
                  key={item.tab}
                  className="trending-doc-item"
                  onClick={() => setActiveTab(item.tab)}
                  style={{ cursor: 'pointer' }}
                >
                  <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
                  <span style={{ fontSize: 13.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
                  <ArrowRight size={13} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          </div>

          {/* New Contributions prompt */}
          <div className="panel" style={{
            background: 'linear-gradient(135deg, rgba(225,29,72,0.06) 0%, rgba(139,92,246,0.04) 100%)',
            border: '1px solid rgba(225,29,72,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="stat-icon red" style={{ width: 44, height: 44, flexShrink: 0 }}>
                <Sparkles size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>
                  Share your knowledge
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  Upload notes, projects, or interview experiences and earn contribution points.
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('upload')}
                style={{ flexShrink: 0 }}
              >
                Contribute
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
