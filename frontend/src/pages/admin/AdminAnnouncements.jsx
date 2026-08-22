import React from 'react';

function AdminAnnouncements({
  newAnnouncement, setNewAnnouncement,
  handlePostAnnouncement
}) {
  return (
    <div className="panel" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 className="panel-title">Post New Banner Announcement</h2>
      <form onSubmit={handlePostAnnouncement}>
        <div className="form-group">
          <label className="form-label">Banner Title</label>
          <input className="form-input" type="text" required placeholder="e.g. CS302 Midterm Syllabus Update"
            value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Details / Contents</label>
          <textarea className="form-textarea" required placeholder="Type instructions for all students..."
            value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} />
        </div>
        <button className="btn btn-primary" type="submit">Publish Banner Announcement</button>
      </form>
    </div>
  );
}

export default AdminAnnouncements;
