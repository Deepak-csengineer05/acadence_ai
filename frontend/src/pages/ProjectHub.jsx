import React, { useState } from 'react';
import { Code2, ExternalLink, Heart, User, Tag, Lightbulb, Cpu, Plus, BookOpen, Globe } from 'lucide-react';

// Mock project data — in production, fetch from backend
const MOCK_PROJECTS = [
  {
    id: 1,
    title: 'AI-Powered Attendance System using Face Recognition',
    author: 'Karthik Selvam',
    year: 'IV',
    problem: 'Manual attendance is time-consuming and error-prone in large classrooms.',
    solution: 'A real-time face recognition system using OpenCV and DeepFace that automatically marks attendance.',
    techStack: ['Python', 'OpenCV', 'DeepFace', 'FastAPI', 'SQLite'],
    githubUrl: '',
    status: 'completed',
    upvotes: 24,
    department: 'CSE',
  },
  {
    id: 2,
    title: 'Smart Waste Management IoT System',
    author: 'Priya Nair',
    year: 'III',
    problem: 'Waste bins overflow before collection schedules, causing hygiene issues in campuses.',
    solution: 'IoT-enabled smart dustbins with fill-level sensors and a route-optimization dashboard for collection teams.',
    techStack: ['Arduino', 'MQTT', 'Node.js', 'React', 'MongoDB'],
    githubUrl: '',
    status: 'open',
    upvotes: 18,
    department: 'ECE',
  },
  {
    id: 3,
    title: 'Distributed Exam Scheduling Algorithm',
    author: 'Rahul Menon',
    year: 'IV',
    problem: 'Scheduling exams without conflicts across departments and invigilators is computationally hard.',
    solution: 'Graph coloring algorithm implemented with constraint satisfaction to generate conflict-free exam schedules.',
    techStack: ['Python', 'NetworkX', 'Flask', 'PostgreSQL', 'React'],
    githubUrl: '',
    status: 'completed',
    upvotes: 31,
    department: 'CSE',
  },
];

const DEPT_COLORS = {
  CSE: { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: 'rgba(59,130,246,0.25)' },
  ECE: { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: 'rgba(16,185,129,0.25)' },
  IT: { bg: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: 'rgba(139,92,246,0.25)' },
  ME: { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: 'rgba(245,158,11,0.25)' },
};

