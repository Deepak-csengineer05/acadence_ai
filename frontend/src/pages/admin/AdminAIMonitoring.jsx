import React from 'react';
import { Flame } from 'lucide-react';

function AdminAIMonitoring({ aiMonitoring }) {
  return (
    <div>
      <div className="panel">
        <h2 className="panel-title">AI Engine Monitoring Stats</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Logs and analytics capturing local model load times, tokens, searches, and semantic queries.
        </p>
        {aiMonitoring && (
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <span className="stat-label">Total Tokens Logged</span>
              <span className="stat-value">{aiMonitoring.total_tokens_used}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Search/Chat Queries</span>
              <span className="stat-value">{aiMonitoring.total_queries_logged}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Search Accuracy Ratio</span>
              <span className="stat-value">{aiMonitoring.search_accuracy_percentage}%</span>
            </div>
          </div>
        )}
      </div>

      {aiMonitoring && (
        <div className="grid-2">
          <div className="panel">
            <h3 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={16} style={{ color: 'var(--color-red)' }} /> Most Asked / Popular Searches
            </h3>
            {aiMonitoring.popular_queries.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No logs compiled.</p>
            ) : (
              <ul style={{ lineHeight: 2 }}>
                {aiMonitoring.popular_queries.map((q, i) => (
                  <li key={i}>{q.query} ({q.count} searches)</li>
                ))}
              </ul>
            )}
          </div>
          <div className="panel">
            <h3 className="panel-title">⚠️ Knowledge Gaps & Failed Queries</h3>
            {aiMonitoring.failed_queries.length === 0 ? (
              <p style={{ color: 'var(--text-emerald)', fontWeight: 600 }}>Zero failed searches recorded.</p>
            ) : (
              <ul style={{ lineHeight: 2, color: 'var(--color-coral)' }}>
                {aiMonitoring.failed_queries.map((q, i) => (
                  <li key={i}>{q.query}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAIMonitoring;
