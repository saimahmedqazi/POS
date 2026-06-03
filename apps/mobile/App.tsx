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
        const {
          data,
        } =
          await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        setAuthenticated(
          !!data.session,
        );
      } catch (error) {
        console.error(
          'Session bootstrap failed:',
          error,
        );

        setAuthenticated(
          false,
        );
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
          justifyContent:
            'center',
          alignItems:
            'center',
          backgroundColor:
            '#f9fafb',
          padding: 24,
        }}
      >
        <ActivityIndicator
          size="large"
        />

        <Text
          style={{
            marginTop: 16,
            color:
              '#6b7280',
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