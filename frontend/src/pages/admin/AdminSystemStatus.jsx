import React from 'react';

function AdminSystemStatus({ sysStatus }) {
  if (!sysStatus) return null;

  return (
    <div className="grid-3">
      <div className="panel">
        <h2 className="panel-title">Storage & SQLite Health</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <strong>DB File Size:</strong>
            <p style={{ fontSize: 20, fontWeight: 700, margin: '6px 0' }}>{sysStatus.sqlite_db_size_kb} KB</p>
          </div>
          <div className="sidebar-divider"></div>
          <div>
            <strong>Hosting Environment:</strong>
            <p>{sysStatus.system.environment}</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Local Qdrant Status</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <strong>Connection status:</strong>
            <p style={{ 
              fontSize: 16, fontWeight: 700, margin: '6px 0', 
              color: sysStatus.qdrant.online ? 'var(--color-emerald)' : 'var(--color-coral)' 
            }}>
              {sysStatus.qdrant.online ? "ONLINE" : "OFFLINE"}
            </p>
          </div>
          <div className="sidebar-divider"></div>
          <div>
            <strong>Indexed vectors count:</strong>
            <p style={{ fontSize: 20, fontWeight: 700, margin: '6px 0' }}>{sysStatus.qdrant.indexed_vectors_count}</p>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Ollama (LLM Pipeline)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <strong>Connection status:</strong>
            <p style={{ 
              fontSize: 16, fontWeight: 700, margin: '6px 0', 
              color: sysStatus.ollama.online ? 'var(--color-emerald)' : 'var(--color-coral)' 
            }}>
              {sysStatus.ollama.online ? "ONLINE" : "OFFLINE"}
            </p>
          </div>
          <div className="sidebar-divider"></div>
          <div>
            <strong>Available models:</strong>
            <p style={{ fontSize: 13 }}>{sysStatus.ollama.available_models.join(", ") || "None found"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSystemStatus;
