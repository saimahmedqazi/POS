import {
  useEffect,
  useState,
} from 'react';

import LoginScreen from './src/screens/login-screen';

import AppNavigation from './src/navigation/app-navigation';

import {
  supabase,
} from './src/services/supabase';

export default function App() {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const {
        data,
      } =
        await supabase.auth.getSession();

      setAuthenticated(
        !!data.session,
      );

      setLoading(false);
    }

    bootstrap();

    const {
      data:
        authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session,
        ) => {
          setAuthenticated(
            !!session,
          );
        },
      );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null;
  }

  if (
    !authenticated
  ) {
    return (
      <LoginScreen />
    );
  }

  return (
    <AppNavigation />
  );
}