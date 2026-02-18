import api from './api';
import { ApiResponse, User } from '../types';

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    studentId?: string;
    department?: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  async getMe(): Promise<ApiResponse<never> & { user: User }> {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
