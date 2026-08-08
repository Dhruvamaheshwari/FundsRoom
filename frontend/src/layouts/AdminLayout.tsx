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
  X,
  User as UserIcon
} from 'lucide-react';
import clsx from 'clsx';

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className={clsx("fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 transition-opacity", isMobileMenuOpen ? "block" : "hidden")} onClick={() => setIsMobileMenuOpen(false)} />
      
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white shrink-0">
          <span className="text-xl font-bold text-blue-600">FundsRoom</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1",
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className={clsx("w-5 h-5 mr-3", isActive ? "text-blue-700" : "text-gray-400")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="text-gray-500 focus:outline-none lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex-1" />
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-gray-900 font-medium leading-none">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.role}</p>
                </div>
              </div>
              
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              
              <button
                onClick={logout}
                className="flex items-center text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
