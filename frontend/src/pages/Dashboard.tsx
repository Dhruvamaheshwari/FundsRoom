import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Package, AlertTriangle, FileText, CheckCircle, FileEdit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  customers: number;
  products: number;
  lowStock: number;
  challans: number;
  confirmedChallans: number;
  draftChallans: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
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
    return <div className="animate-pulse flex flex-col space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}
      </div>
    </div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>;
  }

  const statCards = [
    { name: 'Total Customers', stat: stats?.customers, icon: Users, color: 'bg-blue-500' },
    { name: 'Total Products', stat: stats?.products, icon: Package, color: 'bg-indigo-500' },
    { name: 'Low Stock Alerts', stat: stats?.lowStock, icon: AlertTriangle, color: 'bg-red-500' },
    { name: 'Total Challans', stat: stats?.challans, icon: FileText, color: 'bg-purple-500' },
    { name: 'Confirmed Challans', stat: stats?.confirmedChallans, icon: CheckCircle, color: 'bg-green-500' },
    { name: 'Draft Challans', stat: stats?.draftChallans, icon: FileEdit, color: 'bg-amber-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user?.name}</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 flex items-center p-6 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${item.color} text-white mr-4`}>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{item.stat}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
