import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import {
  useEffect,
} from 'react';

import LoginPage from './pages/auth/login-page';

import DashboardPage from './pages/dashboard/dashboard-page';

import ProtectedRoute from './routes/protected-route';

import PosPage from './pages/pos/pos-page';

import InventoryPage from './pages/inventory/inventory-page';

import ReportsPage from './pages/reports/reports-page';

import CustomersPage from './pages/customers/customers-page';

import LedgerPage from './pages/ledger/ledger-page';

import SalesPage from './pages/sales/sales-page';

import {
  syncOfflineSales,
} from './services/sync-offline-sales';

export default function App() {
  useEffect(() => {
    if (
      navigator.onLine
    ) {
      syncOfflineSales();
    }

    const handleOnline =
      () => {
        syncOfflineSales();
      };

    window.addEventListener(
      'online',
      handleOnline,
    );

    return () => {
      window.removeEventListener(
        'online',
        handleOnline,
      );
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <PosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ledger"
          element={
            <ProtectedRoute>
              <LedgerPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}