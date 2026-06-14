import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import DashboardPage from './pages/dashboard/dashboard-page';
import PosPage from './pages/pos/pos-page';
import InventoryPage from './pages/inventory/inventory-page';
import ReportsPage from './pages/reports/reports-page';
import CustomersPage from './pages/customers/customers-page';
import LedgerPage from './pages/ledger/ledger-page';
import SalesPage from './pages/sales/sales-page';
import LocalLoginPage from './pages/auth/local-login-page';
import SettingsPage from './pages/settings/settings-page';
import OrdersPage from './pages/orders/orders-page';

import ProtectedRoute from './components/auth/protected-route';
import ErrorBoundary from './components/error-boundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/login"
          element={
            <LocalLoginPage />
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
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
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

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}