import React, { useState } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../shared/LoadingSpinner';

const Reports: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        type: reportType,
      });
      if (res.success) setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field">
              <option value="summary">Summary</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full">
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner message="Generating report..." />}

      {report && reportType === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-3xl font-bold text-gray-900">{report.total}</p>
              <p className="text-sm text-gray-500">Total Requests</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-green-600">{report.approved}</p>
              <p className="text-sm text-gray-500">Approved</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-red-600">{report.rejected}</p>
              <p className="text-sm text-gray-500">Rejected</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-yellow-600">{report.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>

          {report.byDepartment && report.byDepartment.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">By Department</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Department</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Total</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Approved</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Rejected</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byDepartment.map((dept: any) => (
                      <tr key={dept._id} className="border-b border-gray-100">
                        <td className="py-3 px-2 font-medium">{dept._id}</td>
                        <td className="py-3 px-2">{dept.total}</td>
                        <td className="py-3 px-2 text-green-600">{dept.approved}</td>
                        <td className="py-3 px-2 text-red-600">{dept.rejected}</td>
                        <td className="py-3 px-2 text-yellow-600">{dept.pending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {report && reportType === 'detailed' && Array.isArray(report) && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Detailed Results ({report.length} requests)</h3>
          <p className="text-sm text-gray-500">Showing all matching clearance requests with full department breakdown.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Student</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Year</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Departments</th>
                </tr>
              </thead>
              <tbody>
                {report.slice(0, 50).map((req: any) => (
                  <tr key={req._id} className="border-b border-gray-100">
                    <td className="py-3 px-2">{req.student?.name || 'N/A'}</td>
                    <td className="py-3 px-2">{req.academicYear}</td>
                    <td className="py-3 px-2 capitalize">{req.overallStatus}</td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1">
                        {req.departmentClearances?.map((dc: any, i: number) => (
                          <span key={i} className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                            dc.status === 'approved' ? 'bg-green-100 text-green-700' :
                            dc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>{dc.department}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
