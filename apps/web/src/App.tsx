import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import LoginPage from './pages/auth/login-page';

import DashboardPage from './pages/dashboard/dashboard-page';

import ProtectedRoute from './routes/protected-route';
import PosPage from './pages/pos/pos-page';
import InventoryPage from './pages/inventory/inventory-page';
import ReportsPage from './pages/reports/reports-page';

export default function App() {
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
</Routes>

    </BrowserRouter>
  );
}