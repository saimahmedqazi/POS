import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  getCurrentSession,
  clearSession,
} from '../repositories/session.repository';

import {
  getUserById,
} from '../repositories/local-auth.repository';

type AuthContextType = {
  currentUser: any;

  loading: boolean;

  refreshUser: () => Promise<void>;

  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType>(
    {
      currentUser:
        null,

      loading: true,

      refreshUser:
        async () => {},

      logout:
        async () => {},
    },
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const navigate =
    useNavigate();

  const [
    currentUser,
    setCurrentUser,
  ] = useState<any>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const refreshUser =
    async () => {
      try {
        setLoading(true);

        const session =
          await getCurrentSession();

        if (!session) {
          setCurrentUser(
            null,
          );

          return;
        }

        const user =
          await getUserById(
            session,
          );

        setCurrentUser(
          user || null,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setCurrentUser(
          null,
        );
      } finally {
        setLoading(false);
      }
    };

  const logout =
    async () => {
      try {
        setLoading(true);

        // CLEAR SQLITE SESSION
        await clearSession();

        // CLEAR USER STATE
        setCurrentUser(
          null,
        );

        // NAVIGATE TO LOGIN
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
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,

        loading,

        refreshUser,

        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(
    AuthContext,
  );
}