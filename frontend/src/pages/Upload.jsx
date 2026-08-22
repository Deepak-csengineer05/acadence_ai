import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Award, Zap, FileText, Plus } from 'lucide-react';
import ClaySelect from '../components/ClaySelect';

function Upload({
  uploadData, setUploadData,
  customCategory, setCustomCategory,
  selectedFile, setSelectedFile,
  uploadStatus,
  aiTaggingActive,
  handleUploadSubmit,
  categories, courses,
  user, achievements
}) {
  const isSuccess = uploadStatus && !uploadStatus.toLowerCase().includes('error') && !uploadStatus.toLowerCase().includes('fail');

  const contributionRules = [
    { icon: <FileText size={15} />, text: '+20 points per approved document upload', color: 'var(--color-emerald)' },
    { icon: <Zap size={15} />, text: '+10 points per upvote your resource receives', color: 'var(--color-blue)' },
    { icon: <Award size={15} />, text: 'Unlock badges at 5, 10+ approved contributions', color: 'var(--color-amber)' },
  ];

  const earnedBadgeIds = achievements ? achievements.map(a => a.badge_type) : [];
  const allBadges = [
    { id: 'first_contribution', name: 'First Contribution', icon: '🎓' },
    { id: 'knowledge_overflow', name: 'Knowledge Overflow', icon: '📚' },
    { id: 'sage_of_acadence', name: 'Sage of Acadence', icon: '🧙' },
    { id: 'best_senior', name: 'Best Senior', icon: '⭐' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
      {/* Upload Form */}
      <div className="panel">
        <div className="panel-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UploadCloud size={16} /> Upload Study Material
          </span>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
          Share notes, projects, lab records, or any resource that can help your peers.
          All uploads are reviewed by moderators before going live.
        </p>

        <form onSubmit={handleUploadSubmit}>
          <div className="form-group">
            <label className="form-label">Document Title</label>
            <input className="form-input" type="text" required placeholder="e.g. CS301 Database Management Notes"
              value={uploadData.title} onChange={e => setUploadData({ ...uploadData, title: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Document Category</label>
              <ClaySelect
                value={uploadData.category_id}
                onChange={val => setUploadData({ ...uploadData, category_id: val })}
                placeholder="Select a category"
                options={[
                  ...categories.map(c => ({ value: String(c.id), label: c.name })),
                  { value: 'custom', label: '+ Add Custom Category' },
                ]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course Code</label>
              <ClaySelect
                value={uploadData.course_id}
                onChange={val => setUploadData({ ...uploadData, course_id: val })}
                placeholder="No course link"
                options={[
                  { value: '', label: 'General — No course link' },
                  ...courses.map(c => ({ value: String(c.id), label: `${c.code} — ${c.name}` })),
                ]}
              />
            </div>
          </div>

          {uploadData.category_id === 'custom' && (
            <div className="form-group">
              <label className="form-label">New Category Name</label>
              <input className="form-input" type="text" required placeholder="e.g. Workshop Reports"
                value={customCategory} onChange={e => setCustomCategory(e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-input" type="text" placeholder="sql, joins, normalization, dbms"
              value={uploadData.tags} onChange={e => setUploadData({ ...uploadData, tags: e.target.value })} />
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <input
              type="checkbox"
              id="is_project"
              checked={uploadData.is_project}
              onChange={e => setUploadData({ ...uploadData, is_project: e.target.checked })}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-red)' }}
            />
            <label htmlFor="is_project" style={{ fontSize: 13.5, color: 'var(--text-secondary)', cursor: 'pointer', margin: 0 }}>
              This is a graduation project report / final year project
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Select File</label>
            <div
              className={`drop-zone ${selectedFile ? 'has-file' : ''}`}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <UploadCloud className="drop-zone-icon" />
              <div className="drop-zone-text">
                {selectedFile
                  ? `Selected: ${selectedFile.name}`
                  : 'Drag & drop your file here, or click to browse'}
              </div>
              <div className="drop-zone-hint">Supports: PDF · DOCX · TXT · MD</div>
              <input id="fileInput" type="file" style={{ display: 'none' }}
                onChange={e => setSelectedFile(e.target.files[0])} />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={aiTaggingActive} style={{ width: '100%' }}>
            {aiTaggingActive
              ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Analyzing file with AI...</>
              : <><UploadCloud size={15} /> Submit for Verification</>
            }
          </button>
        </form>

        {uploadStatus && (
          <div style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: isSuccess ? 'var(--color-emerald-dim)' : 'var(--color-red-dim)',
            border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(225,29,72,0.3)'}`,
          }}>
            {isSuccess
              ? <CheckCircle2 size={16} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
              : <AlertCircle size={16} style={{ color: 'var(--color-red)', flexShrink: 0 }} />
            }
            <span style={{ fontSize: 13.5, fontWeight: 600, color: isSuccess ? 'var(--color-emerald)' : 'var(--color-red)' }}>
              {uploadStatus}
            </span>
          </div>
        )}
      </div>

      {/* Right Column: Contribution Stats + Badges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Your Stats */}
        <div className="panel">
          <div className="panel-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={15} /> Your Contributions
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>Points</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)' }}>
                {user?.contribution_points ?? 0}
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>Streak</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-red)', fontFamily: 'var(--font-heading)' }}>
                {user?.streak_count ?? 0}<span style={{ fontSize: 13, fontWeight: 600 }}> d</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {contributionRules.map((rule, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: rule.color }}>{rule.icon}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{rule.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Earned Badges */}
        <div className="panel">
          <div className="panel-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={15} /> Earned Badges
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {allBadges.map(badge => {
              const earned = earnedBadgeIds.includes(badge.id);
              return (
                <div key={badge.id} style={{
                  background: earned ? 'rgba(245,158,11,0.06)' : 'var(--bg-elevated)',
                  border: `1px solid ${earned ? 'rgba(245,158,11,0.3)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  textAlign: 'center',
                  opacity: earned ? 1 : 0.5,
                  filter: earned ? 'none' : 'grayscale(0.7)',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{badge.icon}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: earned ? 'var(--color-amber)' : 'var(--text-muted)' }}>
                    {badge.name}
                  </div>
                  {earned && (
                    <div style={{ fontSize: 10, color: 'var(--color-amber)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 3 }}>
                      Unlocked
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
