import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { Customer } from '../types';

export const EditCustomer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    businessName: '',
    mobile: '',
    email: '',
    gstNumber: '',
    customerType: 'RETAIL',
    address: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (id) {
      customerService.getCustomer(id)
        .then(res => {
          if (res.success && res.customer) {
            setFormData(res.customer);
          }
        })
        .catch(err => {
          setError('Failed to load customer details.');
          console.error(err);
        })
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const payload = { ...formData };
      // Backend validation (Zod) rejects `null` for `.optional()` fields. 
      // Prisma returns `null`, so we must strip them or convert to undefined.
      (Object.keys(payload) as Array<keyof Partial<Customer>>).forEach(key => {
        if (payload[key] === null) {
          delete payload[key];
        }
      });

      await customerService.updateCustomer(id, payload);
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update customer');
      if (err.response?.data?.errors) {
        console.error('Validation errors:', err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="max-w-2xl mx-auto p-8 animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="h-64 bg-slate-200 rounded-md"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/customers" className="shrink-0 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Edit Customer</h1>
          <p className="text-sm text-slate-500 mt-1">Update customer details.</p>
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
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <Input
              name="name"
              required
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Contact Person Name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Business Name</label>
            <Input
              name="businessName"
              required
              value={formData.businessName || ''}
              onChange={handleChange}
              placeholder="Company Name"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Mobile</label>
            <Input
              name="mobile"
              required
              value={formData.mobile || ''}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="Email Address"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">GST Number</label>
            <Input
              name="gstNumber"
              value={formData.gstNumber || ''}
              onChange={handleChange}
              placeholder="GSTIN"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Customer Type</label>
            <select
              name="customerType"
              value={formData.customerType}
              onChange={handleChange}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
            >
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Address</label>
          <textarea
            name="address"
            required
            rows={3}
            value={formData.address || ''}
            onChange={handleChange}
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
            placeholder="Full billing address"
          />
        </div>
        
        <div className="space-y-2 max-w-sm">
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          >
            <option value="ACTIVE">Active</option>
            <option value="LEAD">Lead</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
          <Link to="/customers" className="text-sm font-medium hover:bg-slate-100 px-4 py-2 rounded-md transition-colors">
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Update Customer'}
          </Button>
        </div>
      </form>
    </div>
  );
};
