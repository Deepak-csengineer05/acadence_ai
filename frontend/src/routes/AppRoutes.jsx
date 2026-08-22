import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy loaded page components for optimal bundle splitting
const Dashboard = lazy(() => import('../pages/Dashboard'));
const AIChat = lazy(() => import('../pages/AIChat'));
const Explorer = lazy(() => import('../pages/Explorer'));
const MyKnowledge = lazy(() => import('../pages/MyKnowledge'));
const Upload = lazy(() => import('../pages/Upload'));
const Interviews = lazy(() => import('../pages/Interviews'));
const ProjectHub = lazy(() => import('../pages/ProjectHub'));
const Leaderboard = lazy(() => import('../pages/Leaderboard'));
const Profile = lazy(() => import('../pages/Profile'));
const Notifications = lazy(() => import('../pages/Notifications'));
const SettingsPage = lazy(() => import('../pages/Settings'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminResourceMgmt = lazy(() => import('../pages/admin/AdminResourceMgmt'));
const AdminUserMgmt = lazy(() => import('../pages/admin/AdminUserMgmt'));
const AdminAIMonitoring = lazy(() => import('../pages/admin/AdminAIMonitoring'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminSystemStatus = lazy(() => import('../pages/admin/AdminSystemStatus'));
const AdminAnnouncements = lazy(() => import('../pages/admin/AdminAnnouncements'));
const AdminSupportInbox = lazy(() => import('../pages/admin/AdminSupportInbox'));

// Info Pages
const AboutProject = lazy(() => import('../pages/info/AboutProject'));
const RoadmapPage = lazy(() => import('../pages/info/RoadmapPage'));
const ContactPage = lazy(() => import('../pages/info/ContactPage'));
const HelpCenterPage = lazy(() => import('../pages/info/HelpCenterPage'));
const FeedbackPage = lazy(() => import('../pages/info/FeedbackPage'));
const TermsPage = lazy(() => import('../pages/info/TermsPage'));

const PageSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <div className="spinner" style={{ width: 36, height: 36, border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
  </div>
);

export default function AppRoutes({ props }) {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard {...props} />} />
        <Route path="/chat" element={<AIChat {...props} />} />
        <Route path="/explorer" element={<Explorer {...props} />} />
        <Route path="/my-knowledge" element={<MyKnowledge {...props} />} />
        <Route path="/upload" element={<Upload {...props} />} />
        <Route path="/interviews" element={<Interviews {...props} />} />
        <Route path="/projects" element={<ProjectHub {...props} />} />
        <Route path="/leaderboard" element={<Leaderboard {...props} />} />
        <Route path="/profile" element={<Profile {...props} />} />
        <Route path="/notifications" element={<Notifications {...props} />} />
        <Route path="/settings" element={<SettingsPage {...props} />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard {...props} />} />
        <Route path="/admin/resources" element={<AdminResourceMgmt {...props} />} />
        <Route path="/admin/users" element={<AdminUserMgmt {...props} />} />
        <Route path="/admin/ai-monitoring" element={<AdminAIMonitoring {...props} />} />
        <Route path="/admin/reports" element={<AdminReports {...props} />} />
        <Route path="/admin/system-status" element={<AdminSystemStatus {...props} />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements {...props} />} />
        <Route path="/admin/support" element={<AdminSupportInbox {...props} />} />

        {/* Info & Secondary Pages */}
        <Route path="/info/about" element={<AboutProject {...props} />} />
        <Route path="/info/roadmap" element={<RoadmapPage {...props} />} />
        <Route path="/info/contact" element={<ContactPage {...props} />} />
        <Route path="/info/help" element={<HelpCenterPage {...props} />} />
        <Route path="/info/feedback" element={<FeedbackPage {...props} />} />
        <Route path="/info/terms" element={<TermsPage {...props} />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
