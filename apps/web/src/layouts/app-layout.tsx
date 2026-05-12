import type {
  ReactNode,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
} from 'lucide-react';

type Props = {
  children: ReactNode;
};

export default function AppLayout({
  children,
}: Props) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-900 text-white p-5">
        <h1 className="text-2xl font-bold mb-8">
          POS ERP
        </h1>

        <nav className="space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-800"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            to="/pos"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-800"
          >
            <ShoppingCart size={18} />
            POS
          </Link>

          <Link
            to="/inventory"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-800"
          >
            <Package size={18} />
            Inventory
          </Link>

          <Link
            to="/reports"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-800"
          >
            <BarChart3 size={18} />
            Reports
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}