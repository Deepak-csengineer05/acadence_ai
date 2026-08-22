import React, { useState, useEffect } from 'react';
import {
  Terminal, TrendingUp, MessageSquare, Search, Folder, UploadCloud,
  FileText, Briefcase, Award, User as UserIcon, Bell, Settings, LogOut,
  CheckCircle, ShieldCheck, Activity, BarChart2, ChevronLeft, ChevronRight,
  Code2, Home, Sun, Moon, HelpCircle, Info, Compass, Mail, Sparkles
} from 'lucide-react';

function Sidebar({ user, activeTab, setActiveTab, setExploreBy, handleLogout, collapsed, setCollapsed }) {
  const [activeTooltip, setActiveTooltip] = useState(null); // { label: string, top: number }
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  if (!user) return null;

  const handleMouseEnter = (e, label) => {
    if (collapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveTooltip({
        label,
        top: rect.top + rect.height / 2
      });
    }
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  // HackerEarth Radial Touch Ripple Theme Transition
  const handleThemeToggle = (e) => {
    let x, y;
    if (e.clientX !== undefined && e.clientX !== 0) {
      x = e.clientX;
      y = e.clientY;
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    const updateDOMTheme = () => {
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
    };

    if (!document.startViewTransition) {
      updateDOMTheme();
      return;
    }

    const transition = document.startViewTransition(() => {
      updateDOMTheme();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 650,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  const navItem = (id, icon, label, onClick, group = 'workspace') => {
    const isActive = activeTab === id;
    const clickHandler = (e) => {
      setActiveTooltip(null);
      if (onClick) onClick(e);
      else setActiveTab(id);
    };

    return (
      <div
        key={id}
        className={`sidebar-item ${isActive ? `active active-${group}` : ''}`}
        onClick={clickHandler}
        onMouseEnter={(e) => handleMouseEnter(e, label)}
        onMouseLeave={handleMouseLeave}
      >
        <span className="sidebar-item-icon" style={{ flexShrink: 0, display: 'flex' }}>
          {React.cloneElement(icon, { size: 17 })}
        </span>
        <span className="sidebar-item-label">{label}</span>
      </div>
    );
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Upper Logo / Collapse Section */}
      <div 
        className="sidebar-logo" 
        style={{ 
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 14px'
        }}
      >
        {!collapsed ? (
          <>
            <div className="landing-logo">
              <img 
                src="/ui_assets/acadence_ai_logo.png" 
                alt="Acadence AI Logo" 
                style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0 }} 
              />
              <span className="logo-text" style={{ fontSize: '13px', gap: '1px', textTransform: 'uppercase' }}>
                {"ACADENCE AI".split("").map((char, index) => (
                  <span key={index} style={{ '--char-index': index }}>
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
            </div>
            <button
              className="sidebar-toggle-top"
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <ChevronLeft size={13} />
            </button>
          </>
        ) : (
          <button
            className="sidebar-toggle-top"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => handleMouseEnter(e, "Expand Sidebar")}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src="/ui_assets/acadence_ai_logo.png" 
              alt="Acadence AI Logo" 
              style={{ width: '22px', height: '22px', objectFit: 'contain' }} 
            />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        {user.role === 'admin' ? (
          <>
            <div className="sidebar-section-title">Admin Controls</div>
            {navItem('admin-dashboard', <TrendingUp />, 'Admin Dashboard')}
            {navItem('resource-mgmt', <CheckCircle />, 'Resource Moderate')}
            {navItem('support-inbox', <MessageSquare />, 'Student Inbox')}
            {navItem('user-mgmt', <UserIcon />, 'User Management')}
            {navItem('ai-monitoring', <Activity />, 'AI Monitoring')}
            {navItem('reports', <BarChart2 />, 'Analytics & Reports')}
            {navItem('system-status', <ShieldCheck />, 'System Status')}
            {navItem('announcements', <Bell />, 'Post Banners')}
          </>
        ) : (
          <>
            <div className="sidebar-section-title">Workspace</div>
            {navItem('dashboard', <Home />, 'Dashboard', null, 'workspace')}
            {navItem('ai-chat', <MessageSquare />, 'Senior AI', null, 'workspace')}
            {navItem('explorer', <Search />, 'Knowledge Explorer', () => { setExploreBy(''); setActiveTab('explorer'); }, 'workspace')}
            {navItem('my-knowledge', <Folder />, 'My Knowledge', null, 'workspace')}
            {navItem('upload', <UploadCloud />, 'Upload & Contribute', null, 'workspace')}

            <div className="sidebar-divider" />
            <div className="sidebar-section-title">Discover</div>
            {navItem('project-hub', <Code2 />, 'Project Hub', null, 'discover')}
            {navItem('interviews', <Briefcase />, 'Interview Hub', null, 'discover')}

            <div className="sidebar-divider" />
            <div className="sidebar-section-title">Growth</div>
            {navItem('leaderboard', <Award />, 'Rankings & Badges', null, 'growth')}
            {navItem('profile', <UserIcon />, 'My Profile', null, 'growth')}
            {navItem('notifications', <Bell />, 'Notifications', null, 'growth')}
          </>
        )}

        <div className="sidebar-divider" />
        {navItem('theme-toggle', theme === 'dark' ? <Sun /> : <Moon />, theme === 'dark' ? 'Light Mode' : 'Dark Mode', handleThemeToggle, 'settings')}
        {navItem('settings', <Settings />, 'Settings', null, 'settings')}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* User Info */}
        <div 
          className="sidebar-user" 
          onClick={() => setActiveTab(user.role === 'admin' ? 'admin-dashboard' : 'profile')}
          onMouseEnter={(e) => handleMouseEnter(e, `${user.full_name} — ${user.role === 'admin' ? 'Administrator' : `${user.academic_year} Year`}`)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="user-avatar">{user.full_name?.[0]?.toUpperCase()}</div>
          <div className="user-details sidebar-user-details">
            <span className="user-name">{user.full_name}</span>
            <span className="user-role">
              {user.role === 'admin' ? 'Administrator' : `${user.academic_year} Year · ${user.department || 'Student'}`}
            </span>
          </div>
        </div>

        {/* Logout Only */}
        <button
          className="sidebar-toggle-btn"
          onClick={handleLogout}
          onMouseEnter={(e) => handleMouseEnter(e, 'Logout')}
          onMouseLeave={handleMouseLeave}
          style={{ 
            width: '100%', 
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            padding: '8px 10px'
          }}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          <span className="sidebar-collapse-btn-text" style={{ fontSize: 12, fontWeight: 600 }}>Logout</span>
        </button>
      </div>

      {/* Beautiful Fixed Portal Tooltip for Collapsed Mode */}
      {collapsed && activeTooltip && (
        <div 
          className="custom-sidebar-tooltip" 
          style={{ 
            position: 'fixed', 
            left: 70, 
            top: activeTooltip.top, 
            transform: 'translateY(-50%)',
            zIndex: 9999
          }}
        >
          {activeTooltip.label}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
