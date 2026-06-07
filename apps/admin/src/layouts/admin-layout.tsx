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

import pkgJson from '../../../web/package.json';

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
    <div className="flex min-h-screen bg-background text-foreground selection:bg-blue-500/30">
      <aside className="w-72 bg-surface/80 backdrop-blur-xl flex flex-col border-r border-border/50 shadow-2xl relative z-10">
        {/* HEADER */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck size={24} className="text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Admin Portal
              </h1>
              <p className="text-blue-400/80 text-[10px] font-medium uppercase tracking-widest mt-1">
                Powered by CYBSOC
              </p>
              <div className="mt-1.5 inline-block bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                v{pkgJson.version}
              </div>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  active
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner'
                    : 'hover:bg-surface-hover text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                <span className="font-medium tracking-wide text-sm">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all text-red-400 font-medium text-sm group"
          >
            <LogOut
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 min-h-screen overflow-auto relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}