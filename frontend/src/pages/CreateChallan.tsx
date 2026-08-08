import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import type { Customer, Product } from '../types';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

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

  if (loading) return (
    <div className="animate-pulse space-y-4 max-w-4xl mx-auto">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="h-64 bg-slate-200 rounded-md border border-slate-200"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/challans" className="shrink-0 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Create Draft Challan</h1>
          <p className="text-sm text-slate-500 mt-1">Draft a new outbound delivery.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-md p-6 space-y-4">
          <h2 className="text-lg font-medium text-slate-900 pb-2 border-b border-slate-100">General Information</h2>
          
          <div className="max-w-md space-y-2">
            <label className="block text-sm font-medium text-slate-700">Customer</label>
            <select
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
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
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-lg font-medium text-slate-900">Products</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Item
            </Button>
          </div>
          
          <div className="space-y-4 pt-2">
            {items.map((item, index) => {
              const selectedProduct = products.find(p => p.id === item.productId);
              return (
                <div key={index} className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Product</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
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
                  <div className="w-full sm:w-32 space-y-2">
                    <label className="block text-sm font-medium text-slate-700 whitespace-nowrap">
                      Qty (Max: {selectedProduct?.currentStock || 0})
                    </label>
                    <Input
                      type="number"
                      min="1"
                      className="bg-white"
                      value={item.quantity}
                      onChange={(e) => handleChangeItem(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="shrink-0"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Link to="/challans" className="text-sm font-medium hover:bg-slate-100 px-4 py-2 rounded-md transition-colors">
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save as Draft'}
          </Button>
        </div>
      </form>
    </div>
  );
};
