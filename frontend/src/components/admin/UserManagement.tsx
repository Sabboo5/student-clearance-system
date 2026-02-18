import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { User } from '../../types';
import LoadingSpinner from '../shared/LoadingSpinner';
import Pagination from '../shared/Pagination';
import { formatDate } from '../../utils/helpers';

const DEPARTMENTS = ['Library', 'Finance', 'Dormitory', 'Registrar', 'Laboratory', 'Department Head'];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ role: '', department: '', isActive: true });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        page,
        limit: 15,
        role: roleFilter || undefined,
        search: search || undefined,
      });
      if (res.success && res.data) {
        setUsers(res.data);
        setPages(res.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ role: user.role, department: user.department || '', isActive: user.isActive });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      await adminService.updateUser(editingUser._id, editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-field" placeholder="Search users..." />
            <button type="submit" className="btn-primary">Search</button>
          </form>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="input-field w-auto">
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="officer">Officers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Role</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Department</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Joined</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{u.name}</td>
                  <td className="py-3 px-2 text-gray-600">{u.email}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'officer' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{u.role}</span>
                  </td>
                  <td className="py-3 px-2 text-gray-600">{u.department || '-'}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(u)} className="text-xs px-2 py-1 text-primary-600 hover:bg-primary-50 rounded">Edit</button>
                      <button onClick={() => handleDelete(u._id)} className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User: {editingUser.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="input-field">
                  <option value="student">Student</option>
                  <option value="officer">Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {editForm.role === 'officer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className="input-field">
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="btn-primary">Save Changes</button>
              <button onClick={() => setEditingUser(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
