import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Edit3, Trash2, CheckCircle2, XCircle, Clock, 
  AlertTriangle, Filter, Tag, FileText, Check, X, ShieldAlert 
} from 'lucide-react';
import ClaySelect from '../../components/ClaySelect';

function AdminResourceMgmt({ 
  pendingResources = [], 
  handleModeration, 
  token, 
  API_BASE, 
  categories = [], 
  courses = [], 
  fetchDashboardData 
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [toastMessage, setToastMessage] = useState(null);

  // Edit Modal State
  const [editingDoc, setEditingDoc] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editCourseId, setEditCourseId] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editStatus, setEditStatus] = useState('APPROVED');
  const [editIsProject, setEditIsProject] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [deletingName, setDeletingName] = useState('');

  const fetchAllDocuments = async () => {
    setLoading(true);
    try {
      const baseUrl = API_BASE || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/documents/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error("Failed to fetch librarian documents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDocuments();
  }, [token, API_BASE]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Edit Modal
  const handleOpenEdit = (doc) => {
    setEditingDoc(doc);
    setEditTitle(doc.title || '');
    setEditCategoryId(doc.category_id ? String(doc.category_id) : '');
    setEditCourseId(doc.course_id ? String(doc.course_id) : '');
    setEditTags(doc.tags || '');
    setEditStatus(doc.status || 'APPROVED');
    setEditIsProject(Boolean(doc.is_project));
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDoc) return;
    setSavingEdit(true);

    try {
      const baseUrl = API_BASE || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/documents/${editingDoc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          category_id: editCategoryId ? parseInt(editCategoryId) : null,
          course_id: editCourseId ? parseInt(editCourseId) : null,
          tags: editTags,
          status: editStatus,
          is_project: editIsProject
        })
      });

      if (res.ok) {
        showToast(`" ${editTitle} " metadata updated successfully!`);
        setEditingDoc(null);
        fetchAllDocuments();
        if (fetchDashboardData) fetchDashboardData();
      } else {
        const err = await res.json();
        showToast(`Edit failed: ${err.detail || 'Error updating document'}`, 'error');
      }
    } catch (err) {
      showToast("Network error while updating resource.", 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Execute Permanent Delete
  const handleConfirmDelete = async () => {
    if (!deletingDocId) return;
    try {
      const baseUrl = API_BASE || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/documents/${deletingDocId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showToast(`Document #${deletingDocId} permanently deleted from database, disk, & vector memory.`);
        setDeletingDocId(null);
        setDeletingName('');
        fetchAllDocuments();
        if (fetchDashboardData) fetchDashboardData();
      } else {
        const err = await res.json();
        showToast(`Deletion failed: ${err.detail || 'Could not delete resource'}`, 'error');
      }
    } catch (e) {
      showToast("Network error while attempting to delete resource.", 'error');
    }
  };

  // Handle Moderator Approve/Reject shortcut
  const handleQuickStatusChange = async (docId, actionType) => {
    try {
      const baseUrl = API_BASE || 'http://localhost:8000';
      const endpoint = actionType === 'approve' ? `/documents/approve/${docId}` : `/documents/reject/${docId}`;
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showToast(`Document #${docId} status set to ${actionType === 'approve' ? 'APPROVED' : 'REJECTED'}.`);
        fetchAllDocuments();
        if (fetchDashboardData) fetchDashboardData();
      }
    } catch (e) {
      showToast("Failed to update status", 'error');
    }
  };

  // Filter & Search Logic
  const filteredDocs = documents.filter(doc => {
    const matchesFilter = 
      activeFilter === 'ALL' ? true :
      activeFilter === 'PENDING' ? doc.status === 'PENDING' :
      activeFilter === 'APPROVED' ? doc.status === 'APPROVED' :
      activeFilter === 'REJECTED' ? doc.status === 'REJECTED' : true;

    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      !query ||
      doc.title.toLowerCase().includes(query) ||
      (doc.uploader_name && doc.uploader_name.toLowerCase().includes(query)) ||
      (doc.category_name && doc.category_name.toLowerCase().includes(query)) ||
      (doc.course_code && doc.course_code.toLowerCase().includes(query)) ||
      (doc.tags && doc.tags.toLowerCase().includes(query));

    return matchesFilter && matchesQuery;
  });

  const pendingCount = documents.filter(d => d.status === 'PENDING').length;
  const approvedCount = documents.filter(d => d.status === 'APPROVED').length;
  const rejectedCount = documents.filter(d => d.status === 'REJECTED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: toastMessage.type === 'error' ? 'var(--color-red-dim)' : 'var(--color-emerald-dim)',
          border: `1px solid ${toastMessage.type === 'error' ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`,
          color: toastMessage.type === 'error' ? 'var(--color-red)' : 'var(--color-emerald)',
          fontWeight: 600,
          fontSize: 13.5,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          {toastMessage.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {toastMessage.msg}
        </div>
      )}

      {/* Header Panel */}
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 className="panel-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <BookOpen size={20} style={{ color: 'var(--color-blue)' }} /> Resource Librarian & Catalog Management
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Organize, edit metadata, purge duplicates, or audit documents across the university database.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ background: 'var(--bg-elevated)', padding: '8px 14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{documents.length}</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '8px 14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--color-amber)', textTransform: 'uppercase', fontWeight: 700 }}>Pending</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-amber)' }}>{pendingCount}</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '8px 14px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--color-emerald)', textTransform: 'uppercase', fontWeight: 700 }}>Approved</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-emerald)' }}>{approvedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button 
              className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveFilter('ALL')}
            >
              All Resources ({documents.length})
            </button>
            <button 
              className={`btn btn-sm ${activeFilter === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveFilter('PENDING')}
              style={{ color: activeFilter !== 'PENDING' ? 'var(--color-amber)' : '#fff' }}
            >
              <Clock size={13} /> Pending ({pendingCount})
            </button>
            <button 
              className={`btn btn-sm ${activeFilter === 'APPROVED' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveFilter('APPROVED')}
              style={{ color: activeFilter !== 'APPROVED' ? 'var(--color-emerald)' : '#fff' }}
            >
              <CheckCircle2 size={13} /> Approved ({approvedCount})
            </button>
            <button 
              className={`btn btn-sm ${activeFilter === 'REJECTED' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveFilter('REJECTED')}
              style={{ color: activeFilter !== 'REJECTED' ? 'var(--color-red)' : '#fff' }}
            >
              <XCircle size={13} /> Rejected ({rejectedCount})
            </button>
          </div>

          {/* Live Search Bar */}
          <div style={{ position: 'relative', width: 280 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search title, tags, code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 34, height: 36, fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      {/* Main Catalog Table */}
      <div className="panel">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading librarian catalog...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No resources match your current filter and search query.
          </div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Resource Title</th>
                  <th>Category</th>
                  <th>Course Code</th>
                  <th>Uploader</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Librarian Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>
                        {doc.title}
                      </div>
                      {doc.tags && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 4, marginTop: 2, alignItems: 'center' }}>
                          <Tag size={10} /> {doc.tags}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="doc-tag" style={{ fontWeight: 600 }}>
                        {doc.category_name}
                      </span>
                    </td>

                    <td>
                      {doc.course_code ? (
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-blue)' }}>
                          {doc.course_code}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {doc.uploader_name}
                      </div>
                    </td>

                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        background: doc.status === 'APPROVED' ? 'rgba(16,185,129,0.12)' : doc.status === 'PENDING' ? 'rgba(245,158,11,0.12)' : 'rgba(244,63,94,0.12)',
                        color: doc.status === 'APPROVED' ? 'var(--color-emerald)' : doc.status === 'PENDING' ? 'var(--color-amber)' : 'var(--color-red)',
                        border: `1px solid ${doc.status === 'APPROVED' ? 'rgba(16,185,129,0.3)' : doc.status === 'PENDING' ? 'rgba(245,158,11,0.3)' : 'rgba(244,63,94,0.3)'}`
                      }}>
                        {doc.status}
                      </span>
                    </td>

                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(doc.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {doc.status === 'PENDING' && (
                          <button 
                            className="btn btn-success btn-sm"
                            title="Approve Resource"
                            onClick={() => handleQuickStatusChange(doc.id, 'approve')}
                            style={{ padding: '4px 10px', fontSize: 11.5 }}
                          >
                            <Check size={13} /> Approve
                          </button>
                        )}

                        <button 
                          className="btn btn-secondary btn-sm"
                          title="Edit Librarian Metadata"
                          onClick={() => handleOpenEdit(doc)}
                          style={{ padding: '4px 10px', fontSize: 11.5 }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        <button 
                          className="btn btn-danger btn-sm"
                          title="Delete Permanently"
                          onClick={() => {
                            setDeletingDocId(doc.id);
                            setDeletingName(doc.title);
                          }}
                          style={{ padding: '4px 10px', fontSize: 11.5 }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Metadata Modal */}
      {editingDoc && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: 520, position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit3 size={18} style={{ color: 'var(--color-blue)' }} /> Edit Resource #{editingDoc.id}
              </h3>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setEditingDoc(null)}
                style={{ padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <ClaySelect 
                    value={editCategoryId}
                    onChange={val => setEditCategoryId(val)}
                    placeholder="Select Category"
                    options={categories.map(c => ({ value: String(c.id), label: c.name }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Course Code</label>
                  <ClaySelect 
                    value={editCourseId}
                    onChange={val => setEditCourseId(val)}
                    placeholder="No course link"
                    options={[
                      { value: '', label: 'General / No Course' },
                      ...courses.map(c => ({ value: String(c.id), label: `${c.code} — ${c.name}` }))
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Moderation Status</label>
                  <ClaySelect 
                    value={editStatus}
                    onChange={val => setEditStatus(val)}
                    options={[
                      { value: 'APPROVED', label: 'APPROVED (Live)' },
                      { value: 'PENDING', label: 'PENDING (Under Review)' },
                      { value: 'REJECTED', label: 'REJECTED (Hidden)' },
                    ]}
                  />
                </div>

                <div className="form-group" style={{ justifyContent: 'center' }}>
                  <label className="form-label">Project Tag</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
                    <input 
                      type="checkbox"
                      checked={editIsProject}
                      onChange={e => setEditIsProject(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--color-red)' }}
                    />
                    Final Year Project Report
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editTags}
                  onChange={e => setEditTags(e.target.value)}
                  placeholder="dbms, sql, relational algebra"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingDoc(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDocId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: 440, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)',
              color: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <ShieldAlert size={26} />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>
              Delete Resource #{deletingDocId}?
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong>"{deletingName}"</strong>? This will remove the file from storage, delete the database entry, and purge all vector embeddings.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setDeletingDocId(null);
                  setDeletingName('');
                }}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                <Trash2 size={14} /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminResourceMgmt;
