import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import type { StockMovement } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Search } from 'lucide-react';

export const InventoryList: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    productService.getAllStockMovements({ limit: 200 })
      .then(res => {
        // Handle slightly different backend response structures gracefully
        const data = res.data || (res as unknown as StockMovement[]);
        setMovements(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed to load stock movements:", err))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Inventory Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Track all stock movements in and out.</p>
        </div>
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
    </div>
  );
};
