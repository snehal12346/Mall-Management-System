import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Memberships from './pages/Memberships';
import Shops from './pages/Shops';
import Tenants from './pages/Tenants';
import NotImplemented from './pages/NotImplemented';

// Sidebar entries that have no page yet (placeholders only, no data shown).
const PENDING_PATHS = [
  'reports',
  'leases',
  'products',
  'purchases',
  'payments',
  'offers',
  'events',
  'event-registrations',
  'vehicles',
  'parking',
  'employees',
  'complaints',
  'maintenance',
];

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicOnlyRoute>
          <Login />
        </PublicOnlyRoute>
      }
    />
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/memberships" element={<Memberships />} />
      <Route path="/shops" element={<Shops />} />
      <Route path="/tenants" element={<Tenants />} />
      {PENDING_PATHS.map((p) => (
        <Route key={p} path={`/${p}`} element={<NotImplemented />} />
      ))}
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
