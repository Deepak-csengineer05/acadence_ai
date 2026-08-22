import React, { useState } from 'react';
import { GraduationCap, Bell, Lock, Cpu, CheckCircle2, AlertCircle, Save, Link2, Award } from 'lucide-react';
import ClaySelect from '../components/ClaySelect';

// Custom inline SVG icons to prevent lucide version conflicts
const GithubIcon = ({ size = 16, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 16, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

function Settings({ token, user, setUser, API_BASE }) {
  const isAdmin = user?.role === 'admin';

  // --- Student Form States ---
  const [academicYear, setAcademicYear] = useState(user?.academic_year || 'II');
  const [department, setDepartment] = useState(user?.department || 'CSE');
  const [semester, setSemester] = useState('3');
  const [specialization, setSpecialization] = useState('Artificial Intelligence & Machine Learning');
  const [targetCgpa, setTargetCgpa] = useState(localStorage.getItem('target_cgpa') || '9.0');
  const [studyGoal, setStudyGoal] = useState(localStorage.getItem('study_goal') || '2');
  const [aiPersona, setAiPersona] = useState(localStorage.getItem('ai_persona') || 'academic');
  const [ragContextMode, setRagContextMode] = useState(localStorage.getItem('rag_context_mode') || 'focused');
  const [githubUrl, setGithubUrl] = useState(localStorage.getItem('user_github') || '');
  const [linkedinUrl, setLinkedinUrl] = useState(localStorage.getItem('user_linkedin') || '');
  const [notifDocUpload, setNotifDocUpload] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifPlacement, setNotifPlacement] = useState(true);

  // --- Admin Form States ---
  const [autoApprove, setAutoApprove] = useState(localStorage.getItem('admin_auto_approve') || 'manual');
  const [maxUploadMB, setMaxUploadMB] = useState(localStorage.getItem('admin_max_upload') || '25');
  const [allowReg, setAllowReg] = useState(localStorage.getItem('admin_allow_reg') || 'enabled');
  const [aiModel, setAiModel] = useState(localStorage.getItem('admin_ai_model') || 'qwen3:8b');
  const [similarityThreshold, setSimilarityThreshold] = useState(localStorage.getItem('admin_sim_threshold') || '0.70');
  const [topKChunks, setTopKChunks] = useState(localStorage.getItem('admin_top_k') || '5');
  const [notifPendingMod, setNotifPendingMod] = useState(true);
  const [notifVectorOffline, setNotifVectorOffline] = useState(true);
  const [notifSysDigest, setNotifSysDigest] = useState(false);

  // Password reset states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status Alerts
  const [saveStatus, setSaveStatus] = useState(null);
  const [pwdStatus, setPwdStatus] = useState(null);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    try {
      if (isAdmin) {
        localStorage.setItem('admin_auto_approve', autoApprove);
        localStorage.setItem('admin_max_upload', maxUploadMB);
        localStorage.setItem('admin_allow_reg', allowReg);
        localStorage.setItem('admin_ai_model', aiModel);
        localStorage.setItem('admin_sim_threshold', similarityThreshold);
        localStorage.setItem('admin_top_k', topKChunks);
        setSaveStatus({ type: 'success', message: 'Admin System Configurations saved successfully!' });
      } else {
        if (setUser && user) {
          setUser({ ...user, academic_year: academicYear, department: department });
        }
        localStorage.setItem('ai_persona', aiPersona);
        localStorage.setItem('rag_context_mode', ragContextMode);
        localStorage.setItem('user_github', githubUrl);
        localStorage.setItem('user_linkedin', linkedinUrl);
        localStorage.setItem('target_cgpa', targetCgpa);
        localStorage.setItem('study_goal', studyGoal);
        setSaveStatus({ type: 'success', message: 'Student Portal preferences updated successfully!' });
      }
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Failed to update preferences. Please try again.' });
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdStatus({ type: 'error', message: 'All password fields are required.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    try {
      const baseUrl = API_BASE || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setPwdStatus({ type: 'error', message: data.detail || 'Failed to update password.' });
        return;
      }

      setPwdStatus({ type: 'success', message: 'Password updated successfully in database!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdStatus(null), 4000);
    } catch (err) {
      setPwdStatus({ type: 'error', message: 'Network error. Could not connect to authentication server.' });
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
      {/* Header Summary */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '0 0 6px' }}>
          {isAdmin ? 'Admin Portal & System Preferences' : 'Portal Settings & Preferences'}
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
          {isAdmin
            ? 'Configure platform moderation policies, RAG vector parameters, security controls, and admin profile credentials.'
            : 'Manage your academic stream preferences, AI advisor personalities, notification setups, and account credentials.'}
        </p>
      </div>

      {/* Save Status Toast */}
      {saveStatus && (
        <div style={{
          background: saveStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(225, 29, 72, 0.15)',
          border: `1px solid ${saveStatus.type === 'success' ? 'var(--color-emerald)' : 'var(--color-red)'}`,
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: saveStatus.type === 'success' ? 'var(--color-emerald)' : 'var(--color-red)',
          fontWeight: 600,
          fontSize: '13.5px',
          animation: 'fadeIn 0.25s ease'
        }}>
          {saveStatus.type === 'success' ? <CheckCircle2 size={18} style={{ color: 'var(--color-emerald)' }} /> : <AlertCircle size={18} style={{ color: 'var(--color-red)' }} />}
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADMIN SETTINGS VIEW */}
      {/* ============================================================ */}
      {isAdmin ? (
        <div className="settings-layout-grid">
          {/* Left Column: Admin Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Section 1: Platform & Moderation Policies */}
            <div className="panel" style={{ marginBottom: 0, overflow: 'visible' }}>
              <div className="settings-panel-title">
                <GraduationCap size={16} style={{ color: 'var(--color-emerald)' }} />
                Platform & Moderation Policies
              </div>
              
              <form onSubmit={handleSavePreferences}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Moderation Mode</label>
                    <ClaySelect
                      value={autoApprove}
                      onChange={val => setAutoApprove(val)}
                      placeholder="Select Moderation Policy"
                      options={[
                        { value: 'manual', label: 'Manual Admin Moderation (Required)' },
                        { value: 'auto', label: 'Auto-Approve Student Submissions' }
                      ]}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Max File Upload Limit</label>
                    <ClaySelect
                      value={maxUploadMB}
                      onChange={val => setMaxUploadMB(val)}
                      placeholder="Select Max Size"
                      options={[
                        { value: '10', label: '10 MB per file' },
                        { value: '25', label: '25 MB per file (Standard)' },
                        { value: '50', label: '50 MB per file' },
                        { value: '100', label: '100 MB per file' }
                      ]}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Student Registration</label>
                    <ClaySelect
                      value={allowReg}
                      onChange={val => setAllowReg(val)}
                      placeholder="Registration Policy"
                      options={[
                        { value: 'enabled', label: 'Enabled (Open Registration)' },
                        { value: 'disabled', label: 'Disabled (Invite Only)' }
                      ]}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Default Upload Reward</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value="20 Points / Approved Upload" 
                      disabled
                      style={{ width: '100%', height: '40px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', padding: '0 12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div className="sidebar-divider" style={{ margin: '24px 0' }}></div>

                {/* Section 2: AI Engine & Vector DB Config */}
                <div className="settings-panel-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '16px' }}>
                  <Cpu size={16} style={{ color: 'var(--color-blue)' }} />
                  AI Engine & Vector Parameters
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Default Ollama Model</label>
                    <ClaySelect
                      value={aiModel}
                      onChange={val => setAiModel(val)}
                      placeholder="Select Model"
                      options={[
                        { value: 'qwen3:8b', label: 'Ollama - qwen3:8b (Default)' },
                        { value: 'llama3:8b', label: 'Ollama - llama3:8b' },
                        { value: 'deepseek-r1', label: 'Ollama - deepseek-r1:8b' }
                      ]}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Max RAG Context Chunks</label>
                    <ClaySelect
                      value={topKChunks}
                      onChange={val => setTopKChunks(val)}
                      placeholder="Select Top-K"
                      options={[
                        { value: '3', label: 'Top 3 Chunks' },
                        { value: '5', label: 'Top 5 Chunks (Recommended)' },
                        { value: '8', label: 'Top 8 Chunks (High Detail)' }
                      ]}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600, margin: 0 }}>RAG Vector Similarity Cutoff</label>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-blue)' }}>{similarityThreshold} Score</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.50" 
                    max="0.95" 
                    step="0.05"
                    value={similarityThreshold}
                    onChange={e => setSimilarityThreshold(e.target.value)}
                    style={{ width: '100%', height: '6px', background: 'var(--bg-main)', border: 'none', outline: 'none', accentColor: 'var(--color-blue)', cursor: 'pointer' }}
                  />
                </div>

                <button className="btn btn-primary" type="submit" style={{ gap: 8, padding: '10px 20px', borderRadius: 'var(--radius-sm)' }}>
                  <Save size={15} /> Save Admin Settings
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Admin Profile, Notifications & Security */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Admin Profile */}
            <div className="panel" style={{ marginBottom: 0, overflow: 'visible' }}>
              <div className="settings-panel-title">
                <Award size={16} style={{ color: 'var(--color-coral)' }} />
                Admin Credentials
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Account Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={user?.full_name || 'Administrator'} 
                    disabled
                    style={{ width: '100%', height: '36px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0 10px', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Role Access Level</label>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 'var(--radius-md)',
                    background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)',
                    color: 'var(--color-coral)', fontSize: '12px', fontWeight: 700
                  }}>
                    System Administrator (Full Access)
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Notifications */}
            <div className="panel" style={{ marginBottom: 0, overflow: 'visible' }}>
              <div className="settings-panel-title">
                <Bell size={16} style={{ color: 'var(--color-blue)' }} />
                Admin Alerts & System Notices
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox" 
                    checked={notifPendingMod} 
                    onChange={e => setNotifPendingMod(e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--color-blue)' }}
                  />
                  <span>Alert on new pending uploads awaiting moderation</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox" 
                    checked={notifVectorOffline} 
                    onChange={e => setNotifVectorOffline(e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--color-blue)' }}
                  />
                  <span>Vector Database or Ollama offline alert</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox" 
                    checked={notifSysDigest} 
                    onChange={e => setNotifSysDigest(e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--color-blue)' }}
                  />
                  <span>Daily automated analytics summary email</span>
                </label>
              </div>
            </div>

            {/* Admin Security Reset */}
            <div className="panel" style={{ marginBottom: 0, overflow: 'visible' }}>
              <div className="settings-panel-title">
                <Lock size={16} style={{ color: 'var(--color-red)' }} />
                Security Reset
              </div>

              {pwdStatus && (
                <div style={{
                  background: pwdStatus.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(225, 29, 72, 0.12)',
                  border: `1px solid ${pwdStatus.type === 'success' ? 'var(--color-emerald)' : 'var(--color-red)'}`,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: pwdStatus.type === 'success' ? 'var(--color-emerald)' : 'var(--color-red)'
                }}>
                  {pwdStatus.message}
                </div>
              )}

              <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Current Admin Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', height: '36px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0 10px', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Minimum 6 characters" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ width: '100%', height: '36px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0 10px', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Re-enter password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', height: '36px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0 10px', boxSizing: 'border-box' }}
                  />
                </div>

                <button className="btn btn-secondary" type="submit" style={{ marginTop: '4px', width: '100%', padding: '8px 0', fontSize: '12.5px' }}>
                  Reset Admin Password
                </button>
              </form>
            </div>

          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* STUDENT SETTINGS VIEW */
        /* ============================================================ */
        <div className="settings-layout-grid">
          {/* Left Column: Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Section 1: Academic Settings */}
            <div className="panel" style={{ marginBottom: 0, overflow: 'visible' }}>
              <div className="settings-panel-title">
                <GraduationCap size={16} style={{ color: 'var(--color-emerald)' }} />
                Academic Workspace Configuration
              </div>
              
              <form onSubmit={handleSavePreferences}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Primary Department</label>
                    <ClaySelect
                      value={department}
                      onChange={val => setDepartment(val)}
                      placeholder="Select Department"
                      options={[
                        { value: 'CSE', label: 'Computer Science & Engineering (CSE)' },
                        { value: 'ECE', label: 'Electronics & Communication (ECE)' },
                        { value: 'IT', label: 'Information Technology (IT)' },
                        { value: 'ME', label: 'Mechanical Engineering (ME)' },
                        { value: 'EEE', label: 'Electrical & Electronics (EEE)' },
                        { value: 'CE', label: 'Civil Engineering (CE)' }
                      ]}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Academic Year</label>
                    <ClaySelect
                      value={academicYear}
                      onChange={val => setAcademicYear(val)}
                      placeholder="Select Academic Year"
                      options={[
                        { value: 'I', label: '1st Year (Freshman)' },
                        { value: 'II', label: '2nd Year (Sophomore)' },
                        { value: 'III', label: '3rd Year (Junior)' },
                        { value: 'IV', label: '4th Year (Senior)' }
                      ]}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Target Semester</label>
                    <ClaySelect
                      value={semester}
                      onChange={val => setSemester(val)}
                      placeholder="Select Semester"
                      options={[
                        { value: '1', label: 'Semester 1' },
                        { value: '2', label: 'Semester 2' },
                        { value: '3', label: 'Semester 3' },
                        { value: '4', label: 'Semester 4' },
                        { value: '5', label: 'Semester 5' },
                        { value: '6', label: 'Semester 6' },
                        { value: '7', label: 'Semester 7' },
                        { value: '8', label: 'Semester 8' }
                      ]}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Core Stream / Specialization</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Artificial Intelligence" 
                      value={specialization} 
                      onChange={e => setSpecialization(e.target.value)}
                      style={{ width: '100%', height: '40px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0 12px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Extra settings for Academic Targets */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600, margin: 0 }}>Target CGPA Goal</label>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-emerald)' }}>{targetCgpa} / 10.0</span>
                    </div>
                    <input 
                      type="range" 
                      min="5.0" 
                      max="10.0" 
                      step="0.1"
                      value={targetCgpa}
                      onChange={e => setTargetCgpa(e.target.value)}
                      style={{ width: '100%', height: '6px', background: 'var(--bg-main)', border: 'none', outline: 'none', accentColor: 'var(--color-emerald)', cursor: 'pointer' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>Daily Study Target</label>
                    <ClaySelect
                      value={studyGoal}
                      onChange={val => setStudyGoal(val)}
                      placeholder="Select daily target"
                      options={[
                        { value: '0.5', label: '30 Minutes / day' },
                        { value: '1', label: '1 Hour / day' },
                        { value: '2', label: '2 Hours / day' },
                        { value: '3', label: '3 Hours / day' },
                        { value: '4', label: '4+ Hours / day' }
                      ]}
                    />
                  </div>
                </div>

                <div className="sidebar-divider" style={{ margin: '24px 0' }}></div>

                <div className="settings-panel-title" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '16px' }}>
                  <Cpu size={16} style={{ color: 'var(--color-blue)' }} />
                  Senior AI Assistant Personalization
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>AI Advisor Tone</label>
                    <ClaySelect
                      value={aiPersona}
                      onChange={val => setAiPersona(val)}
                      placeholder="Select tone"
                      options={[
                        { value: 'academic', label: 'Precise Academic Tone (Standard)' },
                        { value: 'explain5', label: "Explain Like I'm 5 (Analogy-driven)" },
                        { value: 'career', label: 'Placement Specialist (Job oriented)' },
                        { value: 'coder', label: 'Code Synthesizer (Technical focus)' }
                      ]}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12.5px', fontWeight: 600 }}>AI Grounding (RAG Context)</label>
                    <ClaySelect
                      value={ragContextMode}
                      onChange={val => setRagContextMode(val)}
                      placeholder="Select context scope"
                      options={[
                        { value: 'focused', label: 'Strictly Course Notes & Textbooks' },
                        { value: 'hybrid', label: 'Hybrid (Syllabus + Web Grounding)' }
                      ]}
                    />
                  </div>
                </div>

                <button className="btn btn-primary" type="submit" style={{ gap: 8, padding: '10px 20px', borderRadius: 'var(--radius-sm)' }}>
                  <Save size={15} /> Save Configuration
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Profiles, Notifications & Security */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Section 3: Connected Profiles */}
            <div className="panel" style={{ marginBottom: 0, overflow: 'visible' }}>
              <div className="settings-panel-title">
                <Link2 size={16} style={{ color: 'var(--color-amber)' }} />
                Connected Profiles
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 600 }}>
                    <GithubIcon size={13} style={{ color: 'var(--text-secondary)' }} /> GitHub Username
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. dev-student" 
                    value={githubUrl} 
                    onChange={e => setGithubUrl(e.target.value)}
                    style={{ width: '100%', height: '36px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0 10px', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', fontWeight: 600 }}>
                    <LinkedinIcon size={13} style={{ color: 'var(--text-secondary)' }} /> LinkedIn Profile
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="linkedin.com/in/student" 
                    value={linkedinUrl} 
                    onChange={e => setLinkedinUrl(e.target.value)}
                    style={{ width: '100%', height: '36px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0 10px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Notifications Panel */}
            <div className="panel" style={{ marginBottom: 0, overflow: 'visible' }}>
              <div className="settings-panel-title">
                <Bell size={16} style={{ color: 'var(--color-blue)' }} />
                Notifications
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox" 
                    checked={notifDocUpload} 
                    onChange={e => setNotifDocUpload(e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--color-blue)' }}
                  />
                  <span>Alert on new uploads in my department</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox" 
                    checked={notifStreak} 
                    onChange={e => setNotifStreak(e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--color-blue)' }}
                  />
                  <span>Daily study streak reminders</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox" 
                    checked={notifPlacement} 
                    onChange={e => setNotifPlacement(e.target.checked)}
                    style={{ marginTop: 2, accentColor: 'var(--color-blue)' }}
                  />
                  <span>Placement announcements & drive notices</span>
                </label>
              </div>
            </div>

            {/* Section 5: Account Security Panel */}
            <div className="panel" style={{ marginBottom: 0, overflow: 'visible' }}>
              <div className="settings-panel-title">
                <Lock size={16} style={{ color: 'var(--color-red)' }} />
                Security Reset
              </div>

              {pwdStatus && (
                <div style={{
                  background: pwdStatus.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(225, 29, 72, 0.12)',
                  border: `1px solid ${pwdStatus.type === 'success' ? 'var(--color-emerald)' : 'var(--color-red)'}`,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: pwdStatus.type === 'success' ? 'var(--color-emerald)' : 'var(--color-red)'
                }}>
                  {pwdStatus.message}
                </div>
              )}

              <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Current Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••" 
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', height: '36px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0 10px', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Minimum 6 characters" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    style={{ width: '100%', height: '36px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0 10px', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600 }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="Re-enter password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', height: '36px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', padding: '0 10px', boxSizing: 'border-box' }}
                  />
                </div>

                <button className="btn btn-secondary" type="submit" style={{ marginTop: '4px', width: '100%', padding: '8px 0', fontSize: '12.5px' }}>
                  Reset Password
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
