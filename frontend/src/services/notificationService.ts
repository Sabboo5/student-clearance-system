import api from './api';
import { ApiResponse, Notification } from '../types';

export const notificationService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Notification[]>> {
    const { data } = await api.get('/notifications', { params });
    return data;
  },

  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  async markAllAsRead(): Promise<ApiResponse<null>> {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },
};
