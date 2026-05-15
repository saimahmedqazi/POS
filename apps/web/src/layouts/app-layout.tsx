import type {
  ReactNode,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  BookOpen,
  
  Receipt,
  LogOut,
} from 'lucide-react';

import {
  useAuthStore,
} from '../store/auth.store';

import SyncStatus from '../components/sync-status';

type Props = {
  children: ReactNode;
};

export default function AppLayout({
  children,
}: Props) {
  const navigate =
    useNavigate();

  const logout =
    useAuthStore(
      (state) =>
        state.logout,
    );

  const handleLogout =
    async () => {
      await logout();

      navigate(
        '/login',
      );
    };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white p-5 flex flex-col">
        <div>
          <h1 className="text-2xl font-bold mb-8">
            POS ERP
          </h1>

          <nav className="space-y-3">
            <Link
              to="/"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-800 transition"
            >
              <LayoutDashboard
                size={18}
              />
              Dashboard
            </Link>

            <Link
              to="/pos"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-800 transition"
            >
              <ShoppingCart
                size={18}
              />
              POS
            </Link>

            <Link
              to="/sales"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-800 transition"
            >
              <Receipt
                size={18}
              />
              Sales
            </Link>

            <Link
              to="/inventory"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-800 transition"
            >
              <Package
                size={18}
              />
              Inventory
            </Link>

            

            <Link
              to="/reports"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-800 transition"
            >
              <BarChart3
                size={18}
              />
              Reports
            </Link>

            <Link
              to="/ledger"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-800 transition"
            >
              <BookOpen
                size={18}
              />
              Ledger
            </Link>

            <Link
              to="/customers"
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-800 transition"
            >
              <Users
                size={18}
              />
              Customers
            </Link>
          </nav>
        </div>

        <button
          onClick={
            handleLogout
          }
          className="mt-auto flex items-center gap-2 p-3 rounded-xl bg-red-500 hover:bg-red-600 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

     <main className="flex-1 bg-slate-100 min-h-screen">
  <div className="flex justify-end px-6 pt-4">
    <SyncStatus />
  </div>

  <div className="p-6">
    {children}
  </div>
</main>
    </div>
  );
}