import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearanceService } from '../../services/clearanceService';

const NewClearanceRequest: React.FC = () => {
  const navigate = useNavigate();
  const [academicYear, setAcademicYear] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await clearanceService.create({ academicYear, reason });
      if (res.success && res.data) {
        navigate(`/clearance/${res.data._id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Clearance Request</h1>
        <p className="text-gray-500 mt-1">Submit a new graduation clearance request</p>
      </div>

      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="input-field"
              placeholder="e.g., 2024/2025"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Clearance</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field min-h-[120px]"
              placeholder="e.g., Graduation clearance"
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1">{reason.length}/500</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Departments to be cleared:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              {['Library', 'Finance', 'Dormitory', 'Registrar', 'Laboratory', 'Department Head'].map((dept) => (
                <li key={dept} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {dept}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClearanceRequest;
