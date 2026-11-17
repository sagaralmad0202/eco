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
import {
  AuthError,
  AuthField,
  GoogleButton,
} from '@/components/auth/AuthUI';

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const isShort = windowHeight < 900;
  const isLight = theme.background === '#F8F7F4';
  const { signup, isLoading } = useAuth();
  const { isGoogleLoading, signInWithGoogle: signInWithWebGoogle } = useGoogleAuth();
  const nativeGoogle = useNativeGoogleAuth();
  const googleLoading = nativeGoogle.isLoading || isGoogleLoading;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nameInput = useRef<TextInput>(null);
  const emailInput = useRef<TextInput>(null);
  const passwordInput = useRef<TextInput>(null);
  const confirmInput = useRef<TextInput>(null);

  useEffect(() => {
    if (params.email) setEmail(params.email);
  }, [params.email]);

  const handleSubmit = async () => {
    if (isLoading || googleLoading) return;
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || cleanEmail.split('@')[0] || 'User';

    if (!cleanEmail || !password) {
      setErrorMessage('Enter your email and a password to continue.');
      (cleanEmail ? passwordInput : emailInput).current?.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Enter a valid email address.');
      emailInput.current?.focus();
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Use at least 8 characters for your password.');
      passwordInput.current?.focus();
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage('Your password needs at least one letter and one number.');
      passwordInput.current?.focus();
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Those passwords do not match. Try again.');
      confirmInput.current?.focus();
      return;
    }

    Keyboard.dismiss();
    const result = await signup({
      fullName: cleanName,
      email: cleanEmail,
      password,
      confirmPassword,
    });

    if (result.success) {
      router.replace('/profile');
    } else {
      setErrorMessage(result.error || 'Could not create your account. Please try again.');
    }
  };

  const handleGoToLogin = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  };

  const handleGoogle = async () => {
    if (googleLoading || isLoading) return;
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

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const clearError = () => {
    if (errorMessage) setErrorMessage(null);
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
                  source={require('@/assets/images/signup-hero.png')}
                  style={styles.heroArt}
                  resizeMode="contain"
                  accessible={false}
                />
              </View>

              <View style={[styles.headingBlock, isShort && styles.headingBlockShort]}>
                <Text
                  accessibilityRole="header"
                  style={[styles.title, isShort && styles.titleShort, { color: theme.text }]}
                >
                  Create your account
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Save favourites and check out in a heartbeat.
                </Text>
              </View>

              {errorMessage ? <AuthError message={errorMessage} /> : null}

              <View style={[styles.form, isShort && styles.formShort]}>
                <AuthField
                  ref={nameInput}
                  outlined
                  dense
                  label="Full name"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChangeText={(value) => {
                    setFullName(value);
                    clearError();
                  }}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => emailInput.current?.focus()}
                />

                <AuthField
                  ref={emailInput}
                  outlined
                  dense
                  label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    clearError();
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
                  placeholder="Create a password"
                  helper={isShort ? undefined : '8+ characters with a letter and a number.'}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    clearError();
                  }}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onSubmitEditing={() => confirmInput.current?.focus()}
                />

                <AuthField
                  ref={confirmInput}
                  outlined
                  dense
                  label="Confirm password"
                  password
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    clearError();
                  }}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                />

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading || googleLoading}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel="Create account"
                  accessibilityState={{ disabled: isLoading || googleLoading, busy: isLoading }}
                  style={[
                    styles.primaryButton,
                    isShort && styles.primaryButtonShort,
                    {
                      backgroundColor: isLight ? '#163A5F' : '#AFCBE5',
                      shadowColor: isLight ? '#163A5F' : '#000000',
                      opacity: isLoading || googleLoading ? 0.62 : 1,
                    },
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={isLight ? '#FFFFFF' : '#0B1E2E'} />
                  ) : (
                    <>
                      <Text style={[styles.primaryLabel, { color: isLight ? '#FFFFFF' : '#0B1E2E' }]}>
                        Create account
                      </Text>
                      <View
                        style={[
                          styles.primaryIcon,
                          { backgroundColor: isLight ? 'rgba(255, 255, 255, 0.14)' : 'rgba(11, 30, 46, 0.12)' },
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
                <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OR CONTINUE WITH</Text>
                <View style={[styles.rule, { backgroundColor: isLight ? '#E1DED6' : '#2A2C2F' }]} />
              </View>

              <GoogleButton
                onPress={handleGoogle}
                loading={googleLoading}
                disabled={isLoading}
                style={[styles.googleButton, isShort && styles.googleButtonShort]}
              />

              <View style={[styles.footer, isShort && styles.footerShort]}>
                <Text style={[styles.footerPrompt, { color: theme.textSecondary }]}>
                  Already have an account?
                </Text>
                <TouchableOpacity
                  onPress={handleGoToLogin}
                  activeOpacity={0.7}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in to your account"
                >
                  <Text style={[styles.footerAction, { color: isLight ? '#163A5F' : '#AFCBE5' }]}>
                    Sign in
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
    paddingBottom: 12,
  },
  scrollContentShort: {
    paddingTop: 2,
    paddingBottom: 6,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },

  heroPanel: {
    width: '100%',
    height: 184,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroPanelShort: {
    height: 148,
    borderRadius: 22,
  },
  heroGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    top: -66,
    right: -30,
    opacity: 0.75,
  },
  heroArt: {
    width: '100%',
    height: '100%',
  },

  headingBlock: {
    marginTop: 16,
    marginBottom: 16,
  },
  headingBlockShort: {
    marginTop: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  titleShort: {
    fontSize: 27,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 5,
    maxWidth: 360,
  },

  form: { gap: 10 },
  formShort: { gap: 7 },

  primaryButton: {
    height: 52,
    borderRadius: 15,
    marginTop: 4,
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
    height: 48,
    borderRadius: 14,
    marginTop: 2,
  },
  primaryLabel: {
    fontSize: 15.5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  primaryIcon: {
    position: 'absolute',
    right: 11,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    marginBottom: 11,
  },
  dividerShort: {
    marginTop: 10,
    marginBottom: 8,
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
    height: 50,
    borderRadius: 15,
  },
  googleButtonShort: {
    height: 46,
    borderRadius: 14,
  },

  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerShort: {
    marginTop: 10,
  },
  footerPrompt: {
    fontSize: 13,
    lineHeight: 19,
  },
  footerAction: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
});
