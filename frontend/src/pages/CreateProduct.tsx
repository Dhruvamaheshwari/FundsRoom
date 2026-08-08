import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { Product } from '../types';

export const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 0,
    warehouseLocation: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await productService.createProduct(formData);
      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/products" className="shrink-0 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Add Product</h1>
          <p className="text-sm text-slate-500 mt-1">Create a new product for the inventory.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-md p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Product Name</label>
            <Input
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Steel Pipe 20mm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">SKU</label>
            <Input
              name="sku"
              required
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g. SP-20MM"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <Input
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Pipes"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Unit Price (₹)</label>
            <Input
              type="number"
              name="unitPrice"
              required
              min="0"
              step="0.01"
              value={formData.unitPrice || ''}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Initial Stock</label>
            <Input
              type="number"
              name="currentStock"
              required
              min="0"
              value={formData.currentStock || ''}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Minimum Stock Alert</label>
            <Input
              type="number"
              name="minimumStock"
              required
              min="0"
              value={formData.minimumStock || ''}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Warehouse Location</label>
          <Input
            name="warehouseLocation"
            required
            value={formData.warehouseLocation}
            onChange={handleChange}
            placeholder="e.g. Aisle 4, Rack B"
          />
        </div>
        
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
          <Link to="/products" className="text-sm font-medium hover:bg-slate-100 px-4 py-2 rounded-md transition-colors">
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};
