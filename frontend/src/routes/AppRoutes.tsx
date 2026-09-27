import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { HelpPage } from '../pages/public/HelpPage';
import { PrivacyPage } from '../pages/public/PrivacyPage';

// Auth Pages
import { StudentLoginPage } from '../pages/auth/StudentLoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { AdminLoginPage } from '../pages/auth/AdminLoginPage';

// Student Pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { ReportLostPage } from '../pages/student/ReportLostPage';
import { ReportFoundPage } from '../pages/student/ReportFoundPage';
import { MatchesPage } from '../pages/student/MatchesPage';
import { MatchDetailPage } from '../pages/student/MatchDetailPage';
import { VerificationPage } from '../pages/student/VerificationPage';
import { MessagesPage } from '../pages/student/MessagesPage';
import { CampusMapPage } from '../pages/student/CampusMapPage';
import { MyReportsPage } from '../pages/student/MyReportsPage';
import { ReportDetailPage } from '../pages/student/ReportDetailPage';
import { RecoveryPage } from '../pages/student/RecoveryPage';
import { RewardsPage } from '../pages/student/RewardsPage';
import { LeaderboardPage } from '../pages/student/LeaderboardPage';
import { AIAssistantPage } from '../pages/student/AIAssistantPage';
import { ProfilePage } from '../pages/student/ProfilePage';
import { NotificationsPage } from '../pages/student/NotificationsPage';
import { SettingsPage } from '../pages/student/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminCaseDetailPage } from '../pages/admin/AdminCaseDetailPage';
import { AdminMatchesPage } from '../pages/admin/AdminMatchesPage';
import { AdminLocationsPage } from '../pages/admin/AdminLocationsPage';
import { AdminResolutionPage } from '../pages/admin/AdminResolutionPage';
import { AdminRewardsPage } from '../pages/admin/AdminRewardsPage';
import { AdminAuditPage } from '../pages/admin/AdminAuditPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';

// AI Vision Lab
import { AIVisionLabPage } from '../pages/student/AIVisionLabPage';

// System Pages
import { NotFoundPage } from '../pages/system/NotFoundPage';
import { SystemErrorPage } from '../pages/system/SystemErrorPage';
import { MaintenancePage } from '../pages/system/MaintenancePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<StudentLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/:step" element={<RegisterPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/vision-lab" element={<AIVisionLabPage />} />
        <Route path="/ai-lab" element={<AIVisionLabPage />} />
      </Route>

      {/* Admin Login (Isolated) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Student Protected Portal */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentDashboardPage />} />
        <Route path="report-lost" element={<ReportLostPage />} />
        <Route path="report-found" element={<ReportFoundPage />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route path="matches/:id" element={<MatchDetailPage />} />
        <Route path="verification/:id" element={<VerificationPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="map" element={<CampusMapPage />} />
        <Route path="reports" element={<MyReportsPage />} />
        <Route path="reports/:id" element={<ReportDetailPage />} />
        <Route path="recovery/:id" element={<RecoveryPage />} />
        <Route path="rewards" element={<RewardsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="assistant" element={<AIAssistantPage />} />
        <Route path="vision-lab" element={<AIVisionLabPage />} />
        <Route path="ai-lab" element={<AIVisionLabPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
      </Route>

      {/* Admin Protected Portal */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="reports/:id" element={<AdminCaseDetailPage />} />
        <Route path="matches" element={<AdminMatchesPage />} />
        <Route path="locations" element={<AdminLocationsPage />} />
        <Route path="resolution" element={<AdminResolutionPage />} />
        <Route path="rewards" element={<AdminRewardsPage />} />
        <Route path="audit" element={<AdminAuditPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="vision-lab" element={<AIVisionLabPage />} />
      </Route>

      {/* System Error & Maintenance Pages */}
      <Route path="/system/404" element={<NotFoundPage />} />
      <Route path="/system/error" element={<SystemErrorPage />} />
      <Route path="/system/maintenance" element={<MaintenancePage />} />

      {/* Wildcard Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
