import {
  HashRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import AdminRoute from './components/auth/admin-route';

import AdminDashboardPage from './pages/admin/admin-dashboard-page';
import AdminLoginPage from './pages/admin/admin-login-page';
import LicensesPage from './pages/license/licenses-page';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <AdminLoginPage />
          }
        />

        <Route
          path="/"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        <Route
          path="/licenses"
          element={
            <AdminRoute>
              <LicensesPage />
            </AdminRoute>
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
    </HashRouter>
  );
}