import type {
  ReactNode,
} from 'react';

import {
  Navigate,
} from 'react-router-dom';

import {
  useAuth,
} from '../../context/auth-context';

export default function ProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const {
    currentUser,
    loading,
  } = useAuth();

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground/70 text-lg font-medium animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // NOT LOGGED IN
  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // AUTHORIZED
  return children;
}