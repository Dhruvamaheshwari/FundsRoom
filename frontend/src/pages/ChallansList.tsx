import React, { useEffect, useState } from 'react';
import { challanService } from '../services/challanService';
import type { Challan } from '../types';
import { Link } from 'react-router-dom';
import { FilePlus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ChallansList: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
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

  const filteredChallans = challans.filter(c => {
    const custName = c.customer?.name?.toLowerCase() || '';
    const custBusiness = c.customer?.businessName?.toLowerCase() || '';
    const term = search.toLowerCase();
    
    const matchesSearch = search === '' || 
      c.challanNumber.toLowerCase().includes(term) || 
      custName.includes(term) || 
      custBusiness.includes(term);
      
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Sales Challans</h1>
          <p className="text-sm text-slate-500 mt-1">Manage outbound stock transfers.</p>
        </div>
        {canEdit && (
          <Link to="/challans/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-9 px-4 py-2 shrink-0">
            <FilePlus className="w-4 h-4 mr-2" />
            New Challan
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            placeholder="Search challan..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="flex h-9 w-full sm:w-36 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="border border-slate-200 rounded-md bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  <div className="animate-pulse space-y-4 max-w-sm mx-auto">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredChallans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                  No challans found.
                </TableCell>
              </TableRow>
            ) : (
              filteredChallans.map((challan) => (
                <TableRow key={challan.id}>
                  <TableCell className="font-medium text-slate-900">{challan.challanNumber}</TableCell>
                  <TableCell>{challan.customer?.businessName || challan.customer?.name}</TableCell>
                  <TableCell>{challan.totalQuantity} units</TableCell>
                  <TableCell>
                    <Badge variant={
                      challan.status === 'CONFIRMED' ? 'success' :
                      challan.status === 'DRAFT' ? 'warning' : 'default'
                    }>
                      {challan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(challan.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-medium space-x-2">
                    {canEdit && challan.status === 'DRAFT' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => confirm(challan.id)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">Confirm</Button>
                        <Button variant="ghost" size="sm" onClick={() => cancel(challan.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">Cancel</Button>
                      </>
                    )}
                    <Link 
                      to={`/challans/${challan.id}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 hover:text-slate-900 h-8 px-3 text-slate-500"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
