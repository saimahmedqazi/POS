import React, {
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
} from 'react-native';

import {
  signInRetailer,
} from '../services/auth.service';

export default function LoginScreen() {
  const [phone, setPhone] =
    useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  function validate() {
    const normalizedPhone =
      phone.replace(
        /\D/g,
        '',
      );

    if (
      !normalizedPhone
    ) {
      return 'Phone number is required';
    }

    if (
      normalizedPhone.length <
      10
    ) {
      return 'Invalid phone number';
    }

    if (
      !password.trim()
    ) {
      return 'Password is required';
    }

    return '';
  }

function getAuthError(
  message: string,
) {
  const lower =
    message.toLowerCase();

  if (
    lower.includes(
      'invalid login credentials',
    )
  ) {
    return 'Incorrect phone number or password';
  }

  if (
    lower.includes(
      'failed to fetch',
    ) ||
    lower.includes(
      'network',
    ) ||
    lower.includes(
      'fetch',
    )
  ) {
    return 'No internet connection. Please check your network and try again.';
  }

  return message;
}

  async function handleLogin() {
    if (loading) {
      return;
    }

    const validationError =
      validate();

    if (
      validationError
    ) {
      setError(
        validationError,
      );

      return;
    }

    try {
      setLoading(true);

      setError('');

      await signInRetailer(
        phone,
        password,
      );
    } catch (
      err: any
    ) {
      console.error(
        err,
      );

      setError(
        getAuthError(
          err?.message ||
            'Login failed',
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const isValid =
    phone.replace(
      /\D/g,
      '',
    ).length >= 10 &&
    password.trim()
      .length > 0;

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
      behavior={
        Platform.OS ===
        'ios'
          ? 'padding'
          : undefined
      }
    >
      <TouchableWithoutFeedback
        onPress={
          Keyboard.dismiss
        }
      >
        <View
          style={{
            flex: 1,
            justifyContent:
              'center',
            padding: 24,
            backgroundColor:
              '#f9fafb',
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight:
                '700',
              marginBottom: 8,
              color:
                '#111827',
            }}
          >
            Retailer Portal
          </Text>

          <Text
            style={{
              color:
                '#6b7280',
              marginBottom: 32,
            }}
          >
            Place wholesale
            orders from your
            supplier
          </Text>

          <TextInput
            placeholder="03XXXXXXXXX"
            value={phone}
            onChangeText={(
              text,
            ) => {
              setPhone(
                text,
              );

              if (
                error
              ) {
                setError(
                  '',
                );
              }
            }}
            keyboardType="phone-pad"
            autoCapitalize="none"
            editable={
              !loading
            }
            returnKeyType="next"
            style={{
              borderWidth: 1,
              borderColor:
                '#d1d5db',
              borderRadius: 14,
              padding: 16,
              backgroundColor:
                '#fff',
              marginBottom: 14,
              fontSize: 16,
            }}
          />

          <View
            style={{
              borderWidth: 1,
              borderColor:
                '#d1d5db',
              borderRadius: 14,
              backgroundColor:
                '#fff',
              flexDirection:
                'row',
              alignItems:
                'center',
              marginBottom: 16,
            }}
          >
            <TextInput
              placeholder="Password"
              value={
                password
              }
              onChangeText={(
                text,
              ) => {
                setPassword(
                  text,
                );

                if (
                  error
                ) {
                  setError(
                    '',
                  );
                }
              }}
              secureTextEntry={
                !showPassword
              }
              editable={
                !loading
              }
              returnKeyType="done"
              onSubmitEditing={
                handleLogin
              }
              style={{
                flex: 1,
                padding: 16,
                fontSize: 16,
              }}
            />

            <TouchableOpacity
              onPress={() =>
                setShowPassword(
                  (
                    prev,
                  ) =>
                    !prev,
                )
              }
              disabled={
                loading
              }
              style={{
                paddingHorizontal: 16,
              }}
            >
              <Text>
                {showPassword
                  ? 'Hide'
                  : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {!!error && (
            <View
              style={{
                backgroundColor:
                  '#fee2e2',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color:
                    '#dc2626',
                }}
              >
                {error}
              </Text>
            </View>
          )}

          <TouchableOpacity
            disabled={
              loading ||
              !isValid
            }
            onPress={
              handleLogin
            }
            style={{
              backgroundColor:
                loading ||
                !isValid
                  ? '#9ca3af'
                  : '#111827',
              padding: 16,
              borderRadius: 14,
              alignItems:
                'center',
            }}
          >
            {loading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={{
                  color:
                    '#fff',
                  fontSize: 16,
                  fontWeight:
                    '700',
                }}
              >
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <Text
            style={{
              textAlign:
                'center',
              color:
                '#9ca3af',
              marginTop: 24,
              fontSize: 12,
            }}
          >
            Retailer Ordering App
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}