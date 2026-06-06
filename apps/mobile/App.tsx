import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
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
        console.log('[App] Starting initialize...');
        console.log('[App] Calling supabase.auth.getSession()...');
        const {
          data,
        } =
          await supabase.auth.getSession();

        console.log('[App] getSession completed. Session found:', !!data.session);

        if (!mounted) {
          console.log('[App] initialize component unmounted, returning.');
          return;
        }

        setAuthenticated(
          !!data.session,
        );
      } catch (error) {
        console.error(
          '[App] Session bootstrap failed:',
          error,
        );

        setAuthenticated(
          false,
        );
      } finally {
        if (mounted) {
          console.log('[App] Setting loading to false.');
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
          justifyContent:
            'center',
          alignItems:
            'center',
          backgroundColor:
            '#020617',
          padding: 24,
        }}
      >
        <ActivityIndicator
          size="large"
          color="#3b82f6"
        />

        <Text
          style={{
            marginTop: 16,
            color:
              '#94a3b8',
            fontSize: 16,
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return authenticated ? (
    <AppNavigation />
  ) : (
    <LoginScreen />
  );
}