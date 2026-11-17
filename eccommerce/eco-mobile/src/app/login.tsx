import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/auth-context';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { useNativeGoogleAuth } from '@/hooks/use-native-google-auth';
import { AuthError, AuthField, GoogleButton } from '@/components/auth/AuthUI';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const isShort = windowHeight < 900;
  const isLight = theme.background === '#F8F7F4';
  const { login } = useAuth();
  const { isGoogleLoading, signInWithGoogle: signInWithWebGoogle } = useGoogleAuth();
  const nativeGoogle = useNativeGoogleAuth();
  const googleLoading = nativeGoogle.isLoading || isGoogleLoading;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    if (params.email) setEmail(params.email);
  }, [params.email]);

  const handleSubmit = async () => {
    if (isSubmitting || googleLoading) return;
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMessage('Enter your email and password to continue.');
      (cleanEmail ? passwordInput : emailInput).current?.focus();
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      const result = await login(cleanEmail, password);
      if (result.success) {
        router.replace('/profile');
      } else {
        setErrorMessage(result.error || 'Email or password is incorrect. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToSignup = () => {
    router.push({
      pathname: '/signup',
      params: { email: email.trim() },
    });
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const openForgot = () => {
    Keyboard.dismiss();
    setForgotOpen(true);
  };

  const handleGoogle = async () => {
    if (googleLoading || isSubmitting) return;
    Keyboard.dismiss();
    setErrorMessage(null);

    if (Platform.OS === 'web') {
      const webResult = await signInWithWebGoogle();
      if (webResult.success) router.replace('/profile');
      else if (webResult.error) setErrorMessage(webResult.error);
      return;
    }

    const nativeResult = await nativeGoogle.signInWithGoogle();
    if (nativeResult.success) router.replace('/profile');
    else if (!nativeResult.available) {
      const fallbackResult = await signInWithWebGoogle();
      if (fallbackResult.success) router.replace('/profile');
      else if (fallbackResult.error) setErrorMessage(fallbackResult.error);
    } else if (nativeResult.error) setErrorMessage(nativeResult.error);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style={isLight ? 'dark' : 'light'} />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, isShort && styles.scrollContentShort]}
            showsVerticalScrollIndicator={false}
            bounces={false}
            alwaysBounceVertical={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View
                style={[
                  styles.heroPanel,
                  isShort && styles.heroPanelShort,
                  {
                    backgroundColor: isLight ? '#EDF2EC' : '#161D18',
                    borderColor: isLight ? '#E1E8DF' : '#273129',
                  },
                ]}
              >
                <View
                  style={[
                    styles.heroGlow,
                    { backgroundColor: isLight ? '#F6EAD5' : '#223029' },
                  ]}
                />
                <Image
                  source={require('@/assets/images/signin-hero.png')}
                  style={styles.heroArt}
                  resizeMode="cover"
                  accessible={false}
                />
              </View>

              <View style={[styles.headingBlock, isShort && styles.headingBlockShort]}>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Sign in to see your orders and saved items.
                </Text>
              </View>

              {errorMessage ? <AuthError message={errorMessage} /> : null}

              <View style={[styles.form, isShort && styles.formShort]}>
                <AuthField
                  ref={emailInput}
                  outlined
                  dense
                  label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => passwordInput.current?.focus()}
                />

                <AuthField
                  ref={passwordInput}
                  outlined
                  dense
                  label="Password"
                  password
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                  right={
                    <TouchableOpacity
                      onPress={openForgot}
                      activeOpacity={0.7}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel="Forgot password?"
                    >
                      <Text style={[styles.forgot, { color: isLight ? '#163A5F' : '#AFCBE5' }]}>
                        Forgot password?
                      </Text>
                    </TouchableOpacity>
                  }
                />

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting || googleLoading}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in"
                  accessibilityState={{ disabled: isSubmitting || googleLoading, busy: isSubmitting }}
                  style={[
                    styles.primaryButton,
                    isShort && styles.primaryButtonShort,
                    {
                      backgroundColor: isLight ? '#163A5F' : '#AFCBE5',
                      shadowColor: isLight ? '#163A5F' : '#000000',
                      opacity: isSubmitting || googleLoading ? 0.62 : 1,
                    },
                  ]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={isLight ? '#FFFFFF' : '#0B1E2E'} />
                  ) : (
                    <>
                      <Text style={[styles.primaryLabel, { color: isLight ? '#FFFFFF' : '#0B1E2E' }]}>
                        Sign in
                      </Text>
                      <View
                        style={[
                          styles.primaryIcon,
                          {
                            backgroundColor: isLight
                              ? 'rgba(255, 255, 255, 0.14)'
                              : 'rgba(11, 30, 46, 0.12)',
                          },
                        ]}
                      >
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={isLight ? '#FFFFFF' : '#0B1E2E'}
                        />
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View
                style={[styles.divider, isShort && styles.dividerShort]}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                <View style={[styles.rule, { backgroundColor: isLight ? '#E1DED6' : '#2A2C2F' }]} />
                <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
                  OR CONTINUE WITH
                </Text>
                <View style={[styles.rule, { backgroundColor: isLight ? '#E1DED6' : '#2A2C2F' }]} />
              </View>

              <GoogleButton
                onPress={handleGoogle}
                loading={googleLoading}
                disabled={isSubmitting}
                style={[styles.googleButton, isShort && styles.googleButtonShort]}
              />

              <View style={[styles.footer, isShort && styles.footerShort]}>
                <Text style={[styles.footerPrompt, { color: theme.textSecondary }]}>
                  New to eco?
                </Text>
                <TouchableOpacity
                  onPress={handleGoToSignup}
                  activeOpacity={0.7}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Create an account"
                >
                  <Text style={[styles.footerAction, { color: isLight ? '#163A5F' : '#AFCBE5' }]}>
                    Create an account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <View style={[styles.floatingBackWrap, { top: insets.top + 8 }]} pointerEvents="box-none">
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          hitSlop={10}
          style={[
            styles.backButton,
            {
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(28, 30, 33, 0.92)',
              borderColor: isLight ? '#E7E4DC' : '#2D2D30',
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.brandPill,
          {
            top: insets.top + 8,
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(28, 30, 33, 0.88)',
            borderColor: isLight ? '#E7E4DC' : '#2D2D30',
          },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.brandMark, { backgroundColor: isLight ? '#163A5F' : '#AFCBE5' }]}>
          <Ionicons name="leaf" size={10} color={isLight ? '#F8F7F4' : '#0B1E2E'} />
        </View>
        <Text style={[styles.brandText, { color: theme.text }]}>eco</Text>
      </View>

      <ForgotPasswordModal
        visible={forgotOpen}
        initialEmail={email.trim()}
        onClose={() => setForgotOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  floatingBackWrap: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandPill: {
    position: 'absolute',
    right: 16,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  brandMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 2,
    paddingBottom: 16,
  },
  scrollContentShort: {
    paddingTop: 2,
    paddingBottom: 8,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  heroPanel: {
    width: '100%',
    height: 280,
    borderRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroPanelShort: {
    height: 252,
    borderRadius: 24,
  },
  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -78,
    right: -36,
    opacity: 0.75,
  },
  heroArt: {
    width: '100%',
    height: '100%',
  },

  headingBlock: {
    marginTop: 20,
    marginBottom: 18,
  },
  headingBlockShort: {
    marginTop: 16,
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -1.1,
  },
  titleShort: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
    maxWidth: 360,
  },

  form: { gap: 12 },
  formShort: { gap: 9 },

  forgot: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
  },

  primaryButton: {
    height: 54,
    borderRadius: 16,
    marginTop: 2,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 3,
  },
  primaryButtonShort: {
    height: 50,
    borderRadius: 15,
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  primaryIcon: {
    position: 'absolute',
    right: 11,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 14,
  },
  dividerShort: {
    marginTop: 12,
    marginBottom: 9,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  googleButton: {
    height: 52,
    borderRadius: 16,
  },
  googleButtonShort: {
    height: 48,
    borderRadius: 15,
  },

  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerShort: {
    marginTop: 14,
  },
  footerPrompt: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  footerAction: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '700',
  },
});
