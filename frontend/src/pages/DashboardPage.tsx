import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/student/StudentDashboard';
import OfficerDashboard from '../components/officer/OfficerDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'officer') return <OfficerDashboard />;
  return <StudentDashboard />;
};

export default DashboardPage;
