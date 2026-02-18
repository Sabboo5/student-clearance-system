import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClearanceList from './components/student/ClearanceList';
import ClearanceDetail from './components/student/ClearanceDetail';
import NewClearanceRequest from './components/student/NewClearanceRequest';
import NotificationsPage from './pages/NotificationsPage';
import UserManagement from './components/admin/UserManagement';
import AuditLogs from './components/admin/AuditLogs';
import Reports from './components/admin/Reports';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clearance" element={<ClearanceList />} />
            <Route path="/clearance/new" element={<NewClearanceRequest />} />
            <Route path="/clearance/:id" element={<ClearanceDetail />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Admin routes */}
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/reports" element={<Reports />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
