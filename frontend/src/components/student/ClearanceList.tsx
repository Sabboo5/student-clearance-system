import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clearanceService } from '../../services/clearanceService';
import { ClearanceRequest } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import LoadingSpinner from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';
import { formatDate } from '../../utils/helpers';

const ClearanceList: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await clearanceService.getAll({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      if (res.success && res.data) {
        setRequests(res.data);
        setPages(res.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRequests();
  };

  const title = user?.role === 'student'
    ? 'My Clearance Requests'
    : user?.role === 'officer'
      ? 'Department Clearance Requests'
      : 'All Clearance Requests';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {user?.role === 'student' && (
          <Link to="/clearance/new" className="btn-primary">New Request</Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              placeholder="Search by academic year or reason..."
            />
            <button type="submit" className="btn-primary">Search</button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field w-auto"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : requests.length === 0 ? (
        <div className="card text-center py-8 text-gray-500">No clearance requests found</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {user?.role !== 'student' && <th className="text-left py-3 px-2 font-medium text-gray-600">Student</th>}
                <th className="text-left py-3 px-2 font-medium text-gray-600">Academic Year</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Reason</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Progress</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const approvedCount = req.departmentClearances.filter((d) => d.status === 'approved').length;
                const total = req.departmentClearances.length;
                return (
                  <tr key={req._id} className="border-b border-gray-100 hover:bg-gray-50">
                    {user?.role !== 'student' && (
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-gray-900">{req.student.name}</p>
                          <p className="text-xs text-gray-500">{req.student.studentId || req.student.email}</p>
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-2">
                      <Link to={`/clearance/${req._id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                        {req.academicYear}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-gray-600 max-w-[200px] truncate">{req.reason}</td>
                    <td className="py-3 px-2"><StatusBadge status={req.overallStatus} /></td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[80px]">
                          <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(approvedCount / total) * 100}%` }} />
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
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default ClearanceList;
