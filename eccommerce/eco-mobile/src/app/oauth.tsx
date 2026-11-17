import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/auth-context';
import { AuthButton } from '@/components/auth/AuthUI';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Fallback landing route for the OAuth deep link. Normally
 * WebBrowser.openAuthSessionAsync captures the redirect and the login screen
 * finishes the flow; this screen handles the case where the URL opens the app
 * directly instead.
 */
export default function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; error?: string }>();
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  const { loginWithOAuthCode } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const providerError = firstParam(params.error);
    const code = firstParam(params.code);

    if (providerError) {
      setError(providerError);
      return;
    }

    if (!code) {
      setError('No sign-in code was returned. Please go back and try again.');
      return;
    }

    loginWithOAuthCode(code)
      .then((result) => {
        if (result.success) router.replace('/profile');
        else setError(result.error || 'Google sign-in failed. Please try again.');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
      });
  }, [params, loginWithOAuthCode, router]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      <View style={styles.content}>
        {error ? (
          <>
            <Text style={[styles.title, { color: theme.text }]}>Sign-in didn&apos;t finish</Text>
            <Text style={[styles.message, { color: theme.textSecondary }]}>{error}</Text>
            <View style={styles.action}>
              <AuthButton label="Back to sign in" onPress={() => router.replace('/login')} />
            </View>
          </>
        ) : (
          <>
            <ActivityIndicator size="small" color={theme.text} />
            <Text style={[styles.message, { color: theme.textSecondary }]}>Completing sign-in…</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 14,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  message: {
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
  },
  action: {
    width: '100%',
    maxWidth: 320,
    marginTop: 8,
  },
});
