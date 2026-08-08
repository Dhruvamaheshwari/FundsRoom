import api from './api';
import type { Customer, PaginatedResponse } from '../types';

export const customerService = {
  getCustomers: async (params?: any): Promise<PaginatedResponse<Customer>> => {
    const res = await api.get('/customers', { params });
    return { ...res.data, data: res.data.customers || [] };
  },
  getCustomer: async (id: string): Promise<{ success: boolean; customer: Customer }> => {
    const res = await api.get(`/customers/${id}`);
    return res.data;
  },
  createCustomer: async (data: Partial<Customer>) => {
    const res = await api.post('/customers', data);
    return res.data;
  },
  updateCustomer: async (id: string, data: Partial<Customer>) => {
    const res = await api.put(`/customers/${id}`, data);
    return res.data;
  }
};
