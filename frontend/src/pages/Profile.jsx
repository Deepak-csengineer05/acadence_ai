import React, { useState } from 'react';
import { Gem, Flame, Trophy, FileText, Clock, ArrowRight, Star, User, Mail, Calendar, Edit3, Save, X } from 'lucide-react';
import ClaySelect from '../components/ClaySelect';

function Profile({ user, achievements, token, setUser, API_BASE }) {
  if (!user) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name || '');
  const [academicYear, setAcademicYear] = useState(user.academic_year || 'III');
  const [department, setDepartment] = useState(user.department || 'CSE');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const baseUrl = API_BASE || 'http://localhost:8000/api/v1';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`${baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          academic_year: academicYear,
          department: department
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        if (setUser) setUser(updatedUser);
        setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        const err = await res.json();
        setStatusMsg({ type: 'error', text: err.detail || 'Failed to update profile.' });
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: 'error', text: 'Network connection error.' });
    } finally {
      setSaving(false);
    }
  };

  const firstName = user.full_name?.split(' ')[0];
  const initials = user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const earnedCount = achievements?.length || 0;

  const recentUploads = [
    { title: 'No recent uploads yet', time: null }
  ];

  return (
    <div>
      {/* Profile Hero */}
      <div className="profile-hero-card">
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="profile-avatar-lg">{initials}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {user.full_name}
            </h2>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13.5, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <User size={13} /> {user.academic_year} Year Student
              </span>
              {user.department && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Star size={13} /> {user.department}
                </span>
              )}
              {user.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={13} /> {user.email}
                </span>
              )}
            </div>
          </div>

          {/* Role badge */}
          <div style={{
            background: 'var(--color-blue-dim)', border: '1px solid rgba(59,130,246,0.25)',
            padding: '6px 14px', borderRadius: 'var(--radius-full)',
            fontSize: 12, fontWeight: 700, color: '#93c5fd'
          }}>
            {user.role === 'senior' ? 'Senior Contributor' : user.role === 'admin' ? 'Administrator' : 'Student Member'}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="profile-stats-strip">
          <div className="profile-stat-item">
            <div className="profile-stat-value" style={{ color: 'var(--color-emerald)' }}>
              {user.contribution_points ?? 0}
            </div>
            <div className="profile-stat-label">
              <Gem size={11} style={{ display: 'inline', marginRight: 4 }} />
              Points
            </div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value" style={{ color: 'var(--color-red)' }}>
              {user.streak_count ?? 0}d
            </div>
            <div className="profile-stat-label">
              <Flame size={11} style={{ display: 'inline', marginRight: 4 }} />
              Streak
            </div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value" style={{ color: 'var(--color-amber)' }}>
              {earnedCount}
            </div>
            <div className="profile-stat-label">
              <Trophy size={11} style={{ display: 'inline', marginRight: 4 }} />
              Badges
            </div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-value" style={{ color: 'var(--color-blue)' }}>
              {user.academic_year || '—'}
            </div>
            <div className="profile-stat-label">
              <Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />
              Year
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Bio & Info */}
        <div className="panel" style={{ overflow: 'visible' }}>
          <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={15} /> Student Profile
            </span>
            {!isEditing ? (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => {
                  setFullName(user.full_name || '');
                  setAcademicYear(user.academic_year || 'III');
                  setDepartment(user.department || 'CSE');
                  setIsEditing(true);
                }}
                style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <Edit3 size={13} /> Edit Profile
              </button>
            ) : (
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setIsEditing(false)}
                style={{ fontSize: 12, padding: '4px 8px' }}
              >
                <X size={14} /> Cancel
              </button>
            )}
          </div>

          {statusMsg && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 14, fontSize: 13, fontWeight: 600,
              background: statusMsg.type === 'error' ? 'var(--color-red-dim)' : 'var(--color-emerald-dim)',
              color: statusMsg.type === 'error' ? 'var(--color-red)' : 'var(--color-emerald)'
            }}>
              {statusMsg.text}
            </div>
          )}

          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Full Name', value: user.full_name, icon: <User size={14} /> },
                { label: 'Academic Year', value: user.academic_year ? `${user.academic_year} Year` : 'Not set', icon: <Calendar size={14} /> },
                { label: 'Department', value: user.department || 'Not set', icon: <Star size={14} /> },
                { label: 'Role', value: user.role === 'admin' ? 'Administrator' : user.role === 'senior' ? 'Senior Contributor' : 'Student', icon: <Trophy size={14} /> },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 2 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <ClaySelect
                  value={academicYear}
                  onChange={val => setAcademicYear(val)}
                  options={[
                    { value: 'I', label: 'I Year' },
                    { value: 'II', label: 'II Year' },
                    { value: 'III', label: 'III Year' },
                    { value: 'IV', label: 'IV Year' },
                  ]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <ClaySelect
                  value={department}
                  onChange={val => setDepartment(val)}
                  options={[
                    { value: 'CSE', label: 'CSE (Computer Science)' },
                    { value: 'ECE', label: 'ECE (Electronics)' },
                    { value: 'IT', label: 'IT (Information Tech)' },
                    { value: 'MECH', label: 'MECH (Mechanical)' },
                    { value: 'EEE', label: 'EEE (Electrical)' },
                    { value: 'CIVIL', label: 'CIVIL (Civil)' },
                  ]}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Personalization prompt */}
          {(!user.department || !user.academic_year) && (
            <div style={{
              marginTop: 16, padding: '14px 16px',
              background: 'linear-gradient(135deg, var(--color-blue-dim), rgba(139,92,246,0.07))',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55
            }}>
              <strong style={{ color: 'var(--color-blue)' }}>Complete your profile</strong> to get personalized AI
              recommendations, department-specific resources, and better search results.
            </div>
          )}
        </div>

        {/* Contribution Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={15} /> Contribution Summary
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <FileText size={14} />, text: '+20 points per approved document upload', accent: 'var(--color-emerald)' },
                { icon: <Gem size={14} />, text: '+10 points per upvote your resources receive', accent: 'var(--color-blue)' },
                { icon: <Trophy size={14} />, text: 'Earn badges at milestones to boost your rank', accent: 'var(--color-amber)' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '10px 12px',
                  background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ color: item.accent, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Earned Badges preview */}
          {earnedCount > 0 && (
            <div className="panel">
              <div className="panel-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trophy size={15} /> My Badges
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{earnedCount} earned</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {achievements?.slice(0, 4).map((ach, i) => (
                  <div key={i} style={{
                    background: 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 'var(--radius-md)', padding: '8px 12px',
                    fontSize: 22
                  }}>
                    {ach.badge_type === 'first_contribution' && '🎓'}
                    {ach.badge_type === 'knowledge_overflow' && '📚'}
                    {ach.badge_type === 'streak_master' && <Flame size={18} style={{ color: 'var(--color-red)' }} />}
                    {ach.badge_type === 'best_senior' && '⭐'}
                    {!['first_contribution', 'knowledge_overflow', 'streak_master', 'best_senior'].includes(ach.badge_type) && '🏆'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
