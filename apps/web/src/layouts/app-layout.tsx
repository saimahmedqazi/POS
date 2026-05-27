import type {
  ReactNode,
} from 'react';

import {
  Link,
  useLocation,
} from 'react-router-dom';

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  Receipt,
  LogOut,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';

import {
  useAuth,
} from '../context/auth-context';

type Props = {
  children: ReactNode;
};

const navigation = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },

  {
    name: 'POS',
    path: '/pos',
    icon: ShoppingCart,
  },

  {
    name: 'Orders',
    path: '/orders',
    icon: ClipboardList,
  },

  {
    name: 'Sales',
    path: '/sales',
    icon: Receipt,
  },

  {
    name: 'Inventory',
    path: '/inventory',
    icon: Package,
  },

  {
    name: 'Customers',
    path: '/customers',
    icon: Users,
  },

  {
    name: 'Ledger',
    path: '/ledger',
    icon: BookOpen,
  },

  {
    name: 'Reports',
    path: '/reports',
    icon: BarChart3,
  },

  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

export default function AppLayout({
  children,
}: Props) {
  const location =
    useLocation();

  const {
    currentUser,
    logout,
  } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg">
              <ShieldCheck
                size={22}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold leading-none">
                POS ERP
              </h1>

              <p className="text-slate-400 text-sm mt-1">
                Offline First
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map(
            (
              item,
            ) => {
              const Icon =
                item.icon;

              const active =
                location.pathname ===
                item.path;

              return (
                <Link
                  key={
                    item.path
                  }
                  to={
                    item.path
                  }
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    active
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <Icon
                    size={18}
                  />

                  <span className="font-medium">
                    {
                      item.name
                    }
                  </span>
                </Link>
              );
            },
          )}
        </nav>

        {/* USER + LOGOUT */}
        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-2">
            <div className="font-semibold text-sm">
              {currentUser?.name}
            </div>

            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">
              {currentUser?.role}
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500 hover:bg-red-600 transition text-white font-medium"
          >
            <LogOut
              size={18}
            />

            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}