import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clearanceService } from '../../services/clearanceService';
import { ClearanceRequest } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import LoadingSpinner from '../shared/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await clearanceService.getAll({ limit: 5 });
        if (res.success && res.data) setRequests(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const pending = requests.filter((r) => r.overallStatus === 'pending').length;
  const approved = requests.filter((r) => r.overallStatus === 'approved').length;
  const rejected = requests.filter((r) => r.overallStatus === 'rejected').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Here's your clearance overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 text-xl">⏳</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl">✓</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approved}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 text-xl">✗</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/clearance/new" className="btn-primary">
            New Clearance Request
          </Link>
          <Link to="/clearance" className="btn-secondary">
            View All Requests
          </Link>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Requests</h2>
          <Link to="/clearance" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all
          </Link>
        </div>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No clearance requests yet. Create your first request to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Academic Year</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Reason</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Progress</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const approvedCount = req.departmentClearances.filter((d) => d.status === 'approved').length;
                  const total = req.departmentClearances.length;
                  return (
                    <tr key={req._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <Link to={`/clearance/${req._id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                          {req.academicYear}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-gray-600 max-w-[200px] truncate">{req.reason}</td>
                      <td className="py-3 px-2"><StatusBadge status={req.overallStatus} /></td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[100px]">
                            <div
                              className="h-2 bg-green-500 rounded-full transition-all"
                              style={{ width: `${(approvedCount / total) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{approvedCount}/{total}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-500">{formatDate(req.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
