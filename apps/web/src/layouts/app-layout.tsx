import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Window } from '@tauri-apps/api/window';
import {
  LayoutDashboard, ShoppingCart, Package, BarChart3,
  Users, BookOpen, Settings, Receipt, LogOut,
  Store, ClipboardList, Minus, Square, X, Minimize2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import pkgJson from '../../package.json';
import { useAuth } from '../context/auth-context';
import { getDatabase } from '../lib/database';
import UpdaterManager from '../components/updater-manager';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

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
        <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-surface/80 backdrop-blur-md flex flex-col border-r border-border transition-colors duration-300 relative z-40 shadow-sm`}>
          {/* TOGGLE BUTTON */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-20 bg-surface border border-border text-foreground hover:text-primary rounded-full p-1 shadow-md z-50 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* HEADER */}
          <div className={`p-4 border-b border-border ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 min-w-[40px] rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                <Store size={20} />
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden whitespace-nowrap">
                  <h1 className="text-xl font-bold leading-none tracking-tight">POS ERP</h1>
                  <p className="text-muted-foreground text-[9px] mt-1 font-medium uppercase tracking-wide">Powered by CYBSOC</p>
                </div>
              )}
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                      : 'hover:bg-surface-hover text-foreground/80 hover:text-foreground hover:scale-[1.01]'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <Icon size={18} className="min-w-[18px]" />
                  
                  {!isSidebarCollapsed && (
                    <span className="font-medium text-sm flex-1 whitespace-nowrap">{item.name}</span>
                  )}

                  {!isSidebarCollapsed && item.name === 'Inventory' && lowStockCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {lowStockCount}
                    </span>
                  )}

                  {isSidebarCollapsed && item.name === 'Inventory' && lowStockCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* USER + LOGOUT */}
          <div className={`p-4 border-t border-border bg-surface/50 flex flex-col ${isSidebarCollapsed ? 'items-center' : ''}`}>
            {!isSidebarCollapsed && (
              <div className="mb-4 px-2 whitespace-nowrap overflow-hidden">
                <div className="font-semibold text-sm truncate">{currentUser?.name}</div>
                <div className="text-xs text-primary mt-1 font-bold uppercase tracking-wider">{currentUser?.role}</div>
              </div>
            )}
            
            <button
              onClick={logout}
              title={isSidebarCollapsed ? "Logout" : undefined}
              className={`flex items-center justify-center gap-3 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all duration-200 font-medium text-sm ${
                isSidebarCollapsed ? 'p-3 w-12 h-12' : 'px-4 py-2.5 w-full'
              }`}
            >
              <LogOut size={16} /> {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>
      )}

      {/* MAIN */}
      <main className="flex-1 overflow-auto relative z-10 flex flex-col">
        {hideSidebar && (
          <div className="bg-surface/90 backdrop-blur-md border-b border-border py-2 px-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <ShieldCheck size={14} />
              </div>
              <span className="font-bold text-sm">POS Terminal</span>
              <span className="text-muted-foreground text-xs">v{pkgJson.version}</span>
            </div>
            
            <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground font-medium">
              <span className="bg-background px-2 py-1 rounded-md border border-border">F2 Search</span>
              <span className="bg-background px-2 py-1 rounded-md border border-border">F3 Scan</span>
              <span className="bg-background px-2 py-1 rounded-md border border-border">F9 Checkout</span>
              <span className="bg-background px-2 py-1 rounded-md border border-border">ESC Clear</span>
            </div>

            <button 
              onClick={() => document.exitFullscreen()}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              <Minimize2 size={14} /> Exit Fullscreen
            </button>
          </div>
        )}
        <div className={hideSidebar ? 'flex-1 p-2 md:p-4 min-h-0' : 'p-6 flex-1 min-h-0'}>
          {children}
        </div>
      </main>

      <UpdaterManager />
    </div>
  );
}