// import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import Login from './pages/Login';

import { Dashboard } from './pages/Dashboard';
import { ChallansList } from './pages/ChallansList';
import { CreateChallan } from './pages/CreateChallan';
import { ViewChallan } from './pages/ViewChallan';
import { CustomersList } from './pages/CustomersList';
import { CreateCustomer } from './pages/CreateCustomer';
import { EditCustomer } from './pages/EditCustomer';
import { ProductsList } from './pages/ProductsList';
import { CreateProduct } from './pages/CreateProduct';
import { EditProduct } from './pages/EditProduct';
import { InventoryList } from './pages/InventoryList';
import { Unauthorized } from './pages/Unauthorized';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}>
                <Route path="/customers" element={<CustomersList />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
                <Route path="/customers/new" element={<CreateCustomer />} />
                <Route path="/customers/:id/edit" element={<EditCustomer />} />
              </Route>

              <Route path="/products" element={<ProductsList />} />
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}>
                <Route path="/products/new" element={<CreateProduct />} />
                <Route path="/products/:id/edit" element={<EditProduct />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']} />}>
                <Route path="/inventory" element={<InventoryList />} />
              </Route>
              
              <Route path="/challans" element={<ChallansList />} />
              <Route path="/challans/:id" element={<ViewChallan />} />
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
                <Route path="/challans/new" element={<CreateChallan />} />
              </Route>
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