function ProjectHub({ user, setActiveTab }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = MOCK_PROJECTS.filter(p => {
    if (filterDept && p.department !== filterDept) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="panel" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.04))', border: '1px solid rgba(59,130,246,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Project Hub
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 500 }}>
              Explore real-world projects built by seniors. See problems they solved, tech stacks used,
              and lessons learned — your roadmap to impactful final-year projects.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('upload')}>
              <Plus size={14} /> Submit Your Project
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginRight: 4 }}>Filter:</span>
        {['CSE', 'ECE', 'IT', 'ME'].map(dept => {
          const style = DEPT_COLORS[dept] || {};
          return (
            <div
              key={dept}
              className={`chip ${filterDept === dept ? 'active' : ''}`}
              onClick={() => setFilterDept(filterDept === dept ? '' : dept)}
              style={filterDept === dept ? { background: style.bg, borderColor: style.border, color: style.color } : {}}
            >
              {dept}
            </div>
          );
        })}
        <div className="sidebar-divider" style={{ width: 1, height: 20, margin: '0 4px' }} />
        <div
          className={`chip ${filterStatus === 'open' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'open' ? '' : 'open')}
          style={filterStatus === 'open' ? { background: 'var(--color-emerald-dim)', borderColor: 'rgba(16,185,129,0.3)', color: 'var(--color-emerald)' } : {}}
        >
          Open for Collaboration
        </div>
        <div
          className={`chip ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus(filterStatus === 'completed' ? '' : 'completed')}
          style={filterStatus === 'completed' ? { background: 'var(--color-blue-dim)', borderColor: 'rgba(59,130,246,0.3)', color: 'var(--color-blue)' } : {}}
        >
          Completed
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid-3">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1' }}>
            <div className="empty-state">
              <div className="empty-state-icon"><Code2 size={22} /></div>
              <p className="empty-state-title">No projects found</p>
              <p className="empty-state-desc">Try changing the filters or be the first to submit your project!</p>
            </div>
          </div>
        ) : filtered.map(project => {
          const deptStyle = DEPT_COLORS[project.department] || {};
          return (
            <div key={project.id} className="project-card" onClick={() => setSelectedProject(project)}>
              {/* Status + Dept */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span
                  className="project-status-badge"
                  style={project.status === 'completed'
                    ? { background: 'var(--color-blue-dim)', color: 'var(--color-blue)' }
                    : { background: 'var(--color-emerald-dim)', color: 'var(--color-emerald)' }
                  }
                >
                  {project.status === 'open' ? <><Globe size={10} /> Open</> : <><BookOpen size={10} /> Completed</>}
                </span>
                {project.department && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
                    background: deptStyle.bg || 'var(--bg-elevated)',
                    color: deptStyle.color || 'var(--text-muted)',
                    border: `1px solid ${deptStyle.border || 'var(--border-subtle)'}`
                  }}>
                    {project.department}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 style={{
                margin: '0 0 8px', fontSize: 14.5, fontWeight: 800,
                color: 'var(--text-primary)', lineHeight: 1.3,
                fontFamily: 'var(--font-heading)', letterSpacing: '-0.2px'
              }}>
                {project.title}
              </h3>

              {/* Problem preview */}
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 12
              }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                  <Lightbulb size={11} style={{ color: 'var(--color-amber)' }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--color-amber)' }}>Problem</span>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {project.problem}
                </p>
              </div>

              {/* Tech Stack */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                {project.techStack.slice(0, 4).map(tech => (
                  <span key={tech} className="tech-tag">
                    {tech}
                  </span>
                ))}
                {project.techStack.length > 4 && (
                  <span className="tech-tag" style={{ opacity: 0.7 }}>+{project.techStack.length - 4}</span>
                )}
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 12, borderTop: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <User size={11} /> {project.author} · {project.year} Yr
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Heart size={11} /> {project.upvotes}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="interview-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedProject(null); }}>
          <div className="interview-modal" style={{ maxWidth: 760 }}>
            <div className="interview-modal-header">
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span className="project-status-badge" style={
                    selectedProject.status === 'completed'
                      ? { background: 'var(--color-blue-dim)', color: 'var(--color-blue)' }
                      : { background: 'var(--color-emerald-dim)', color: 'var(--color-emerald)' }
                  }>
                    {selectedProject.status === 'open' ? 'Open for Collaboration' : 'Completed Project'}
                  </span>
                  {selectedProject.department && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                      {selectedProject.department}
                    </span>
                  )}
                </div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.3px', maxWidth: 500 }}>
                  {selectedProject.title}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                  By {selectedProject.author} · {selectedProject.year} Year
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedProject(null)}>✕</button>
            </div>

            <div className="interview-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                {/* Problem */}
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                    <Lightbulb size={14} style={{ color: 'var(--color-amber)' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-amber)' }}>Problem</span>
                  </div>
                  <div className="interview-content-block">{selectedProject.problem}</div>
                </div>

                {/* Solution */}
                <div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                    <Code2 size={14} style={{ color: 'var(--color-blue)' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-blue)' }}>Solution</span>
                  </div>
                  <div className="interview-content-block">{selectedProject.solution}</div>
                </div>
              </div>

              {/* Tech Stack */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10 }}>
                  <Code2 size={14} style={{ color: 'var(--color-emerald)' }} />
                  <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-emerald)' }}>Tech Stack</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedProject.techStack.map(tech => (
                    <span key={tech} className="tech-tag" style={{ fontSize: 13 }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* GitHub link */}
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex' }}
                >
                  <ExternalLink size={14} /> View on GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectHub;
