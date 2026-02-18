import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Analytics } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import LoadingSpinner from '../shared/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getAnalytics();
        if (res.success && res.data) setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!analytics) return <div className="card text-center py-8 text-gray-500">Failed to load analytics</div>;

  const { overview, departmentStats, recentRequests } = analytics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and analytics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalStudents}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Officers</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalOfficers}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalRequests}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full" />
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{overview.pendingRequests}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full" />
            <p className="text-sm text-gray-500">Approved</p>
          </div>
          <p className="text-3xl font-bold text-green-600 mt-1">{overview.approvedRequests}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full" />
            <p className="text-sm text-gray-500">Rejected</p>
          </div>
          <p className="text-3xl font-bold text-red-600 mt-1">{overview.rejectedRequests}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Stats */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Department Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(departmentStats).map(([dept, stats]) => {
              const total = (stats.pending || 0) + (stats.approved || 0) + (stats.rejected || 0);
              const approvedPct = total > 0 ? ((stats.approved || 0) / total) * 100 : 0;
              return (
                <div key={dept} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">{dept}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="text-yellow-600">{stats.pending || 0} pending</span>
                      <span className="text-green-600">{stats.approved || 0} approved</span>
                      <span className="text-red-600">{stats.rejected || 0} rejected</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: `${approvedPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Requests</h2>
            <Link to="/clearance" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <Link key={req._id} to={`/clearance/${req._id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{req.student?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{req.academicYear}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.overallStatus} />
                  <span className="text-xs text-gray-400">{formatDate(req.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/users" className="btn-primary">Manage Users</Link>
          <Link to="/admin/audit-logs" className="btn-secondary">View Audit Logs</Link>
          <Link to="/admin/reports" className="btn-secondary">Generate Reports</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
