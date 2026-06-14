import {
  StrictMode,
} from 'react';

import {
  createRoot,
} from 'react-dom/client';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import './index.css';

import {
  initDatabase,
} from './lib/database';

import {
  bootstrapApp,
} from './services/bootstrap.service';

import {
  AuthProvider,
} from './context/auth-context';

import {
  ThemeProvider,
} from './context/theme-context';

import App from './App';

import SetupPage from './pages/setup/setup-page';

import LocalLoginPage from './pages/auth/local-login-page';

import LicenseExpiredPage from './pages/license/license-expired-page';

import ProtectedRoute from './components/auth/protected-route';

import LicenseActivationPage from './pages/license/license-activation-page';






import ErrorBoundary from './components/system/error-boundary';

function LoadingScreen() {
  const isDark = (() => {
    try {
      const t = localStorage.getItem('pos-theme');
      if (t === 'dark') return true;
      if (t === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
      return false;
    } catch {
      return false;
    }
  })();
  const themeClasses = isDark ? 'bg-[#0f172a] text-[#f8fafc]' : 'bg-[#f8fafc] text-[#0f172a]';
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${themeClasses}`}>
      <div className="w-48 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mb-4 relative">
        <div className="absolute top-0 left-0 h-full bg-blue-500 w-full animate-[indeterminate_1.5s_infinite_linear]" />
      </div>
      <div className="opacity-70 text-sm tracking-widest uppercase font-medium">
        Powered by CYBSOC
      </div>
    </div>
  );
}

async function bootstrap() {
  const root =
    createRoot(
      document.getElementById(
        'root',
      )!,
    );

  root.render(
    <StrictMode>
      <LoadingScreen />
    </StrictMode>,
  );

 


    // =========================
    // POS RUNTIME
    // =========================
try {
    await initDatabase();

    const status =
      await bootstrapApp();



    let initialRoute =
      '/';

    switch (status) {
      case 'SETUP_REQUIRED':
        initialRoute =
          '/setup';
        break;

      case 'LICENSE_REQUIRED':
      case 'LICENSE_INVALID':
        initialRoute =
          '/activate-license';
        break;

      case 'LICENSE_EXPIRED':
        initialRoute =
          '/license-expired';
        break;

      case 'LOGIN_REQUIRED':
        initialRoute =
          '/login';
        break;

      case 'READY':
        initialRoute =
          '/';
        break;
    }

    root.render(
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
            {/* SETUP */}
            <Route
              path="/setup"
              element={
                <SetupPage />
              }
            />

            {/* LOGIN */}
            <Route
              path="/login"
              element={
                <LocalLoginPage />
              }
            />

            {/* LICENSE ACTIVATION */}
            <Route
              path="/activate-license"
              element={
                <LicenseActivationPage />
              }
            />

            {/* LICENSE EXPIRED */}
            <Route
              path="/license-expired"
              element={
                <LicenseExpiredPage />
              }
            />

            {/* POS APP */}
            <Route
              path="/*"
              element={
                initialRoute ===
                '/' ? (
                  <ProtectedRoute>
                    <App />
                  </ProtectedRoute>
                ) : (
                  <Navigate
                    to={
                      initialRoute
                    }
                    replace
                  />
                )
              }
            />

            {/* FALLBACK */}
            <Route
              path="*"
              element={
                <Navigate
                  to={
                    initialRoute
                  }
                  replace
                />
              }
            />
          </Routes>
        </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  
);
  } catch (error) {
    console.error(
      error,
    );

    const isDark = (() => {
      try {
        const t = localStorage.getItem('pos-theme');
        if (t === 'dark') return true;
        if (t === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
        return false;
      } catch {
        return false;
      }
    })();
    const themeClasses = isDark ? 'bg-[#0f172a] text-[#f8fafc]' : 'bg-[#f8fafc] text-[#0f172a]';

    root.render(
      <div className={`min-h-screen flex flex-col items-center justify-center p-8 text-center ${themeClasses}`}>
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-8 max-w-2xl backdrop-blur-xl">
          <h1 className="text-2xl font-bold mb-4 text-red-500 dark:text-red-400">Failed to initialize POS</h1>
          <p className="mb-6 opacity-80">
            This usually happens if another instance of the POS is already running, or if your local database file is locked. Please close any other open POS windows and try again.
          </p>
          <div className="bg-black/20 p-4 rounded-xl text-sm text-left overflow-auto border border-black/10 dark:border-white/5 font-mono text-red-600 dark:text-red-300">
            {error instanceof Error ? error.message : String(error)}
          </div>
        </div>
      </div>,
    );
  }
}

bootstrap();