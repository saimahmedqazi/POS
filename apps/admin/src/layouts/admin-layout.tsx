import type {
  ReactNode,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  ShieldCheck,
  KeyRound,
  BarChart3,
  LogOut,
} from 'lucide-react';

import {
  adminLogout,
} from '../services/admin-auth.service';

type Props = {
  children: ReactNode;
};

const navigation = [
  {
    name: 'Dashboard',
    path: '/',
    icon: BarChart3,
  },

  {
    name: 'Licenses',
    path: '/licenses',
    icon: KeyRound,
  },
];

export default function AdminLayout({
  children,
}: Props) {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  async function handleLogout() {
    try {
      await adminLogout();

     navigate(
  '/login',
  {
    replace: true,
  },
);
    } catch (
      error
    ) {
      console.error(
        error,
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-72 bg-slate-950 text-white flex flex-col border-r border-slate-800">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
              <ShieldCheck
                size={24}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Admin Portal
              </h1>

              <p className="text-slate-400 text-sm mt-1">
                SaaS Management
              </p>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-2">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
                    active
                      ? 'bg-blue-600 text-white'
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

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={
              handleLogout
            }
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