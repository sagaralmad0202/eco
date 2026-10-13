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

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  const { signup, loginWithGoogle, loginWithOAuthCode, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const res = await loginWithGoogle(
        cleanGoogleEmail,
        overrideName || googleName.trim() || fullName.trim() || undefined
      );
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || cleanEmail.split('@')[0] || 'User';

    if (!cleanEmail || !password) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage('Password must contain at least one letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const result = await signup({
      fullName: cleanName,
      email: cleanEmail,
      password,
      confirmPassword,
    });

    if (result.success) {
      router.replace('/profile');
    } else {
      setErrorMessage(result.error || 'Failed to create account. Please try again.');
    }
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
            <Text style={[styles.heading, { color: theme.text }]}>Sign up</Text>
            <Text style={[styles.subheading, { color: theme.textSecondary }]}>
              Create your account and start exploring our collections.
            </Text>
          </View>

          {/* Error Alert Banner */}
          {errorMessage && (
            <View style={[styles.alertBanner, { backgroundColor: isLight ? '#FEE2E2' : '#7F1D1D33', borderColor: isLight ? '#FECACA' : '#991B1B' }]}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertDesc, { color: isLight ? '#991B1B' : '#FCA5A5' }]}>
                  {errorMessage}
                </Text>
              </View>
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
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#E5E7EB' : '#374151' }]}>
                <Ionicons name="person-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="John Doe"
                  placeholderTextColor={theme.textSecondary}
                  value={fullName}
                  onChangeText={(val) => {
                    setFullName(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
              </View>
            </View>

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
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#E5E7EB' : '#374151' }]}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="At least 8 characters (letter + number)"
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

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#E5E7EB' : '#374151' }]}>
                <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Re-enter your password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
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

            {/* Sign In Redirect Link */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
                <Text style={[styles.footerLink, { color: isLight ? '#2563EB' : '#60A5FA' }]}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fallback Google Sign-In Modal */}
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
    marginBottom: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  alertDesc: {
    fontSize: 13,
    fontWeight: '500',
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
    gap: 16,
  },
  inputGroup: {
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
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
    marginTop: 10,
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
