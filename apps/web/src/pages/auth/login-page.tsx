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
          console.log(response.data);
        setToken(
          response.data.access_token,
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
    <div
      style={{
        padding: 40,
      }}
    >
      <h1>
        POS Login
      </h1>

      <form
        onSubmit={
          handleLogin
        }
      >
        <div>
          <input
            type="email"
            placeholder="Email"
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
          <input
            type="password"
            placeholder="Password"
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

        <button
          type="submit"
          disabled={
            loading
          }
        >
          {loading
            ? 'Loading...'
            : 'Login'}
        </button>

        {error && (
          <p>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}