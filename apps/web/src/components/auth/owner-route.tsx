import type {
  ReactNode,
} from 'react';

import {
  Navigate,
} from 'react-router-dom';

import {
  useAuth,
} from '../../context/auth-context';

type Props = {
  children: ReactNode;
};

export default function OwnerRoute({
  children,
}: Props) {
  const {
    currentUser,
    loading,
  } = useAuth();

  if (loading) {
    return null;
  }

  if (
    currentUser?.role !==
    'OWNER'
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}