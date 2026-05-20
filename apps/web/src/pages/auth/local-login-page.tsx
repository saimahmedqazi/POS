import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import Card from '../../components/ui/card';

import Input from '../../components/ui/input';

import Button from '../../components/ui/button';

import {
  loginLocalUser,
} from '../../repositories/local-auth.repository';

import {
  createSession,
} from '../../repositories/session.repository';

import {
  useAuth,
} from '../../context/auth-context';

export default function LocalLoginPage() {
  const navigate =
    useNavigate();

  const {
    refreshUser,
  } = useAuth();

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

        // CLEAR OLD SESSION FIRST
        localStorage.clear();

        // CREATE SQLITE SESSION
        await createSession(
          user.id,
        );

        // REFRESH AUTH CONTEXT
        await refreshUser();

        // SMALL DELAY
        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              100,
            ),
        );

        // NAVIGATE
        navigate(
          '/',
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

        setError(
          'Login failed',
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="rounded-3xl shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900">
              POS ERP
            </h1>

            <p className="text-slate-500 mt-2">
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
              <div className="bg-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <Button
              type="button"
              className="w-full"
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

          <div className="mt-8 text-center text-sm text-slate-500">
            Local Offline Authentication
          </div>
        </Card>
      </div>
    </div>
  );
}