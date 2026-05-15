import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import api from '../../api/client';

import {
  useAuthStore,
} from '../../store/auth.store';

import Card from '../../components/ui/card';

import Input from '../../components/ui/input';

import Button from '../../components/ui/button';

export default function LoginPage() {
  const navigate =
    useNavigate();

  const setToken =
    useAuthStore(
      (state) =>
        state.setToken,
    );

  const [email, setEmail] =
    useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleLogin =
    async (
      e:
        React.FormEvent,
    ) => {
      e.preventDefault();

      try {
        setLoading(true);

        setError('');

        const response =
          await api.post(
            '/auth/login',
            {
              email,

              password,
            },
          );

        setToken(
          response.data
            .access_token,
        );

        navigate('/');
      } catch (
        err: any
      ) {
        setError(
          err.response?.data
            ?.message ||
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
              Sign in to continue
            </p>
          </div>

          <form
            onSubmit={
              handleLogin
            }
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(
                  e,
                ) =>
                  setEmail(
                    e.target
                      .value,
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <Input
                type="password"
                placeholder="Enter your password"
                value={
                  password
                }
                onChange={(
                  e,
                ) =>
                  setPassword(
                    e.target
                      .value,
                  )
                }
              />
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={
                loading
              }
              className="w-full"
            >
              {loading
                ? 'Signing in...'
                : 'Login'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            ERP & POS
            Management System
          </div>
        </Card>
      </div>
    </div>
  );
}