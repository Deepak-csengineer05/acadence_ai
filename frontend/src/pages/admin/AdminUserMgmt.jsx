import React from 'react';
import { Flame } from 'lucide-react';

function AdminUserMgmt({ adminUsers, handleRoleToggle, handleDeleteUser, currentUser }) {
  if (!currentUser) return null;

  return (
    <div className="panel">
      <h2 className="panel-title">User Accounts Control</h2>
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Academic Year</th>
              <th>Streak</th>
              <th>Points</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map(u => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>
                  <span style={{ 
                    fontSize: 11, padding: '2px 6px', borderRadius: 4, 
                    backgroundColor: u.role === "admin" ? 'rgba(244,63,94,0.1)' : 'rgba(59,130,246,0.1)',
                    color: u.role === "admin" ? 'var(--color-coral)' : 'var(--color-blue)'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td>{u.academic_year || "N/A"}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--color-red)', fontWeight: 700 }}>
                    <Flame size={13} /> {u.streak_count}
                  </span>
                </td>
                <td>{u.contribution_points}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}
                            onClick={() => handleRoleToggle(u.id, u.role)}>
                      Toggle Admin
                    </button>
                    {u.id !== currentUser.id && (
                      <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: 12 }}
                              onClick={() => handleDeleteUser(u.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUserMgmt;
