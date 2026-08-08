import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import type { Customer, Product } from '../types';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CreateChallan: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customerService.getCustomers({ limit: 100 }),
          productService.getProducts({ limit: 200 })
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index: number, field: 'productId' | 'quantity', value: string) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index].quantity = parseInt(value) || 0;
    } else {
      newItems[index].productId = value;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    if (items.some(i => !i.productId || i.quantity <= 0)) {
      setError('Please ensure all items have a valid product and positive quantity');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await challanService.createChallan({ customerId, items });
      navigate('/challans');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save challan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/challans" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Draft Challan</h1>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
          <select
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">Select a customer...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.businessName || c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Products</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center text-sm text-blue-600 hover:text-blue-900 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => {
              const selectedProduct = products.find(p => p.id === item.productId);
              return (
                <div key={index} className="flex items-end space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      value={item.productId}
                      onChange={(e) => handleChangeItem(index, 'productId', e.target.value)}
                      required
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qty (Max: {selectedProduct?.currentStock || 0})</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                      value={item.quantity}
                      onChange={(e) => handleChangeItem(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-5 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
};
