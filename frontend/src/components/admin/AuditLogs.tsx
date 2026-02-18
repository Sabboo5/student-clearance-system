import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { AuditLog } from '../../types';
import LoadingSpinner from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';
import { formatDateTime } from '../../utils/helpers';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await adminService.getAuditLogs({ page, limit: 20 });
        if (res.success && res.data) {
          setLogs(res.data);
          setPages(res.pagination?.pages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  const actionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-700';
      case 'UPDATE': case 'REVIEW': return 'bg-blue-100 text-blue-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Timestamp</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">User</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Action</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Resource</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 text-gray-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="py-3 px-2">
                    <p className="font-medium text-gray-900">{log.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{log.user?.email}</p>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${actionColor(log.action)}`}>{log.action}</span>
                  </td>
                  <td className="py-3 px-2 text-gray-600">{log.resource}</td>
                  <td className="py-3 px-2 text-gray-600 max-w-[300px] truncate">{log.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
