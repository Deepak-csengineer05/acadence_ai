import React from 'react';

function AdminReports({ reports }) {
  if (!reports) return null;

  return (
    <div className="grid-2">
      <div className="panel">
        <h2 className="panel-title">Monthly Growth Report</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <strong>Approved Placement Ratio:</strong>
            <div className="stat-card accent-emerald" style={{ marginTop: 10 }}>
              <span className="stat-label">Success Placement Feedback logs</span>
              <span className="stat-value">{reports.summary.placement_success_count}</span>
            </div>
          </div>
          <div>
            <strong>Monthly resource uploads:</strong>
            <div className="stat-card accent-blue" style={{ marginTop: 10 }}>
              <span className="stat-label">Files Uploaded past 30 days</span>
              <span className="stat-value">{reports.summary.monthly_resource_growth}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Top Student Contributors List</h2>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Year</th>
                <th>Contribution Points</th>
              </tr>
            </thead>
            <tbody>
              {reports.contribution_details.map((c, i) => (
                <tr key={i}>
                  <td>{c.student_name}</td>
                  <td>{c.academic_year}</td>
                  <td style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>{c.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
