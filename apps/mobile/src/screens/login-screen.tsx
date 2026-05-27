import {
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import {
  signInRetailer,
} from '../services/auth.service';

export default function LoginScreen() {
  const [
    phone,
    setPhone,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  async function handleLogin() {
    try {
      setLoading(true);

      setError('');

      await signInRetailer(
        phone,
        password,
      );

   
    } catch (
      error: any
    ) {
      console.error(
        error,
      );

      setError(
        error.message ||
          'Login failed',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,

        justifyContent:
          'center',

        padding: 24,

        backgroundColor:
          '#fff',
      }}
    >
      <Text
        style={{
          fontSize: 28,

          fontWeight:
            '700',

          marginBottom: 32,
        }}
      >
        Retailer Login
      </Text>

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={
          setPhone
        }
        keyboardType="phone-pad"
        style={{
          borderWidth: 1,

          borderColor:
            '#ddd',

          borderRadius: 12,

          padding: 14,

          marginBottom: 16,
        }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={
          setPassword
        }
        secureTextEntry
        style={{
          borderWidth: 1,

          borderColor:
            '#ddd',

          borderRadius: 12,

          padding: 14,

          marginBottom: 16,
        }}
      />

      {error ? (
        <Text
          style={{
            color: 'red',

            marginBottom: 16,
          }}
        >
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        onPress={
          handleLogin
        }
        disabled={loading}
        style={{
          backgroundColor:
            '#111',

          padding: 16,

          borderRadius: 12,

          alignItems:
            'center',
        }}
      >
        <Text
          style={{
            color: '#fff',

            fontWeight:
              '600',
          }}
        >
          {loading
            ? 'Signing In...'
            : 'Sign In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}