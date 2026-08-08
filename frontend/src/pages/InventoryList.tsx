import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import type { StockMovement } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types';

export const InventoryList: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [formState, setFormState] = useState({ productId: '', quantity: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadMovements = () => {
    setLoading(true);
    productService.getAllStockMovements({ limit: 200 })
      .then(res => {
        const data = res.data || (res as unknown as StockMovement[]);
        setMovements(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed to load stock movements:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setError('');
    setSuccessMsg('');
    setFormState({ productId: '', quantity: '', reason: '' });
    if (products.length === 0) {
      setLoadingProducts(true);
      productService.getProducts({ limit: 1000 })
        .then(res => setProducts(res.data))
        .catch(err => console.error("Failed to load products:", err))
        .finally(() => setLoadingProducts(false));
    }
  };

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!formState.productId) return setError('Please select a product');
    const qty = parseInt(formState.quantity, 10);
    if (isNaN(qty) || qty <= 0) return setError('Quantity must be a positive integer');
    if (!formState.reason.trim()) return setError('Reason is required');

    setSubmitting(true);
    try {
      await productService.createStockMovement(formState.productId, {
        quantity: qty,
        type: 'IN',
        reason: formState.reason
      });
      setSuccessMsg('Stock added successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        loadMovements(); // Refresh ledger
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add stock');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="h-64 bg-slate-200 rounded-md border border-slate-200"></div>
    </div>
  );

  const filteredMovements = movements.filter(m => {
    const productName = m.product?.name?.toLowerCase() || '';
    const productSku = m.product?.sku?.toLowerCase() || '';
    const term = search.toLowerCase();
    
    const matchesSearch = search === '' || 
      productName.includes(term) || 
      productSku.includes(term) ||
      m.reason.toLowerCase().includes(term);
      
    const matchesType = typeFilter === '' || m.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const canStockIn = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Inventory Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Track all stock movements in and out.</p>
        </div>
        {canStockIn && (
          <Button onClick={handleOpenModal} className="shrink-0 bg-slate-900 text-slate-50 hover:bg-slate-900/90">
            <Plus className="w-4 h-4 mr-2" />
            Stock In
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            placeholder="Search product, SKU or reason..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="flex h-9 w-full sm:w-36 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="IN">Stock IN</option>
          <option value="OUT">Stock OUT</option>
        </select>
      </div>

      <div className="border border-slate-200 rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="text-slate-500 whitespace-nowrap">
                  {new Date(m.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium text-slate-900">
                  {m.product?.name || 'Unknown Product'}
                </TableCell>
                <TableCell>{m.product?.sku}</TableCell>
                <TableCell>
                  <Badge variant={m.type === 'IN' ? 'success' : 'danger'} className="font-medium px-2 py-0.5">
                    {m.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  <span className={m.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}>
                    {m.type === 'IN' ? '+' : '-'}{m.quantity}
                  </span>
                </TableCell>
                <TableCell className="text-slate-600 truncate max-w-[200px]" title={m.reason}>
                  {m.reason}
                </TableCell>
                <TableCell className="text-slate-500">
                  {m.user?.name || 'System'}
                </TableCell>
              </TableRow>
            ))}
            {filteredMovements.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No stock movements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Stock</h2>
            </div>
            <form onSubmit={handleStockInSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>}
              {successMsg && <div className="p-3 text-sm text-emerald-600 bg-emerald-50 rounded-md border border-emerald-200">{successMsg}</div>}
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Product *</label>
                <select
                  required
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
                  value={formState.productId}
                  onChange={e => setFormState({ ...formState, productId: e.target.value })}
                  disabled={loadingProducts || submitting}
                >
                  <option value="" disabled>{loadingProducts ? 'Loading products...' : 'Select Product'}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Quantity *</label>
                <Input
                  type="number"
                  min="1"
                  required
                  placeholder="Enter quantity"
                  value={formState.quantity}
                  onChange={e => setFormState({ ...formState, quantity: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Reason *</label>
                <Input
                  type="text"
                  required
                  placeholder="New Purchase / Restock / Other"
                  value={formState.reason}
                  onChange={e => setFormState({ ...formState, reason: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !!successMsg}>
                  {submitting ? 'Saving...' : 'Add Stock'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
