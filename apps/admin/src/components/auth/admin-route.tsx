import type {
  ReactNode,
} from 'react';

import {
  useEffect,
  useState,
} from 'react';

import {
  Navigate,
} from 'react-router-dom';

import {
  getCurrentAdmin,
} from '../../services/admin-auth.service';

type Props = {
  children: ReactNode;
};

export default function AdminRoute({
  children,
}: Props) {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    authorized,
    setAuthorized,
  ] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const admin =
          await getCurrentAdmin();

        setAuthorized(
          !!admin,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setAuthorized(
          false,
        );
      } finally {
        setLoading(false);
      }
    }

    check();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        Loading admin...
      </div>
    );
  }

  if (!authorized) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}