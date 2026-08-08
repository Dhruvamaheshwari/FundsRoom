import React, { useEffect, useState } from 'react';
import { challanService } from '../services/challanService';
import type { Challan } from '../types';
import { Link } from 'react-router-dom';
import { FilePlus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export const ChallansList: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    fetchChallans();
  }, []);
  
  const fetchChallans = async () => {
    try {
      const data = await challanService.getChallans({ limit: 50 });
      setChallans(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (id: string) => {
    if (!window.confirm("Confirm this challan? Stock will be reduced.")) return;
    try {
      await challanService.confirmChallan(id);
      fetchChallans();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to confirm');
    }
  };

  const cancel = async (id: string) => {
    if (!window.confirm("Cancel this draft?")) return;
    try {
      await challanService.cancelChallan(id);
      fetchChallans();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to cancel');
    }
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales Challans</h1>
        {canEdit && (
          <Link to="/challans/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <FilePlus className="w-5 h-5 mr-2" />
            New Challan
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : challans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No challans found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {challans.map((challan) => (
                  <tr key={challan.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{challan.challanNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{challan.customer?.businessName || challan.customer?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{challan.totalQuantity} units</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        challan.status === 'CONFIRMED' ? "bg-green-100 text-green-800" :
                        challan.status === 'DRAFT' ? "bg-amber-100 text-amber-800" :
                        "bg-gray-100 text-gray-800"
                      )}>
                        {challan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(challan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      {canEdit && challan.status === 'DRAFT' && (
                        <>
                          <button onClick={() => confirm(challan.id)} className="text-green-600 hover:text-green-900">Confirm</button>
                          <button onClick={() => cancel(challan.id)} className="text-red-600 hover:text-red-900">Cancel</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
