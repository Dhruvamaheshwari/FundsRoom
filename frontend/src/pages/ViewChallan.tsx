import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { challanService } from '../services/challanService';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import type { Challan } from '../types';

export const ViewChallan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      challanService.getChallan(id)
        .then(res => {
          if (res.success && res.challan) {
            setChallan(res.challan);
          }
        })
        .catch(err => {
          setError('Failed to load challan details.');
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto p-8 animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="h-32 bg-slate-200 rounded-md"></div>
      <div className="h-64 bg-slate-200 rounded-md"></div>
    </div>
  );

  if (error || !challan) return (
    <div className="max-w-4xl mx-auto p-8 text-center text-red-600">
      {error || 'Challan not found'}
    </div>
  );

  const totalValue = challan.items?.reduce((acc, item) => acc + (item.quantity * item.unitPriceSnapshot), 0) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/challans" className="shrink-0 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Challan {challan.challanNumber}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Created on {new Date(challan.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={
            challan.status === 'CONFIRMED' ? 'success' :
            challan.status === 'DRAFT' ? 'warning' : 'default'
          } className="text-sm px-3 py-1">
            {challan.status}
          </Badge>
          <Button variant="outline" onClick={() => window.print()} className="shrink-0">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Customer Details</h3>
          {challan.customer ? (
            <div className="space-y-3">
              <div className="text-base font-medium text-slate-900">
                {challan.customer.businessName || challan.customer.name}
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">Contact: </span>
                {challan.customer.name} {challan.customer.mobile ? `(${challan.customer.mobile})` : ''}
              </div>
              {challan.customer.email && (
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Email: </span>
                  {challan.customer.email}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No customer details available.</div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Items:</span>
              <span className="font-medium text-slate-900">{challan.items?.length || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Quantity:</span>
              <span className="font-medium text-slate-900">{challan.totalQuantity} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Value:</span>
              <span className="font-medium text-slate-900">₹{totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Line Items</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challan.items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-slate-900">{item.productNameSnapshot}</TableCell>
                <TableCell className="text-slate-500">{item.skuSnapshot}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">₹{item.unitPriceSnapshot}</TableCell>
                <TableCell className="text-right font-medium text-slate-900">
                  ₹{(item.quantity * item.unitPriceSnapshot).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {(!challan.items || challan.items.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No items found in this challan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
