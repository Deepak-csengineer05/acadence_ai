import React from 'react';
import { Trophy, Flame, Gem, Target, Star, BookOpen, Upload, Heart, Lock } from 'lucide-react';
import GamifiedPodium from '../components/GamifiedPodium';

const BADGE_DEFS = [
  { id: 'first_contribution', name: 'First Contribution', desc: 'Shared first approved resource', icon: '🎓', goal: 'Upload 1 document', requiredPoints: 0, requiredUploads: 1 },
  { id: 'knowledge_overflow', name: 'Knowledge Overflow', desc: '5+ approved study materials', icon: '📚', goal: '5 approved uploads', requiredUploads: 5 },
  { id: 'sage_of_acadence', name: 'Sage of Acadence', desc: '10+ approved study materials', icon: '🧙', goal: '10 approved uploads', requiredUploads: 10 },
  { id: 'best_senior', name: 'Best Senior', desc: '100+ contribution points', icon: '⭐', goal: 'Earn 100 points', requiredPoints: 100 },
  { id: 'genius', name: 'Genius', desc: '500+ contribution points', icon: '🧠', goal: 'Earn 500 points', requiredPoints: 500 },
  { id: 'friendly_senior', name: 'Friendly Senior', desc: 'Gave 10+ upvotes to others', icon: '🤝', goal: 'Give 10 upvotes', requiredUpvotes: 10 },
  { id: 'streak_master', name: 'Streak Master', desc: 'Maintained a 7-day login streak', icon: <Flame size={18} style={{ color: 'var(--color-red)' }} />, goal: '7-day streak', requiredStreak: 7 },
];

function MilestoneBar({ label, current, target, icon, color }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className="milestone-item">
      <div className="milestone-icon-wrap" style={{ background: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {current} / {target}
          </span>
        </div>
        <div className="milestone-progress-bar-track">
          <div className="milestone-progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function Leaderboard({ leaderboard, achievements, user }) {
  if (!user) return null;

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const unlocked = achievements.map(a => a.badge_type);

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumRanks = [2, 1, 3];

  return (
    <div>
      {/* Podium */}
      {top3.length >= 2 && (
        <GamifiedPodium top3={top3} user={user} />
      )}

      <div className="grid-2">
        {/* Rankings Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel">
            <div className="panel-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy size={16} /> Full Rankings
              </span>
            </div>

            {/* Header */}
            <div className="leaderboard-header-row">
              <div>Rank</div>
              <div>Name</div>
              <div>Year</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Flame size={10} /> Streak</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Gem size={10} /> Points</div>
            </div>

            {leaderboard.map((student, idx) => (
              <div
                key={student.id}
                className={`leaderboard-table-row ${student.id === user.id ? 'current-user' : ''}`}
              >
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 13, color: 'var(--text-muted)' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </div>
                <div style={{ fontWeight: student.id === user.id ? 700 : 500, color: 'var(--text-primary)', fontSize: 13.5 }}>
                  {student.full_name}
                  {student.id === user.id && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--color-blue)', marginLeft: 6, background: 'var(--color-blue-dim)', padding: '2px 6px', borderRadius: 'var(--radius-full)' }}>
                      You
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{student.academic_year} Yr</div>
                <div style={{ fontSize: 13, color: 'var(--color-red)', fontWeight: 700 }}>
                  {student.streak_count}d
                </div>
                <div style={{ fontSize: 14, color: 'var(--color-emerald)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                  {student.contribution_points}
                </div>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><Trophy size={20} /></div>
                <p className="empty-state-title">No rankings yet</p>
                <p className="empty-state-desc">Start contributing to appear on the leaderboard!</p>
              </div>
            )}
          </div>
        </div>

        {/* Miles to Go */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="panel" style={{ height: '100%', marginBottom: 0 }}>
            <div className="panel-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={16} /> Miles to Go
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>Your progress</span>
            </div>

            <MilestoneBar
              label="Contribution Points"
              current={user.contribution_points ?? 0}
              target={100}
              icon={<Gem size={16} />}
              color="var(--color-emerald)"
            />
            <MilestoneBar
              label="Daily Streak"
              current={user.streak_count ?? 0}
              target={7}
              icon={<Flame size={16} />}
              color="var(--color-red)"
            />
            <MilestoneBar
              label="Badges Unlocked"
              current={achievements.length}
              target={BADGE_DEFS.length}
              icon={<Star size={16} />}
              color="var(--color-amber)"
            />

            <div style={{
              marginTop: 14, padding: '12px 14px',
              background: 'var(--color-red-dim)', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(225,29,72,0.2)',
              fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5
            }}>
              <strong style={{ color: 'var(--color-red)' }}>Keep going!</strong> Upload resources and stay active daily
              to climb the rankings, unlock more badges, and earn bonus points.
            </div>
          </div>
        </div>
      </div>

      {/* Badge Collection - Spans Full Width */}
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={16} /> Achievement Badges
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {achievements.length}/{BADGE_DEFS.length} unlocked
          </span>
        </div>

        <div className="achievement-grid">
          {BADGE_DEFS.map(badge => {
            const earned = unlocked.includes(badge.id);
            return (
              <div key={badge.id} className={`badge-card ${earned ? 'unlocked' : ''}`} title={badge.goal}>
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
                <span className="badge-desc">{badge.desc}</span>
                {earned
                  ? <span className="badge-unlocked-label">Unlocked ✓</span>
                  : <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-muted)' }}>
                      <Lock size={9} /> {badge.goal}
                    </span>
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
