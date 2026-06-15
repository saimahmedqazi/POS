import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  ActivityIndicator,
} from 'react-native';

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
    let mounted = true;

    async function initialize() {
      try {
        const { data } = await supabase.auth.getSession();

        if (!mounted) return;

        setAuthenticated(!!data.session);
      } catch (error) {
        console.error('[App] Session bootstrap failed:', error);
        setAuthenticated(false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    const {
      data: listener,
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
      mounted = false;

      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#020617',
        }}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return authenticated ? (
    <AppNavigation />
  ) : (
    <LoginScreen />
  );
}