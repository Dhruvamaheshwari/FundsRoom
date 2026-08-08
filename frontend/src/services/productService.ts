import api from './api';
import type { Product, StockMovement, PaginatedResponse } from '../types';

export const productService = {
  getProducts: async (params?: any): Promise<PaginatedResponse<Product>> => {
    const res = await api.get('/products', { params });
    return { ...res.data, data: res.data.products || [] };
  },
  getProduct: async (id: string): Promise<{ success: boolean; product: Product }> => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  createProduct: async (data: Partial<Product>) => {
    const res = await api.post('/products', data);
    return res.data;
  },
  updateProduct: async (id: string, data: Partial<Product>) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },
  createStockMovement: async (id: string, data: any) => {
    const res = await api.post(`/products/${id}/stock-movements`, data);
    return res.data;
  },
  getAllStockMovements: async (params?: any): Promise<PaginatedResponse<StockMovement>> => {
    const res = await api.get('/stock-movements', { params });
    return { ...res.data, data: res.data.movements || [] };
  }
};
