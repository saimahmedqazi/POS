import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '../../components/ui/card';
import Input from '../../components/ui/input';
import Button from '../../components/ui/button';

import { adminLogin } from '../../services/admin-auth.service';

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    const e = email.trim();

    if (!e) return 'Email is required';
    if (!e.includes('@')) return 'Invalid email';

    if (!password) return 'Password is required';
    if (password.length < 6)
      return 'Password too short';

    return '';
  }

  async function handleLogin() {
    if (loading) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await adminLogin(
        email.trim(),
        password,
      );

      navigate('/admin', {
        replace: true,
      });
    } catch (err: any) {
      console.error(err);

      // Prevent leaking internal errors
      const message =
        err?.message?.toLowerCase().includes('invalid')
          ? 'Invalid email or password'
          : 'Unable to login. Try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLogin();
  }

  const isDisabled =
    loading ||
    !email.trim() ||
    !password;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10">
        <Card className="rounded-3xl p-8 backdrop-blur-xl border-border/50">
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                Admin Panel
              </h1>

              <p className="text-slate-400 mt-2 font-medium tracking-wide">
                Secure Login
              </p>
            </div>

            <div className="space-y-5">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                autoComplete="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
              />

              <Input
                type="password"
                placeholder="Password"
                value={password}
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
              />

              {error && (
                <div className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-2xl text-sm font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isDisabled}
              >
                {loading
                  ? 'Signing in...'
                  : 'Login'}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-xs font-semibold tracking-wider uppercase text-slate-500">
            SaaS Administration Portal
          </div>
        </Card>
      </div>
    </div>
  );
}