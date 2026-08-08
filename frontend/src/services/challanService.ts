import api from './api';
import type { Challan, PaginatedResponse } from '../types';

export const challanService = {
  getChallans: async (params?: any): Promise<PaginatedResponse<Challan>> => {
    const res = await api.get('/challans', { params });
    return { ...res.data, data: res.data.challans || [] };
  },
  getChallan: async (id: string): Promise<{ success: boolean; challan: Challan }> => {
    const res = await api.get(`/challans/${id}`);
    return res.data;
  },
  createChallan: async (data: any) => {
    const res = await api.post('/challans', data);
    return res.data;
  },
  confirmChallan: async (id: string) => {
    const res = await api.post(`/challans/${id}/confirm`);
    return res.data;
  },
  cancelChallan: async (id: string) => {
    const res = await api.post(`/challans/${id}/cancel`);
    return res.data;
  }
};
