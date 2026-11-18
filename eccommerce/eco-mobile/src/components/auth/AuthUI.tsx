import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

const ACTION_BLUE = '#163A5F';
const ACTION_BLUE_DARK = '#2C5F8E';
const LIGHT_FIELD = '#F1EFE9';
const LIGHT_LINE = '#E7E4DC';
const DARK_FIELD = '#1C1E21';
const DARK_LINE = '#2D2D30';
const LIGHT_PLACEHOLDER = '#9A978F';
const DARK_PLACEHOLDER = '#7C7F84';

function usePalette() {
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  return {
    theme,
    isLight,
    action: isLight ? ACTION_BLUE : ACTION_BLUE_DARK,
    field: isLight ? LIGHT_FIELD : DARK_FIELD,
    line: isLight ? LIGHT_LINE : DARK_LINE,
    placeholder: isLight ? LIGHT_PLACEHOLDER : DARK_PLACEHOLDER,
  };
}

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  fitContent?: boolean;
  contentVerticalOffset?: number;
  variant?: 'sign-in';
};

export function AuthScreen({
  title,
  subtitle,
  children,
  footer,
  fitContent = false,
  contentVerticalOffset = 0,
  variant,
}: AuthScreenProps) {
  const router = useRouter();
  const { theme } = usePalette();
  const isSignIn = variant === 'sign-in';
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <SafeAreaView
      edges={fitContent || isSignIn ? ['top', 'bottom'] : ['top']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          style={[styles.backButton, isSignIn && styles.signInBackButton]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={isSignIn ? 20 : 22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.brand} pointerEvents="none">
          <FontAwesome5 name="hand-peace" size={16} color={theme.text} solid />
          <Text style={[styles.brandText, isSignIn && styles.signInBrandText, { color: theme.text }]}>eco</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            fitContent && styles.fitScrollContent,
            { paddingBottom: fitContent ? 8 : 24 },
            isSignIn && styles.signInScrollContent,
          ]}
          scrollEnabled={!fitContent || keyboardVisible}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.content,
              contentVerticalOffset !== 0 && {
                transform: [{ translateY: contentVerticalOffset }],
              },
            ]}
          >
            <View style={[styles.headingBlock, isSignIn && styles.signInHeading]}>
              <Text accessibilityRole="header" style={[styles.title, isSignIn && styles.signInTitle, { color: theme.text }]}>{title}</Text>
              <Text style={[styles.subtitle, isSignIn && styles.signInSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
            </View>
            {children}
            {footer}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthFieldProps = TextInputProps & {
  label: string;
  right?: React.ReactNode;
  helper?: string;
  password?: boolean;
  outlined?: boolean;
  dense?: boolean;
  ref?: React.Ref<TextInput>;
};

export function AuthField({ label, right, helper, password, outlined, dense, ref, style, onFocus, onBlur, ...props }: AuthFieldProps) {
  const { theme, field, line, placeholder, isLight, action } = usePalette();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <View style={[styles.labelRow, dense && styles.denseLabelRow]}>
        <Text style={[styles.label, dense && styles.denseLabel, { color: theme.text }]}>{label}</Text>
        {right}
      </View>

      <View
        style={[
          styles.inputShell,
          outlined && styles.outlinedInputShell,
          dense && styles.denseInputShell,
          {
            backgroundColor: outlined ? theme.backgroundElement : field,
            borderColor: focused ? action : line,
          },
        ]}
      >
        <TextInput
          {...props}
          ref={ref}
          accessibilityLabel={props.accessibilityLabel ?? label}
          style={[styles.input, outlined && styles.outlinedInput, dense && styles.denseInput, { color: theme.text }, style]}
          placeholderTextColor={outlined ? theme.textSecondary : placeholder}
          secureTextEntry={password ? !visible : props.secureTextEntry}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
        {password && (
          <TouchableOpacity
            onPress={() => setVisible((current) => !current)}
            activeOpacity={0.7}
            hitSlop={outlined ? undefined : 8}
            style={[styles.eyeButton, outlined && styles.outlinedEyeButton, dense && styles.denseEyeButton]}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={dense ? 17 : 18}
              color={isLight ? '#8A877F' : '#9AA0A6'}
            />
          </TouchableOpacity>
        )}
      </View>

      {helper ? (
        <Text style={[styles.helper, dense && styles.denseHelper, { color: theme.textSecondary }]}>{helper}</Text>
      ) : null}
    </View>
  );
}

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AuthButton({ label, onPress, loading, disabled }: AuthButtonProps) {
  const { action } = usePalette();
  const inactive = loading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={[
        styles.primaryButton,
        {
          backgroundColor: action,
          shadowColor: action,
          opacity: inactive ? 0.6 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryLabel}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function AuthCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  const { theme, line, action } = usePalette();

  return (
    <TouchableOpacity
      onPress={() => onChange(!checked)}
      activeOpacity={0.7}
      style={styles.checkRow}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: checked ? action : 'transparent',
            borderColor: checked ? action : line,
          },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
      </View>
      <Text style={[styles.checkLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function AuthDivider({ label = 'OR CONTINUE WITH' }: { label?: string }) {
  const { theme } = usePalette();
  return <Text style={[styles.divider, { color: theme.textSecondary }]}>{label}</Text>;
}

export function GoogleButton({ onPress, loading, disabled, style }: {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme, isLight, action } = usePalette();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      accessibilityState={{ disabled: !!(loading || disabled), busy: !!loading }}
      style={[
        styles.googleButton,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: isLight ? LIGHT_LINE : DARK_LINE,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={action} style={styles.googleIcon} />
      ) : (
        <Image
          source={require('@/assets/images/google-g.png')}
          style={styles.googleIcon}
          resizeMode="contain"
          accessible={false}
        />
      )}
      <Text style={[styles.googleLabel, { color: theme.text }]}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

export function AuthError({ message }: { message: string }) {
  const { isLight } = usePalette();

  return (
    <View
      style={[
        styles.errorBox,
        {
          backgroundColor: isLight ? '#FDF2F2' : '#2A1618',
          borderColor: isLight ? '#F4D5D5' : '#4C2327',
        },
      ]}
      accessibilityRole="alert"
    >
      <Ionicons name="alert-circle" size={17} color={isLight ? '#C24141' : '#F0A1A1'} style={styles.errorIcon} />
      <Text style={[styles.errorText, { color: isLight ? '#9F2D2D' : '#F0A1A1' }]}>{message}</Text>
    </View>
  );
}

export function AuthFooter({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  const { theme } = usePalette();

  return (
    <View style={styles.footer}>
      <Text style={[styles.footerPrompt, { color: theme.textSecondary }]}>{prompt} </Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} hitSlop={8} accessibilityRole="button">
        <Text style={[styles.footerAction, { color: theme.text }]}>{action}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function AuthModalShell({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { theme, isLight, line } = usePalette();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false} />
        <View
          accessibilityViewIsModal
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: isLight ? LIGHT_LINE : DARK_LINE,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={8}
            style={styles.modalClose}
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
          >
            <Ionicons name="close" size={20} color={theme.text} />
          </TouchableOpacity>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },

  topBar: {
    height: 50,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  signInBackButton: { left: 18 },
  signInBrandText: { fontSize: 22, letterSpacing: -0.6 },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  fitScrollContent: {
    paddingTop: 4,
  },
  signInScrollContent: {
    justifyContent: 'flex-start',
    paddingTop: 42,
    paddingBottom: 32,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  signInHeading: { alignItems: 'flex-start', marginBottom: 26 },
  signInTitle: { fontSize: 38, lineHeight: 44, letterSpacing: -1.6, textAlign: 'left' },
  signInSubtitle: { fontSize: 15, lineHeight: 22, textAlign: 'left' },

  field: { gap: 0 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.05,
  },
  inputShell: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  eyeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  outlinedInputShell: { height: 54, paddingRight: 4 },
  outlinedInput: { fontSize: 16 },
  outlinedEyeButton: { width: 44, height: 44, marginRight: 0 },
  denseLabelRow: { marginBottom: 4 },
  denseLabel: { fontSize: 12.5 },
  denseInputShell: { height: 48, borderRadius: 13, paddingRight: 2 },
  denseInput: { fontSize: 15.5 },
  denseEyeButton: { width: 40, height: 40, marginRight: 0 },
  helper: {
    fontSize: 11.5,
    lineHeight: 14,
    marginTop: 5,
  },
  denseHelper: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 3,
  },

  primaryButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 2,
  },
  primaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: '#FFFFFF',
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    paddingVertical: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  divider: {
    marginTop: 18,
    marginBottom: 12,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.6,
    textAlign: 'center',
  },

  googleButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: { width: 18, height: 18, marginRight: 10 },
  googleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorIcon: { marginTop: 1 },
  errorText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },

  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerPrompt: {
    fontSize: 13,
    lineHeight: 19,
  },
  footerAction: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(17, 17, 17, 0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    paddingTop: 26,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 34,
    elevation: 10,
  },
  modalClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
