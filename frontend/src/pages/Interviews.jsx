import React, { useState } from 'react';
import { Plus, Heart, X, Building2, User, Clock, ChevronRight, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import ClaySelect from '../components/ClaySelect';

const COMPANY_COLORS = {
  'Zoho': '#e85d04',
  'TCS': '#1e40af',
  'Infosys': '#065f46',
  'Accenture': '#7c3aed',
  'Amazon': '#f59e0b',
  'Microsoft': '#0369a1',
  'Other': '#6b7280',
};

function getCompanyColor(name) {
  return COMPANY_COLORS[name] || '#6b7280';
}

const COMPANIES = ['Zoho', 'TCS', 'Infosys', 'Accenture', 'Amazon', 'Microsoft'];

const TABS = ['Overview', 'Aptitude', 'Coding', 'Technical', 'HR', 'Resources'];

function Interviews({
  interviewForm, setInterviewForm,
  interviewsList,
  selectedInterview, setSelectedInterview,
  handleInterviewSubmit,
  handleUpvote,
  setActiveTab, setSearchQuery, executeSearch
}) {
  const [showForm, setShowForm] = useState(false);
  const [activeCompanyFilter, setActiveCompanyFilter] = useState('');
  const [activeTab, setActiveModalTab] = useState('Overview');

  const allCompanies = Array.from(new Set([
    ...COMPANIES,
    ...interviewsList.map(i => i.company_name).filter(Boolean)
  ]));

  const filtered = activeCompanyFilter
    ? interviewsList.filter(i => i.company_name === activeCompanyFilter)
    : interviewsList;

  return (
    <div>
      {/* Company Catalog */}
      <div className="panel">
        <div className="panel-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} /> Placement Catalog
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Share My Experience</>}
          </button>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
          Browse placement patterns, coding rounds, HR questions, and tips shared by seniors.
        </p>

        <div className="company-grid">
          <div
            className={`company-chip ${activeCompanyFilter === '' ? 'active' : ''}`}
            onClick={() => setActiveCompanyFilter('')}
          >
            <div className="company-avatar" style={{ background: 'var(--color-red-dim)', fontSize: 13 }}>
              <Building2 size={16} style={{ color: 'var(--color-red)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>All Companies</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{interviewsList.length} experiences</div>
            </div>
          </div>

          {allCompanies.map(comp => {
            const count = interviewsList.filter(i => i.company_name === comp).length;
            return (
              <div
                key={comp}
                className={`company-chip ${activeCompanyFilter === comp ? 'active' : ''}`}
                onClick={() => setActiveCompanyFilter(activeCompanyFilter === comp ? '' : comp)}
              >
                <div className="company-avatar" style={{ background: getCompanyColor(comp) }}>
                  {comp[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{comp}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {count} experience{count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline Add Experience Form */}
      {showForm && (
        <div className="panel" style={{ animation: 'fadeIn 0.25s ease' }}>
          <div className="panel-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={15} /> Share Your Experience
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
              <X size={14} /> Close
            </button>
          </div>
          <form onSubmit={e => { handleInterviewSubmit(e); setShowForm(false); }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Company</label>
                <ClaySelect
                  value={interviewForm.company_name}
                  onChange={val => setInterviewForm({ ...interviewForm, company_name: val })}
                  options={[
                    { value: 'Zoho', label: 'Zoho' },
                    { value: 'TCS', label: 'TCS' },
                    { value: 'Infosys', label: 'Infosys' },
                    { value: 'Accenture', label: 'Accenture' },
                    { value: 'Amazon', label: 'Amazon' },
                    { value: 'Microsoft', label: 'Microsoft' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target Role</label>
                <input className="form-input" type="text" required placeholder="e.g. Software Engineer Trainee"
                  value={interviewForm.role} onChange={e => setInterviewForm({ ...interviewForm, role: e.target.value })} />
              </div>
            </div>

            {interviewForm.company_name === 'Other' && (
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="form-input" type="text" required placeholder="e.g. Cisco"
                  onChange={e => setInterviewForm({ ...interviewForm, company_name: e.target.value })} />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Aptitude Round</label>
                <textarea className="form-textarea" placeholder="Describe quantitative, verbal, reasoning rounds..."
                  value={interviewForm.aptitude_questions} onChange={e => setInterviewForm({ ...interviewForm, aptitude_questions: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Coding Round</label>
                <textarea className="form-textarea" placeholder="Paste coding problems or problem statements..."
                  value={interviewForm.coding_questions} onChange={e => setInterviewForm({ ...interviewForm, coding_questions: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Technical Round</label>
                <textarea className="form-textarea" placeholder="DSA, system design, whiteboard questions..."
                  value={interviewForm.technical_questions} onChange={e => setInterviewForm({ ...interviewForm, technical_questions: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">HR Round</label>
                <textarea className="form-textarea" placeholder="Behavioral, background, situational questions..."
                  value={interviewForm.hr_questions} onChange={e => setInterviewForm({ ...interviewForm, hr_questions: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Timeline & Details</label>
                <input className="form-input" type="text" placeholder="e.g. 3 Rounds, July 2026, On-Campus"
                  value={interviewForm.timeline} onChange={e => setInterviewForm({ ...interviewForm, timeline: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Preparation Resources</label>
                <input className="form-input" type="text" placeholder="LeetCode, GeeksforGeeks, links..."
                  value={interviewForm.prep_resources} onChange={e => setInterviewForm({ ...interviewForm, prep_resources: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <input
                type="checkbox"
                id="selected"
                checked={interviewForm.selected}
                onChange={e => setInterviewForm({ ...interviewForm, selected: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: 'var(--color-red)' }}
              />
              <label htmlFor="selected" style={{ fontSize: 13.5, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                I was selected / placed in this company
              </label>
            </div>

            <button className="btn btn-primary" type="submit">
              <Plus size={14} /> Submit for Moderation
            </button>
          </form>
        </div>
      )}

      {/* Experiences Feed */}
      <div className="panel">
        <div className="panel-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={16} />
            {activeCompanyFilter ? `${activeCompanyFilter} Experiences` : 'All Placement Experiences'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Briefcase size={22} /></div>
            <p className="empty-state-title">No experiences yet</p>
            <p className="empty-state-desc">
              Be the first to share your placement experience and help your juniors!
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Share Experience
            </button>
          </div>
        ) : (
          <div>
            {filtered.map(int => (
              <div
                key={int.id}
                className={`interview-card ${int.selected ? 'placed' : 'not-placed'}`}
                onClick={() => { setSelectedInterview(int); setActiveModalTab('Overview'); }}
              >
                <div className="interview-card-header">
                  <div className="interview-card-title">
                    <div
                      className="company-avatar"
                      style={{ width: 32, height: 32, borderRadius: 8, fontSize: 13, background: getCompanyColor(int.company_name) }}
                    >
                      {int.company_name?.[0]}
                    </div>
                    {int.company_name} — {int.role}
                  </div>
                  <span className={`interview-status-pill ${int.selected ? 'placed' : 'not-placed'}`}>
                    {int.selected
                      ? <><CheckCircle size={10} /> Placed</>
                      : <><XCircle size={10} /> Not Selected</>
                    }
                  </span>
                </div>

                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {int.timeline && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {int.timeline}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={11} /> {int.uploader_name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={11} /> {int.upvotes ?? 0} upvotes
                  </span>
                </div>

                <div style={{
                  marginTop: 8, fontSize: 12, color: 'var(--text-muted)',
                  display: 'flex', gap: 6, flexWrap: 'wrap'
                }}>
                  {int.aptitude_questions && <span style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>Aptitude</span>}
                  {int.coding_questions && <span style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>Coding</span>}
                  {int.technical_questions && <span style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>Technical</span>}
                  {int.hr_questions && <span style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>HR</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience Detail Modal */}
      {selectedInterview && (
        <div className="interview-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedInterview(null); }}>
          <div className="interview-modal">
            <div className="interview-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  className="company-avatar"
                  style={{ background: getCompanyColor(selectedInterview.company_name), borderRadius: 10 }}
                >
                  {selectedInterview.company_name?.[0]}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {selectedInterview.company_name}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {selectedInterview.role}
                    {selectedInterview.timeline && ` · ${selectedInterview.timeline}`}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`interview-status-pill ${selectedInterview.selected ? 'placed' : 'not-placed'}`}>
                  {selectedInterview.selected ? 'Placed ✓' : 'Not Selected'}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedInterview(null)}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="interview-tabs">
              {TABS.filter(t => {
                if (t === 'Aptitude') return !!selectedInterview.aptitude_questions;
                if (t === 'Coding') return !!selectedInterview.coding_questions;
                if (t === 'Technical') return !!selectedInterview.technical_questions;
                if (t === 'HR') return !!selectedInterview.hr_questions;
                if (t === 'Resources') return !!selectedInterview.prep_resources;
                return true;
              }).map(tab => (
                <div
                  key={tab}
                  className={`interview-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveModalTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div className="interview-modal-body">
              {activeTab === 'Overview' && (
                <div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                    This experience was shared by <strong>{selectedInterview.uploader_name}</strong> and covers
                    {[
                      selectedInterview.aptitude_questions && 'aptitude',
                      selectedInterview.coding_questions && 'coding',
                      selectedInterview.technical_questions && 'technical',
                      selectedInterview.hr_questions && 'HR'
                    ].filter(Boolean).join(', ')} rounds.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {[
                      { label: 'Company', value: selectedInterview.company_name },
                      { label: 'Role', value: selectedInterview.role },
                      { label: 'Timeline', value: selectedInterview.timeline },
                      { label: 'Outcome', value: selectedInterview.selected ? 'Placed ✓' : 'Not Selected' },
                    ].filter(x => x.value).map(item => (
                      <div key={item.label} style={{
                        flex: '1 1 45%', minWidth: 140,
                        background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
                        padding: '12px 14px', border: '1px solid var(--border-subtle)'
                      }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: 4 }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {selectedInterview.student_experience && (
                    <div className="interview-content-block">{selectedInterview.student_experience}</div>
                  )}
                </div>
              )}
              {activeTab === 'Aptitude' && (
                <div className="interview-content-block">{selectedInterview.aptitude_questions}</div>
              )}
              {activeTab === 'Coding' && (
                <div className="interview-content-block" style={{ fontFamily: 'monospace', fontSize: 13 }}>
                  {selectedInterview.coding_questions}
                </div>
              )}
              {activeTab === 'Technical' && (
                <div className="interview-content-block">{selectedInterview.technical_questions}</div>
              )}
              {activeTab === 'HR' && (
                <div className="interview-content-block">{selectedInterview.hr_questions}</div>
              )}
              {activeTab === 'Resources' && (
                <div className="interview-content-block">{selectedInterview.prep_resources}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Interviews;
