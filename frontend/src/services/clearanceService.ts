import api from './api';
import { ApiResponse, ClearanceRequest } from '../types';

export const clearanceService = {
  async create(payload: { academicYear: string; reason: string }): Promise<ApiResponse<ClearanceRequest>> {
    const { data } = await api.post('/clearance', payload);
    return data;
  },

  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<ClearanceRequest[]>> {
    const { data } = await api.get('/clearance', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<ClearanceRequest>> {
    const { data } = await api.get(`/clearance/${id}`);
    return data;
  },

  async review(
    id: string,
    payload: { status: 'approved' | 'rejected'; comment?: string }
  ): Promise<ApiResponse<ClearanceRequest>> {
    const { data } = await api.put(`/clearance/${id}/review`, payload);
    return data;
  },

  async uploadDocument(id: string, file: File, department: string): Promise<ApiResponse<{ filename: string }>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('department', department);
    const { data } = await api.post(`/clearance/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
