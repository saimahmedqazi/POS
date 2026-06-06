import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Window } from '@tauri-apps/api/window';
import {
  LayoutDashboard, ShoppingCart, Package, BarChart3,
  Users, BookOpen, Settings, Receipt, LogOut,
  ShieldCheck, ClipboardList, Minus, Square, X, Bell
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { getDatabase } from '../lib/database';

type Props = { children: ReactNode };

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'POS', path: '/pos', icon: ShoppingCart },
  { name: 'Orders', path: '/orders', icon: ClipboardList },
  { name: 'Sales', path: '/sales', icon: Receipt },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Ledger', path: '/ledger', icon: BookOpen },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

function Titlebar() {
  const handleMinimize = () => Window.getCurrent().minimize();
  const handleMaximize = async () => {
    const win = Window.getCurrent();
    if (await win.isMaximized()) win.unmaximize();
    else win.maximize();
  };
  const handleClose = () => Window.getCurrent().close();

  return (
    <div data-tauri-drag-region className="h-8 select-none flex justify-end items-center bg-surface border-b border-border z-50 fixed top-0 left-0 right-0">
      <div className="flex items-center h-full">
        <button onClick={handleMinimize} className="h-full px-4 hover:bg-surface-hover text-foreground/70 hover:text-foreground transition-colors flex items-center justify-center">
          <Minus size={14} />
        </button>
        <button onClick={handleMaximize} className="h-full px-4 hover:bg-surface-hover text-foreground/70 hover:text-foreground transition-colors flex items-center justify-center">
          <Square size={12} />
        </button>
        <button onClick={handleClose} className="h-full px-4 hover:bg-red-500 hover:text-white text-foreground/70 transition-colors flex items-center justify-center">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: Props) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    // Check low stock
    const checkLowStock = async () => {
      try {
        const db = getDatabase();
        const result = await db.select('SELECT COUNT(*) as count FROM products WHERE quantity <= 5');
        const count = Number((result as any[])[0]?.count || 0);
        setLowStockCount(count);
      } catch (e) {
        console.error(e);
      }
    };
    checkLowStock();
    // Re-check periodically or listen to events
    const interval = setInterval(checkLowStock, 60000);
    return () => clearInterval(interval);
  }, []);

  const isPosPage = location.pathname === '/pos';
  const hideSidebar = isPosPage && isFullscreen;

  return (
    <div className="flex min-h-screen bg-background text-foreground pt-8 transition-colors duration-300">
      <Titlebar />

      {!hideSidebar && (
        <aside className="w-64 bg-surface/80 backdrop-blur-md flex flex-col border-r border-border transition-colors duration-300 relative z-40 shadow-sm">
          {/* HEADER */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-none tracking-tight">POS ERP</h1>
                <p className="text-muted-foreground text-xs mt-1 font-medium">Offline First</p>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                      : 'hover:bg-surface-hover text-foreground/80 hover:text-foreground hover:scale-[1.01]'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm flex-1">{item.name}</span>
                  {item.name === 'Inventory' && lowStockCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {lowStockCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* USER + LOGOUT */}
          <div className="p-4 border-t border-border bg-surface/50">
            <div className="mb-4 px-2">
              <div className="font-semibold text-sm truncate">{currentUser?.name}</div>
              <div className="text-xs text-primary mt-1 font-bold uppercase tracking-wider">{currentUser?.role}</div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all duration-200 font-medium text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>
      )}

      {/* MAIN */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className={hideSidebar ? 'h-[calc(100vh-2rem)] p-4' : 'p-6'}>
          {children}
        </div>
      </main>
    </div>
  );
}