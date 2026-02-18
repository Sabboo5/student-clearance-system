import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clearanceService } from '../../services/clearanceService';
import { ClearanceRequest } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import LoadingSpinner from '../shared/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await clearanceService.getAll({ limit: 10 });
        if (res.success && res.data) setRequests(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getDeptStatus = (req: ClearanceRequest) => {
    const dc = req.departmentClearances.find((d) => d.department === user?.department);
    return dc?.status || 'pending';
  };

  const pendingReviews = requests.filter((r) => getDeptStatus(r) === 'pending').length;
  const approvedByMe = requests.filter((r) => getDeptStatus(r) === 'approved').length;
  const rejectedByMe = requests.filter((r) => getDeptStatus(r) === 'rejected').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
        <p className="text-gray-500 mt-1">{user?.department} Department</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 text-xl">⏳</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingReviews}</p>
              <p className="text-sm text-gray-500">Pending Reviews</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl">✓</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedByMe}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 text-xl">✗</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedByMe}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Pending Reviews</h2>
          <Link to="/clearance" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
        </div>
        {requests.filter((r) => getDeptStatus(r) === 'pending').length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No pending reviews. All caught up!</p>
        ) : (
          <div className="space-y-3">
            {requests
              .filter((r) => getDeptStatus(r) === 'pending')
              .slice(0, 5)
              .map((req) => (
                <Link key={req._id} to={`/clearance/${req._id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{req.student.name}</p>
                    <p className="text-sm text-gray-500">{req.student.studentId || req.student.email} - {req.academicYear}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status="pending" />
                    <span className="text-sm text-gray-400">{formatDate(req.createdAt)}</span>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
