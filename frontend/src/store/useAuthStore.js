import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user_profile') || 'null'),
  token: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  notifications: [],
  unreadNotifsCount: 0,

  setAuth: (token, user) => {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
    if (user) {
      localStorage.setItem('user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('user_profile');
    }
    set({ token, user, isAuthenticated: !!token });
  },

  updateUser: (partialUser) => {
    const updated = { ...get().user, ...partialUser };
    localStorage.setItem('user_profile', JSON.stringify(updated));
    set({ user: updated });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    set({ user: null, token: null, isAuthenticated: false, notifications: [], unreadNotifsCount: 0 });
  },

  setNotifications: (notifications) => {
    const unread = notifications.filter(n => !n.is_read).length;
    set({ notifications, unreadNotifsCount: unread });
  }
}));
