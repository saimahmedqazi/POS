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
          padding: 24,
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 }}>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -1 }}>CY</Text>
          </View>
          
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>

        <View style={{ paddingBottom: 40, alignItems: 'center' }}>
          <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>
            Powered by
          </Text>
          <Text style={{ color: '#f8fafc', fontSize: 16, fontWeight: '800', letterSpacing: 2, marginTop: 4 }}>
            CYBSOC
          </Text>
        </View>
      </View>
    );
  }

  return authenticated ? (
    <AppNavigation />
  ) : (
    <LoginScreen />
  );
}