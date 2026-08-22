import React from 'react';
import { Folder, FileText, CheckCircle2, Clock, XCircle, ThumbsUp, Eye, ArrowRight, UploadCloud } from 'lucide-react';

function MyKnowledge({ searchResults, setActiveTab }) {
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'approved' || s === 'active') {
      return (
        <span className="doc-badge" style={{ background: 'var(--color-emerald-dim)', borderColor: 'rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
          <CheckCircle2 size={10} style={{ marginRight: 4 }} />
          Approved
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="doc-badge" style={{ background: 'var(--color-amber-dim)', borderColor: 'rgba(245,158,11,0.25)', color: '#fcd34d' }}>
          <Clock size={10} style={{ marginRight: 4 }} />
          Pending Review
        </span>
      );
    }
    return (
      <span className="doc-badge" style={{ background: 'var(--color-red-dim)', borderColor: 'rgba(225,29,72,0.25)', color: '#fda4af' }}>
        <XCircle size={10} style={{ marginRight: 4 }} />
        Rejected
      </span>
    );
  };

  return (
    <div>
      {/* Page Header */}
      <div className="panel">
        <div className="panel-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Folder size={16} /> My Contributions
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            {searchResults.length} resource{searchResults.length !== 1 ? 's' : ''} shared
          </span>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Track and manage notes, project reports, and interview experiences you have contributed to the Acadence AI community.
        </p>
      </div>

      {/* Grid List */}
      <div className="grid-3">
        {searchResults.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state" style={{ padding: '60px 24px' }}>
              <div className="empty-state-icon">
                <Folder size={24} />
              </div>
              <h3 className="empty-state-title">No contributions yet</h3>
              <p className="empty-state-desc">
                Your shared study materials, projects, and interview rounds will appear here once you make your first contribution.
              </p>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => setActiveTab('upload')}
                style={{ marginTop: 8 }}
              >
                <UploadCloud size={14} /> Contribute Now
              </button>
            </div>
          </div>
        ) : (
          searchResults.map(res => (
            <div key={res.id} className="document-card">
              <div>
                <div className="doc-header" style={{ justifyContent: 'space-between' }}>
                  {getStatusBadge(res.status)}
                  <span className="doc-badge" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {res.type === 'interview' ? 'Interview' : 'Document'}
                  </span>
                </div>
                
                <h4 className="doc-title" style={{ marginTop: 12, marginBottom: 8 }}>{res.title}</h4>
                
                <div className="doc-meta" style={{ gap: 14 }}>
                  <span className="doc-meta-item">
                    <ThumbsUp size={11} /> {res.upvotes ?? 0} upvotes
                  </span>
                  <span className="doc-meta-item">
                    <Eye size={11} /> {res.views ?? 0} views
                  </span>
                </div>
              </div>
              
              <div className="doc-footer" style={{ marginTop: 12 }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Contributed on {new Date(res.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span style={{ color: 'var(--color-red)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
                  Active <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyKnowledge;
