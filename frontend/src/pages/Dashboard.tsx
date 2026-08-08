import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';

interface DashboardStats {
  customers: number;
  products: number;
  lowStock: number;
  challans: number;
  confirmedChallans: number;
  draftChallans: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Note: In a real production app, a dedicated dashboard endpoint is better.
        // Here we make parallel calls to existing list endpoints using limit=1 to just get the total count.
        const [
          customersRes,
          productsRes,
          lowStockRes,
          challansRes,
          confirmedRes,
          draftRes
        ] = await Promise.all([
          api.get('/customers?limit=1').catch(() => ({ data: { total: 0 } })),
          api.get('/products?limit=1').catch(() => ({ data: { total: 0 } })),
          api.get('/products?limit=1&lowStock=true').catch(() => ({ data: { total: 0 } })),
          api.get('/challans?limit=1').catch(() => ({ data: { total: 0 } })),
          api.get('/challans?limit=1&status=CONFIRMED').catch(() => ({ data: { total: 0 } })),
          api.get('/challans?limit=1&status=DRAFT').catch(() => ({ data: { total: 0 } })),
        ]);

        setStats({
          customers: customersRes.data.total || 0,
          products: productsRes.data.total || 0,
          lowStock: lowStockRes.data.total || 0,
          challans: challansRes.data.total || 0,
          confirmedChallans: confirmedRes.data.total || 0,
          draftChallans: draftRes.data.total || 0,
        });
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
      <div className="h-24 bg-slate-200 rounded-md border border-slate-200"></div>
    </div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm font-medium">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your operations.</p>
      </div>
      
      <div className="border border-slate-200 rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium text-slate-900">Total Customers</TableCell>
              <TableCell className="text-right text-slate-600">{stats?.customers}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-slate-900">Total Products</TableCell>
              <TableCell className="text-right text-slate-600">{stats?.products}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-slate-900 flex items-center gap-2">
                Low Stock Alerts
                {stats && stats.lowStock > 0 && <Badge variant="warning">Action Needed</Badge>}
              </TableCell>
              <TableCell className="text-right text-slate-600">{stats?.lowStock}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-slate-900">Total Challans</TableCell>
              <TableCell className="text-right text-slate-600">{stats?.challans}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-slate-900">Confirmed Challans</TableCell>
              <TableCell className="text-right text-slate-600">{stats?.confirmedChallans}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-slate-900">Draft Challans</TableCell>
              <TableCell className="text-right text-slate-600">{stats?.draftChallans}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;
