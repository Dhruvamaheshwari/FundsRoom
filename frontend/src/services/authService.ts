import api from './api';
import type { User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean; token: string; user: User; message?: string }> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Network error');
    }
  },
  verifyToken: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
