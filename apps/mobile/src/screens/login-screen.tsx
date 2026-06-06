import React, {
  useEffect,
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
  StyleSheet,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInRetailer,
} from '../services/auth.service';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60 * 1000; // 60 seconds

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lockout States
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Initialize Lockout State on Mount
  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function checkLockoutStatus() {
      try {
        const lockoutUntilStr = await AsyncStorage.getItem('login_lockout_until');
        const attemptsStr = await AsyncStorage.getItem('login_failed_attempts');
        
        if (attemptsStr) {
          setFailedAttempts(parseInt(attemptsStr, 10));
        }

        if (lockoutUntilStr) {
          const lockoutUntil = parseInt(lockoutUntilStr, 10);
          const now = Date.now();
          
          if (lockoutUntil > now) {
            const remaining = Math.ceil((lockoutUntil - now) / 1000);
            setLockoutTimeRemaining(remaining);

            // Start countdown interval
            timer = setInterval(() => {
              const currentNow = Date.now();
              if (lockoutUntil > currentNow) {
                setLockoutTimeRemaining(Math.ceil((lockoutUntil - currentNow) / 1000));
              } else {
                setLockoutTimeRemaining(0);
                AsyncStorage.removeItem('login_lockout_until');
                AsyncStorage.setItem('login_failed_attempts', '0');
                setFailedAttempts(0);
                clearInterval(timer);
              }
            }, 1000);
          }
        }
      } catch (err) {
        console.error('Error checking lockout status:', err);
      }
    }

    checkLockoutStatus();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutTimeRemaining]);

  function validate() {
    const normalizedPhone = phone.replace(/\D/g, '');

    if (!normalizedPhone) {
      return 'Phone number is required';
    }

    if (normalizedPhone.length < 10) {
      return 'Invalid phone number';
    }

    if (!password.trim()) {
      return 'Password is required';
    }

    return '';
  }

  function getAuthError(message: string) {
    const lower = message.toLowerCase();

    if (lower.includes('invalid login credentials')) {
      return 'Incorrect phone number or password';
    }

    if (
      lower.includes('failed to fetch') ||
      lower.includes('network') ||
      lower.includes('fetch')
    ) {
      return 'No internet connection. Please check your network and try again.';
    }

    return message;
  }

  async function handleLogin() {
    if (loading || lockoutTimeRemaining > 0) {
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signInRetailer(phone, password);
      
      // Reset attempts on successful login
      await AsyncStorage.removeItem('login_failed_attempts');
      await AsyncStorage.removeItem('login_lockout_until');
    } catch (err: any) {
      console.error(err);
      
      const isAuthError = err?.message?.toLowerCase().includes('invalid login credentials') || 
                          err?.message?.toLowerCase().includes('incorrect phone number or password');

      // Update failed attempts only for authentication credential failures
      let nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      await AsyncStorage.setItem('login_failed_attempts', nextAttempts.toString());

      if (nextAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_DURATION;
        await AsyncStorage.setItem('login_lockout_until', lockUntil.toString());
        setLockoutTimeRemaining(60);
        setError('Too many failed attempts. Login has been locked for 60 seconds.');
      } else {
        const authMsg = getAuthError(err?.message || 'Login failed');
        const attemptsLeft = MAX_ATTEMPTS - nextAttempts;
        setError(`${authMsg} (${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining)`);
      }
    } finally {
      setLoading(false);
    }
  }

  const isValid = phone.replace(/\D/g, '').length >= 10 && password.trim().length > 0;
  const isLocked = lockoutTimeRemaining > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Logo / Brand Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Feather name="shopping-bag" size={32} color={isLocked ? '#94a3b8' : '#2563eb'} />
            </View>
            <Text style={styles.title}>Retailer Portal</Text>
            <Text style={styles.subtitle}>Place wholesale orders from your supplier</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            
            {/* Lockout Warning Banner */}
            {isLocked && (
              <View style={styles.lockoutBanner}>
                <Feather name="shield-off" size={18} color="#9a3412" style={{ marginRight: 8 }} />
                <Text style={styles.lockoutText}>
                  Temporarily locked. Try again in {lockoutTimeRemaining}s.
                </Text>
              </View>
            )}

            {/* Phone Input */}
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={[styles.inputWrapper, isLocked && styles.inputWrapperDisabled]}>
              <Feather name="phone" size={18} color={isLocked ? '#cbd5e1' : '#9ca3af'} style={styles.inputIcon} />
              <TextInput
                placeholder="03XXXXXXXXX"
                placeholderTextColor={isLocked ? '#cbd5e1' : '#9ca3af'}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (error) setError('');
                }}
                keyboardType="phone-pad"
                autoCapitalize="none"
                editable={!loading && !isLocked}
                returnKeyType="next"
                style={[styles.input, isLocked && styles.inputDisabled]}
              />
            </View>

            {/* Password Input */}
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, isLocked && styles.inputWrapperDisabled]}>
              <Feather name="lock" size={18} color={isLocked ? '#cbd5e1' : '#9ca3af'} style={styles.inputIcon} />
              <TextInput
                placeholder="Enter password"
                placeholderTextColor={isLocked ? '#cbd5e1' : '#9ca3af'}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError('');
                }}
                secureTextEntry={!showPassword}
                editable={!loading && !isLocked}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                style={[styles.input, isLocked && styles.inputDisabled]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                disabled={loading || isLocked}
                style={styles.eyeIcon}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={isLocked ? '#cbd5e1' : '#6b7280'} />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {!!error && (
              <View style={[styles.errorContainer, isLocked && styles.errorContainerLockout]}>
                <Feather 
                  name={isLocked ? 'shield-off' : 'alert-circle'} 
                  size={16} 
                  color={isLocked ? '#9a3412' : '#dc2626'} 
                  style={{ marginRight: 6 }} 
                />
                <Text style={[styles.errorText, isLocked && styles.errorTextLockout]}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              disabled={loading || !isValid || isLocked}
              onPress={handleLogin}
              style={[
                styles.button,
                (!isValid || loading || isLocked) && styles.buttonDisabled,
                isLocked && styles.buttonLocked,
              ]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>
                    {isLocked ? `Locked (${lockoutTimeRemaining}s)` : 'Sign In'}
                  </Text>
                  {!isLocked && <Feather name="arrow-right" size={16} color="#fff" style={{ marginLeft: 6 }} />}
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>Retailer Ordering App • Powered by CYBSOC</Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  lockoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  lockoutText: {
    color: '#9a3412',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  inputWrapperDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a',
  },
  inputDisabled: {
    color: '#94a3b8',
  },
  eyeIcon: {
    padding: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorContainerLockout: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  errorTextLockout: {
    color: '#9a3412',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonLocked: {
    backgroundColor: '#ea580c',
    shadowColor: '#ea580c',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 32,
    fontSize: 12,
    fontWeight: '500',
  },
});