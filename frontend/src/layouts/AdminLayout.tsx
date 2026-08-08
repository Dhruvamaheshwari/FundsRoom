import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Archive, 
  FileText, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Products', href: '/products', icon: Package, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Inventory', href: '/inventory', icon: Archive, roles: ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'] },
    { name: 'Challans', href: '/challans', icon: FileText, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 lg:hidden bg-slate-900/50 backdrop-blur-sm transition-opacity", 
          isMobileMenuOpen ? "opacity-100 block" : "opacity-0 hidden"
        )} 
        onClick={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-14 px-5 border-b border-slate-200 bg-white shrink-0">
          <span className="text-base font-semibold text-slate-900 tracking-tight">FundsRoom</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto flex-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className={cn("w-4 h-4 mr-3 shrink-0", isActive ? "text-slate-900" : "text-slate-400")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shrink-0">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                className="text-slate-500 hover:text-slate-900 focus:outline-none lg:hidden mr-4"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Optional Breadcrumb/Context here */}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="hidden sm:block text-right">
                  <p className="text-slate-900 font-medium leading-none">{user?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{user?.role}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-medium shrink-0 border border-slate-200">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="h-5 w-px bg-slate-200 mx-2"></div>
              
              <button
                onClick={logout}
                className="flex items-center text-slate-500 hover:text-slate-900 transition-colors p-1.5 rounded-md hover:bg-slate-100"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
