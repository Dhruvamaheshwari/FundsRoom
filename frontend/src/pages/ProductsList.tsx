import React, { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Plus } from 'lucide-react';

export const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    productService.getProducts({ limit: 100 }).then(res => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="h-64 bg-slate-200 rounded-md border border-slate-200"></div>
    </div>
  );

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = search === '' || 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === '' || p.category === categoryFilter;
    const matchesLowStock = !lowStockOnly || (p.currentStock <= p.minimumStock);
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage products and inventory.</p>
        </div>
        <Link to="/products/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-4 py-2 shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            placeholder="Search products..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="flex h-9 w-full sm:w-48 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button 
          variant={lowStockOnly ? "default" : "outline"}
          onClick={() => setLowStockOnly(!lowStockOnly)}
        >
          Low Stock Only
        </Button>
      </div>

      <div className="border border-slate-200 rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((p) => {
              const isLowStock = p.currentStock <= p.minimumStock;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-slate-900">{p.sku}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>₹{p.unitPrice}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={isLowStock ? 'text-red-600 font-medium' : 'text-slate-700'}>
                        {p.currentStock}
                      </span>
                      {isLowStock && <Badge variant="warning">LOW STOCK</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link 
                      to={`/products/${p.id}/edit`} 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 h-8 px-3 text-slate-500"
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
