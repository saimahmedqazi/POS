import {
  useState,
} from 'react';



// Removed Card import

import Input from '../../components/ui/input';

import Button from '../../components/ui/button';

import {
  loginLocalUser,
} from '../../repositories/local-auth.repository';

import {
  createSession,
} from '../../repositories/session.repository';



export default function LocalLoginPage() {

 
  const [pin, setPin] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleLogin =
    async () => {
      // PREVENT DOUBLE LOGIN
      if (loading) {
        return;
      }

      const sanitizedPin =
        pin
          .trim()
          .replace(
            /\D/g,
            '',
          );

      if (
        !sanitizedPin
      ) {
        setError(
          'Enter PIN',
        );

        return;
      }

      try {
        setLoading(true);

        setError('');

        const user =
          await loginLocalUser(
            sanitizedPin,
          );

        if (!user) {
          setError(
            'Invalid PIN',
          );

          return;
        }

        // Only clear session-related keys, preserve 'pos-theme' and 'pos-accent'
        localStorage.removeItem('pos-session');
        localStorage.removeItem('pos-user');

        // CREATE SQLITE SESSION
        await createSession(
          user.id,
        );
window.location.href =
  '/';
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setError(
          'Login failed',
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              POS ERP
            </h1>

            <p className="text-slate-400 mt-2 font-medium">
              Offline Secure Login
            </p>
          </div>

          <div className="space-y-5">
            <Input
              type="password"
              maxLength={4}
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) =>
                setPin(
                  e.target
                    .value,
                )
              }
              className="!bg-black/20 !border-white/10 !text-white !placeholder-slate-500 !py-4 text-center text-2xl tracking-[0.5em] font-mono"
              onKeyDown={(
                e,
              ) => {
                if (
                  e.key ===
                    'Enter' &&
                  !loading
                ) {
                  handleLogin();
                }
              }}
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm font-medium text-center">
                {error}
              </div>
            )}

            <Button
              type="button"
              className="w-full !py-4 !rounded-2xl !bg-blue-600 hover:!bg-blue-500 !text-white font-bold transition-colors"
              disabled={
                loading
              }
              onClick={
                handleLogin
              }
            >
              {loading
                ? 'Signing in...'
                : 'Login'}
            </Button>
          </div>

          <div className="mt-8 text-center text-sm text-slate-500 font-medium space-y-1">
            <p>Local Offline Authentication</p>
            <p className="text-[10px] uppercase tracking-widest opacity-80">Powered by CYBSOC</p>
          </div>
        </div>
      </div>
    </div>
  );
}