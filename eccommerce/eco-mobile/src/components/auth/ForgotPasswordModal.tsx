import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { authApi } from '@/services/auth-api';
import { AuthButton, AuthError, AuthField, AuthModalShell } from './AuthUI';

type ForgotPasswordModalProps = {
  visible: boolean;
  initialEmail?: string;
  onClose: () => void;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordModal({ visible, initialEmail, onClose }: ForgotPasswordModalProps) {
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [sentMessage, setSentMessage] = useState('');

  useEffect(() => {
    if (!visible) return;
    setEmail(initialEmail ?? '');
    setLoading(false);
    setError(null);
    setSent(false);
    setSentMessage('');
  }, [visible, initialEmail]);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authApi.forgotPassword(cleanEmail);
      setSent(true);
      setSentMessage(
        response.message ||
          'If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not send the reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModalShell visible={visible} onClose={onClose}>
      {sent ? (
        <>
          <View style={[styles.iconWrap, isLight ? styles.successIconWrap : styles.successIconWrapDark]}>
            <Ionicons name="checkmark" size={24} color={isLight ? '#15803D' : '#4ADE80'} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Check your inbox</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {sentMessage}
          </Text>
          <Text style={[styles.finePrint, { color: theme.textSecondary }]}>
            The link expires in 30 minutes and can only be used once.
          </Text>
          <View style={styles.action}>
            <AuthButton label="Back to sign in" onPress={onClose} />
          </View>
        </>
      ) : (
        <>
          <View style={[styles.iconWrap, { backgroundColor: isLight ? 'rgba(17,17,17,0.06)' : 'rgba(255,255,255,0.08)' }]}>
            <Ionicons name="key-outline" size={23} color={theme.text} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Forgot password?</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Enter the email linked to your account and we&apos;ll send a reset link.
          </Text>

          <AuthField
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={submit}
          />

          {error ? (
            <View style={styles.errorWrap}>
              <AuthError message={error} />
            </View>
          ) : null}

          <View style={[styles.action, error ? styles.actionTight : null]}>
            <AuthButton label="Send reset link" loading={loading} onPress={submit} />
          </View>
        </>
      )}
    </AuthModalShell>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  successIconWrap: {
    backgroundColor: '#DCFCE7',
  },
  successIconWrapDark: {
    backgroundColor: '#14351F',
  },
  title: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  finePrint: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: -10,
    marginBottom: 20,
    opacity: 0.85,
  },
  errorWrap: { marginTop: 12 },
  action: { marginTop: 16 },
  actionTight: { marginTop: 0 },
});
