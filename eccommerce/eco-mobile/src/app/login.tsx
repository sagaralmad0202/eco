import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/auth-context';
import { API_BASE_URL } from '@/services/auth-api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  const { login, loginWithGoogle, loginWithOAuthCode, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoRedirectTimer, setAutoRedirectTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Google Sign-In state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
      setGoogleEmail(params.email);
    }
  }, [params.email]);

  useEffect(() => {
    return () => {
      if (autoRedirectTimer) {
        clearTimeout(autoRedirectTimer);
      }
    };
  }, [autoRedirectTimer]);

  const handleGooglePress = () => {
    setErrorMessage(null);
    if (!googleEmail && email.trim()) {
      setGoogleEmail(email.trim());
    }
    setShowGoogleModal(true);
  };

  const handleConfirmGoogle = async (overrideEmail?: string, overrideName?: string) => {
    const cleanGoogleEmail = (overrideEmail || googleEmail).trim();
    if (!cleanGoogleEmail) {
      setErrorMessage('Please enter your Google account email');
      return;
    }

    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle(cleanGoogleEmail, overrideName || googleName.trim() || undefined);
      if (res.success) {
        setShowGoogleModal(false);
        router.replace('/profile');
      } else {
        setErrorMessage(res.error || 'Google login failed');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const result = await login(cleanEmail.toLowerCase(), password);

    if (result.success) {
      router.replace('/profile');
    } else {
      const err = result.error || 'Account not found or invalid credentials.';
      setErrorMessage(err);

      // Auto-suggest navigation to signup like the web app
      if (err.toLowerCase().includes('not found') || err.toLowerCase().includes('invalid')) {
        const timer = setTimeout(() => {
          router.push({
            pathname: '/signup',
            params: { email: cleanEmail },
          });
        }, 2200);
        setAutoRedirectTimer(timer);
      }
    }
  };

  const handleGoToSignup = () => {
    if (autoRedirectTimer) clearTimeout(autoRedirectTimer);
    router.push({
      pathname: '/signup',
      params: { email: email.trim() },
    });
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={theme.background} />

      {/* Header with Back Button */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#E5E7EB' : '#374151' }]}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.logoBadge}>
          <Ionicons name="checkmark-circle" size={18} color={theme.text} />
          <Text style={[styles.logoText, { color: theme.text }]}>eco</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Section */}
          <View style={styles.headerBlock}>
            <Text style={[styles.heading, { color: theme.text }]}>Login</Text>
            <Text style={[styles.subheading, { color: theme.textSecondary }]}>
              Welcome back! Please enter your details.
            </Text>
          </View>

          {/* Error Alert Banner */}
          {errorMessage && (
            <View style={[styles.alertBanner, { backgroundColor: isLight ? '#FEF3C7' : '#78350F33', borderColor: isLight ? '#FDE68A' : '#B45309' }]}>
              <View style={styles.alertContent}>
                <Ionicons name="alert-circle" size={18} color="#D97706" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertTitle, { color: isLight ? '#92400E' : '#FDE68A' }]}>
                    Invalid Login or Account Not Found
                  </Text>
                  <Text style={[styles.alertDesc, { color: isLight ? '#B45309' : '#FCD34D' }]}>
                    {errorMessage}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleGoToSignup}
                style={styles.alertActionBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.alertActionText}>Go to Sign Up Now →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Social Google Login Button */}
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#E5E7EB' : '#374151' }]}
            activeOpacity={0.8}
            onPress={handleGooglePress}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#EA4335" style={{ marginRight: 10 }} />
            ) : (
              <Ionicons name="logo-google" size={18} color="#EA4335" style={styles.socialIcon} />
            )}
            <Text style={[styles.socialText, { color: theme.text }]}>Continue with Google</Text>
          </TouchableOpacity>

          {/* OR Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: isLight ? '#E5E7EB' : '#374151' }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: isLight ? '#E5E7EB' : '#374151' }]} />
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#E5E7EB' : '#374151' }]}>
                <Ionicons name="mail-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="example@example.com"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: theme.text }]}>Password</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={[styles.forgotText, { color: isLight ? '#4F46E5' : '#818CF8' }]}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#E5E7EB' : '#374151' }]}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={[
                styles.submitBtn,
                { backgroundColor: theme.text },
                isLoading && { opacity: 0.7 },
              ]}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.backgroundElement} size="small" />
              ) : (
                <Text style={[styles.submitBtnText, { color: theme.backgroundElement }]}>
                  Continue
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Redirect Link */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleGoToSignup} activeOpacity={0.7}>
                <Text style={[styles.footerLink, { color: isLight ? '#2563EB' : '#60A5FA' }]}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Direct Google Sign-In Sheet Modal */}
      <Modal
        visible={showGoogleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#E5E7EB' : '#374151' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalGoogleIconWrap}>
                <Ionicons name="logo-google" size={24} color="#EA4335" />
              </View>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Sign in with Google</Text>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                Choose an account to continue to eco
              </Text>
            </View>

            {/* Quick One-Tap Account */}
            <TouchableOpacity
              style={[
                styles.accountOptionCard,
                {
                  backgroundColor: isLight ? '#F9FAFB' : '#1F2937',
                  borderColor: isLight ? '#E5E7EB' : '#374151',
                },
              ]}
              activeOpacity={0.7}
              disabled={isGoogleLoading}
              onPress={() => handleConfirmGoogle('sagaralmad1997@gmail.com', 'Sagar Almad')}
            >
              <View style={styles.accountAvatar}>
                <Ionicons name="person" size={17} color="#EA4335" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.accountName, { color: theme.text }]}>Sagar Almad</Text>
                <Text style={[styles.accountEmail, { color: theme.textSecondary }]}>
                  sagaralmad1997@gmail.com
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.modalDividerRow}>
              <View style={[styles.modalDividerLine, { backgroundColor: isLight ? '#E5E7EB' : '#374151' }]} />
              <Text style={[styles.modalDividerText, { color: theme.textSecondary }]}>OR USE ANOTHER EMAIL</Text>
              <View style={[styles.modalDividerLine, { backgroundColor: isLight ? '#E5E7EB' : '#374151' }]} />
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Google Email</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isLight ? '#FAF9F6' : '#1C1B19', borderColor: isLight ? '#E5E7EB' : '#374151' }]}>
                  <Ionicons name="mail-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="user@gmail.com"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={googleEmail}
                    onChangeText={setGoogleEmail}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.text, marginTop: 4 }]}
                activeOpacity={0.8}
                onPress={() => handleConfirmGoogle()}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color={theme.backgroundElement} size="small" />
                ) : (
                  <Text style={[styles.submitBtnText, { color: theme.backgroundElement }]}>
                    Continue with this Account
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                activeOpacity={0.7}
                onPress={() => setShowGoogleModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
  },
  alertBanner: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  alertContent: {
    flexDirection: 'row',
    gap: 10,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  alertActionBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  alertActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    marginBottom: 20,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 25,
    height: 50,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  footerText: {
    fontSize: 13,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalGoogleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalForm: {
    gap: 14,
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  accountAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(234, 67, 53, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountEmail: {
    fontSize: 12,
  },
  modalDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalDividerLine: {
    flex: 1,
    height: 1,
  },
  modalDividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
