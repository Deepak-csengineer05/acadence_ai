import React, { useEffect, useRef } from 'react';
import { Award, Trophy } from 'lucide-react';

const RANK_COLORS = {
  1: {
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.25)',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    bg: 'rgba(251, 191, 36, 0.03)',
    border: 'rgba(251, 191, 36, 0.2)',
    text: '#fef08a'
  },
  2: {
    accent: '#9ca3af',
    glow: 'rgba(156, 163, 175, 0.15)',
    gradient: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)',
    bg: 'rgba(156, 163, 175, 0.02)',
    border: 'rgba(156, 163, 175, 0.15)',
    text: '#f3f4f6'
  },
  3: {
    accent: '#d97706',
    glow: 'rgba(217, 119, 6, 0.15)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
    bg: 'rgba(217, 119, 6, 0.02)',
    border: 'rgba(217, 119, 6, 0.15)',
    text: '#ffedd5'
  }
};

function GamifiedPodium({ top3, user }) {
  const canvasRef = useRef(null);
  const confettiArrayRef = useRef([]);

  const triggerConfetti = (startX, startY) => {
    const colors = ['#fbbf24', '#f59e0b', '#3b82f6', '#10b981', '#e11d48', '#8b5cf6'];
    const count = 40;
    const tempConfetti = [];

    for (let i = 0; i < count; i++) {
      tempConfetti.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 10 - 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 4,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        opacity: 1,
        gravity: 0.22,
        friction: 0.98
      });
    }

    confettiArrayRef.current = [...confettiArrayRef.current, ...tempConfetti];
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        triggerConfetti(rect.width / 2, rect.height * 0.4);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Fine background stars
    const stars = [];
    const maxStars = 30;
    for (let i = 0; i < maxStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: -Math.random() * 0.3 - 0.1,
        size: Math.random() * 1.2 + 0.4,
        opacity: Math.random() * 0.3 + 0.1,
        color: '#ffffff'
      });
    }

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // Fine stars update
      stars.forEach(s => {
        s.y += s.vy;
        if (s.y < 0) {
          s.y = height;
          s.x = Math.random() * width;
        }
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.opacity;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Confetti updates
      const confettis = confettiArrayRef.current;
      for (let i = confettis.length - 1; i >= 0; i--) {
        const c = confettis[i];
        c.vy += c.gravity;
        c.vx *= c.friction;
        c.vy *= c.friction;
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotationSpeed;
        c.opacity -= 0.018;

        if (c.opacity <= 0 || c.y > height + 20) {
          confettis.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = c.opacity;
        ctx.fillStyle = c.color;
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);

        if (c.shape === 'rect') {
          ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handlePedestalClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = rect.left - canvasRect.left + rect.width / 2;
    const y = rect.top - canvasRect.top + 10;
    triggerConfetti(x, y);
  };

  const orderedList = [];
  if (top3[1]) orderedList.push({ student: top3[1], rank: 2 });
  if (top3[0]) orderedList.push({ student: top3[0], rank: 1 });
  if (top3[2]) orderedList.push({ student: top3[2], rank: 3 });

  return (
    <div 
      className="panel" 
      style={{ 
        position: 'relative', 
        height: 380, 
        overflow: 'hidden', 
        padding: 0,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end'
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          width: '100%', 
          height: '100%', 
          pointerEvents: 'none',
          zIndex: 1
        }} 
      />

      {/* Header */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 20, 
          left: 24, 
          right: 24, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 5
        }}
      >
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          fontSize: 13.5, 
          fontWeight: 700, 
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)',
          letterSpacing: '-0.2px'
        }}>
          <Trophy size={14} style={{ color: 'var(--color-amber)' }} /> 
          Top Contributors
        </span>
      </div>

      {/* Clean, Non-overlapping Flex Layout */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'center', 
          gap: 20, 
          padding: '0 24px 24px',
          position: 'relative',
          zIndex: 3
        }}
      >
        {orderedList.map(({ student, rank }) => {
          const conf = RANK_COLORS[rank];
          const isCurrentUser = student.id === user.id;
          
          // Pedestal Heights
          const pedestalHeight = rank === 1 ? 120 : rank === 2 ? 85 : 60;

          return (
            <div 
              key={student.id} 
              onClick={handlePedestalClick}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                flex: 1,
                maxWidth: 140,
                cursor: 'pointer',
                gap: 8
              }}
              className="podium-pedestal-group"
            >
              {/* 1. Avatar */}
              <div 
                style={{ 
                  width: rank === 1 ? 56 : 48, 
                  height: rank === 1 ? 56 : 48, 
                  borderRadius: '50%', 
                  background: 'var(--bg-elevated)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 800, 
                  fontSize: rank === 1 ? 18 : 15, 
                  color: 'var(--text-primary)',
                  border: `2px solid ${conf.accent}`,
                  boxShadow: `0 0 12px ${conf.glow}`,
                  position: 'relative',
                  transition: 'transform 0.2s ease'
                }}
                className="avatar-ring"
              >
                {student.full_name[0].toUpperCase()}
              </div>

              {/* 2. Student Info Card */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ 
                  fontSize: 12.5, 
                  fontWeight: 700, 
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  justifyContent: 'center'
                }}>
                  {student.full_name.split(' ')[0]}
                  {isCurrentUser && (
                    <span style={{ 
                      fontSize: 8, 
                      background: 'var(--color-blue-dim)', 
                      color: 'var(--color-blue)', 
                      padding: '0px 4px', 
                      borderRadius: 10
                    }}>
                      You
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: conf.accent, fontWeight: 700, marginTop: 1 }}>
                  {student.contribution_points} pts
                </div>
              </div>

              {/* 3. Pedestal Block */}
              <div 
                style={{ 
                  width: '100%', 
                  height: pedestalHeight, 
                  background: 'var(--bg-elevated)', 
                  border: `1px solid var(--border-color)`,
                  borderTop: `3px solid ${conf.accent}`,
                  borderBottom: 'none',
                  borderRadius: '8px 8px 0 0',
                  boxShadow: `var(--shadow-sm)`,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}
                className="pedestal-block"
              >
                {/* Circular Rank Medal */}
                <div 
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--bg-panel)',
                    border: `1.5px solid ${conf.accent}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    color: conf.accent,
                    boxShadow: `0 2px 6px ${conf.glow}`
                  }}
                >
                  {rank}
                </div>

                <Award size={12} style={{ color: conf.accent, opacity: 0.8 }} />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .podium-pedestal-group:hover .avatar-ring {
          transform: scale(1.05);
          border-color: var(--color-blue) !important;
          box-shadow: var(--shadow-md) !important;
        }
        .podium-pedestal-group:hover .pedestal-block {
          background: var(--bg-hover) !important;
          border-color: var(--border-strong) !important;
        }
      `}</style>
    </div>
  );
}

export default GamifiedPodium;
