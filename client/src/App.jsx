import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RootLayout from './layouts/RootLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CareerGoalPage from './pages/CareerGoalPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ResumeHistoryPage from './pages/ResumeHistoryPage';
import ResumeDetailPage from './pages/ResumeDetailPage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import MockInterviewConfigPage from './pages/MockInterviewConfigPage';
import MockInterviewSessionPage from './pages/MockInterviewSessionPage';
import MockInterviewResultPage from './pages/MockInterviewResultPage';
import MockInterviewHistoryPage from './pages/MockInterviewHistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import JobsFeedPage from './pages/JobsFeedPage';
import JobDetailPage from './pages/JobDetailPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminJobsListPage from './pages/admin/AdminJobsListPage';
import AdminJobCreatePage from './pages/admin/AdminJobCreatePage';
import AdminJobDetailPage from './pages/admin/AdminJobDetailPage';
import AdminJobEditPage from './pages/admin/AdminJobEditPage';
import AdminApplicationsListPage from './pages/admin/AdminApplicationsListPage';
import AdminApplicationDetailPage from './pages/admin/AdminApplicationDetailPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Authenticated Candidate Workspace Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="career-goal" element={<CareerGoalPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Candidate Jobs Feed & Job Details */}
            <Route path="jobs" element={<JobsFeedPage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />

            {/* Candidate Applications & Tracking */}
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="applications/:id" element={<ApplicationDetailPage />} />

            {/* Resume Upload, History, Details & AI ATS Analysis */}
            <Route path="resumes" element={<ResumeHistoryPage />} />
            <Route path="resumes/upload" element={<ResumeUploadPage />} />
            <Route path="resume/analyzer" element={<ResumeUploadPage />} />
            <Route path="history" element={<ResumeHistoryPage />} />
            <Route path="resume/history" element={<ResumeHistoryPage />} />
            <Route path="resume/:id" element={<ResumeDetailPage />} />
            <Route path="resume/:id/analysis/:analysisId" element={<AnalysisResultPage />} />

            {/* AI Mock Interview Simulator Routes (Text Mode) */}
            <Route path="mock-interview" element={<MockInterviewConfigPage />} />
            <Route path="interview" element={<MockInterviewConfigPage />} />
            <Route path="mock-interview/history" element={<MockInterviewHistoryPage />} />
            <Route path="mock-interview/:sessionId" element={<MockInterviewSessionPage />} />
            <Route path="mock-interview/:sessionId/result" element={<MockInterviewResultPage />} />

            {/* Smart Notifications Center */}
            <Route path="notifications" element={<NotificationsPage />} />

            {/* Redirects for removed legacy tools to core recruitment pages */}
            <Route path="resume/improver" element={<Navigate to="/resumes" replace />} />
            <Route path="job-optimization" element={<Navigate to="/jobs" replace />} />
            <Route path="job-optimization/*" element={<Navigate to="/jobs" replace />} />
            <Route path="skill-gap" element={<Navigate to="/dashboard" replace />} />
            <Route path="skill-gap/*" element={<Navigate to="/dashboard" replace />} />
            <Route path="resume-builder" element={<Navigate to="/resumes" replace />} />
            <Route path="resume-builder/*" element={<Navigate to="/resumes" replace />} />
            <Route path="career-chat" element={<Navigate to="/dashboard" replace />} />
            <Route path="ai-chat" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Authenticated Recruiter Control & Recruitment Routes (Protected by AdminRoute) */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="jobs" element={<AdminJobsListPage />} />
            <Route path="jobs/create" element={<AdminJobCreatePage />} />
            <Route path="jobs/:id" element={<AdminJobDetailPage />} />
            <Route path="jobs/:id/edit" element={<AdminJobEditPage />} />
            <Route path="applications" element={<AdminApplicationsListPage />} />
            <Route path="applications/:id" element={<AdminApplicationDetailPage />} />
            <Route path="candidates" element={<Navigate to="/admin/applications" replace />} />
            <Route path="analytics" element={<Navigate to="/admin" replace />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
