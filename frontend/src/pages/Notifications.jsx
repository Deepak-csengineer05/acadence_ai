import React from 'react';
import { Bell, CheckCircle2, Heart, AlertCircle, Info, CheckCheck } from 'lucide-react';

function getNotifMeta(notif) {
  const msg = notif.content?.toLowerCase() || '';
  if (msg.includes('approved') || msg.includes('approve')) {
    return { iconClass: 'success', Icon: CheckCircle2, accent: 'var(--color-emerald)' };
  }
  if (msg.includes('upvote') || msg.includes('like')) {
    return { iconClass: 'red', Icon: Heart, accent: 'var(--color-red)' };
  }
  if (msg.includes('rejected') || msg.includes('error')) {
    return { iconClass: 'red', Icon: AlertCircle, accent: 'var(--color-red)' };
  }
  return { iconClass: 'blue', Icon: Info, accent: 'var(--color-blue)' };
}

const parseNotificationContent = (content) => {
  if (!content) return '';
  // Convert **text** to <strong>text</strong>
  return content.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
};

function groupByDate(notifications) {
  const today = new Date();
  const todayStr = today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const groups = { 'Today': [], 'Yesterday': [], 'Earlier': [] };

  notifications.forEach(n => {
    const d = new Date(n.created_at || Date.now());
    const dStr = d.toDateString();
    if (dStr === todayStr) groups['Today'].push(n);
    else if (dStr === yesterdayStr) groups['Yesterday'].push(n);
    else groups['Earlier'].push(n);
  });

  return groups;
}

function Notifications({ notifications, markNotificationsRead }) {
  const groups = groupByDate(notifications);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <div className="panel">
        <div className="panel-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} /> Notifications
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--color-red)', color: '#fff',
                borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 800,
                padding: '1px 7px', lineHeight: '18px'
              }}>
                {unreadCount}
              </span>
            )}
          </span>
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={markNotificationsRead}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Bell size={22} /></div>
            <p className="empty-state-title">You're all caught up</p>
            <p className="empty-state-desc">
              Notifications about document approvals, upvotes, and announcements will appear here.
            </p>
          </div>
        ) : (
          <>
            {Object.entries(groups).map(([group, items]) =>
              items.length > 0 ? (
                <div key={group}>
                  <div className="notif-group-label">{group}</div>
                  {items.map((notif, idx) => {
                    const { iconClass, Icon, accent } = getNotifMeta(notif);
                    return (
                      <div key={notif.id || idx} className={`notif-item ${!notif.is_read ? 'unread' : ''}`}>
                        <div className={`notif-icon-wrap ${iconClass}`}>
                          <Icon size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p 
                            style={{ margin: '0 0 4px', fontSize: 13.5, fontWeight: notif.is_read ? 500 : 700, color: 'var(--text-primary)', lineHeight: 1.4 }}
                            dangerouslySetInnerHTML={{ __html: parseNotificationContent(notif.content) }}
                          />
                          <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                            {notif.created_at
                              ? new Date(notif.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
                              : 'Just now'
                            }
                          </span>
                        </div>
                        {!notif.is_read && (
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Notifications;
