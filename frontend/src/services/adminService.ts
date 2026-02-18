import api from './api';
import { ApiResponse, User, AuditLog, Analytics } from '../types';

export const adminService = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<ApiResponse<User[]>> {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  async updateUser(
    id: string,
    payload: { role?: string; department?: string; isActive?: boolean }
  ): Promise<ApiResponse<User>> {
    const { data } = await api.put(`/admin/users/${id}`, payload);
    return data;
  },

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },

  async getAnalytics(): Promise<ApiResponse<Analytics>> {
    const { data } = await api.get('/admin/analytics');
    return data;
  },

  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    resource?: string;
  }): Promise<ApiResponse<AuditLog[]>> {
    const { data } = await api.get('/admin/audit-logs', { params });
    return data;
  },

  async getReport(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<ApiResponse<any>> {
    const { data } = await api.get('/admin/reports', { params });
    return data;
  },
};
