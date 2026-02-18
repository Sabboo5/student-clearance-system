import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { clearanceService } from '../../services/clearanceService';
import { ClearanceRequest } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import LoadingSpinner from '../shared/LoadingSpinner';
import { formatDateTime } from '../../utils/helpers';

const ClearanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [clearance, setClearance] = useState<ClearanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ status: 'approved' as 'approved' | 'rejected', comment: '' });
  const [reviewing, setReviewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDept, setUploadDept] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await clearanceService.getById(id!);
        if (res.success && res.data) setClearance(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleReview = async () => {
    if (!id) return;
    setReviewing(true);
    try {
      const res = await clearanceService.review(id, reviewForm);
      if (res.success && res.data) setClearance(res.data);
      setReviewForm({ status: 'approved', comment: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id || !uploadDept) return;
    setUploading(true);
    try {
      await clearanceService.uploadDocument(id, file, uploadDept);
      const res = await clearanceService.getById(id);
      if (res.success && res.data) setClearance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      setUploadDept('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!clearance) return <div className="card text-center py-8 text-gray-500">Clearance request not found</div>;

  const approvedCount = clearance.departmentClearances.filter((d) => d.status === 'approved').length;
  const total = clearance.departmentClearances.length;
  const myDeptClearance = user?.role === 'officer'
    ? clearance.departmentClearances.find((d) => d.department === user.department)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/clearance" className="hover:text-primary-600">Requests</Link>
        <span>/</span>
        <span className="text-gray-900">{clearance.academicYear}</span>
      </div>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Clearance Request</h1>
            <p className="text-gray-500 mt-1">{clearance.reason}</p>
          </div>
          <StatusBadge status={clearance.overallStatus} size="md" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500">Student</p>
            <p className="text-sm font-medium">{clearance.student.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Student ID</p>
            <p className="text-sm font-medium">{clearance.student.studentId || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Academic Year</p>
            <p className="text-sm font-medium">{clearance.academicYear}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Progress</p>
            <p className="text-sm font-medium">{approvedCount}/{total} Departments</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full transition-all"
              style={{ width: `${(approvedCount / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Department Clearances */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Department Clearances</h2>
        <div className="space-y-3">
          {clearance.departmentClearances.map((dc) => (
            <div key={dc._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{dc.department}</p>
                  <StatusBadge status={dc.status} />
                </div>
                {dc.comment && <p className="text-sm text-gray-600 mt-1">{dc.comment}</p>}
                {dc.officer && (
                  <p className="text-xs text-gray-400 mt-1">
                    Reviewed by {(dc.officer as any).name || 'Officer'}{dc.reviewedAt ? ` on ${formatDateTime(dc.reviewedAt)}` : ''}
                  </p>
                )}
                {dc.documents && dc.documents.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dc.documents.map((doc, i) => (
                      <a key={i} href={`/uploads/${doc}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline bg-primary-50 px-2 py-0.5 rounded">
                        Document {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload button for students */}
              {user?.role === 'student' && dc.status === 'pending' && (
                <div>
                  <button
                    onClick={() => {
                      setUploadDept(dc.department);
                      fileInputRef.current?.click();
                    }}
                    disabled={uploading}
                    className="text-xs btn-secondary"
                  >
                    {uploading && uploadDept === dc.department ? 'Uploading...' : 'Upload Doc'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleUpload} />
      </div>

      {/* Officer Review Form */}
      {user?.role === 'officer' && myDeptClearance && myDeptClearance.status === 'pending' && (
        <div className="card border-primary-200 bg-primary-50/30">
          <h2 className="font-semibold text-gray-900 mb-4">Review - {user.department}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
              <select
                value={reviewForm.status}
                onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value as 'approved' | 'rejected' })}
                className="input-field"
              >
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="input-field min-h-[80px]"
                placeholder="Add a comment (optional)"
              />
            </div>
            <button onClick={handleReview} disabled={reviewing} className={reviewForm.status === 'approved' ? 'btn-success' : 'btn-danger'}>
              {reviewing ? 'Submitting...' : reviewForm.status === 'approved' ? 'Approve Clearance' : 'Reject Clearance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClearanceDetail;
