import { useRef, useState } from 'react';
import { Platform, TurboModuleRegistry } from 'react-native';
import Constants from 'expo-constants';

import { useAuth } from '@/context/auth-context';

type NitroGooglePackage = typeof import('react-native-nitro-google-signin');

type NativeGoogleResult = {
  available: boolean;
  success: boolean;
  error?: string;
};

let cachedModule: NitroGooglePackage | null | undefined;

function loadNativeModule(): NitroGooglePackage | null {
  if (cachedModule !== undefined) return cachedModule;

  // Expo Go ships without the native Google Sign-In module.
  if (Platform.OS === 'web' || Constants.executionEnvironment === 'storeClient') {
    cachedModule = null;
    return cachedModule;
  }

  try {
    // Let older development builds use the browser sign-in flow.
    cachedModule = TurboModuleRegistry.get('NitroModules')
      ? (require('react-native-nitro-google-signin') as NitroGooglePackage)
      : null;
  } catch {
    cachedModule = null;
  }

  return cachedModule;
}

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/**
 * Native Google Sign-In using react-native-nitro-google-signin.
 * On Android this opens Credential Manager with all Google accounts on the device.
 * On iOS it opens Google's secure Sign-In sheet.
 * In Expo Go, it gracefully falls back to the in-app browser flow.
 */
export function useNativeGoogleAuth() {
  const { loginWithGoogleIdToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const configured = useRef(false);

  const nativeModule = loadNativeModule();
  const isAvailable =
    !!nativeModule &&
    !!WEB_CLIENT_ID &&
    (Platform.OS !== 'ios' || !!IOS_CLIENT_ID);

  const configure = (mod: NitroGooglePackage) => {
    if (configured.current || !WEB_CLIENT_ID) return;

    mod.GoogleOneTapSignIn.configure({
      webClientId: WEB_CLIENT_ID,
      iosClientId: Platform.OS === 'ios' ? IOS_CLIENT_ID || null : null,
      offlineAccess: false,
    });

    configured.current = true;
  };

  const signInWithGoogle = async (): Promise<NativeGoogleResult> => {
    const mod = loadNativeModule();
    if (!mod || !isAvailable) {
      return { available: false, success: false };
    }

    if (isLoading) return { available: true, success: false };

    setIsLoading(true);

    try {
      configure(mod);

      if (Platform.OS === 'android') {
        await mod.GoogleOneTapSignIn.checkPlayServices(true).catch(() => {});
      }

      // Clear any cached session so the account chooser dialog is always shown,
      // allowing the user to select an existing account or add another account.
      await mod.GoogleOneTapSignIn.signOut().catch(() => {});

      // Use createAccount() to display the interactive account chooser with all device accounts
      const response = await mod.GoogleOneTapSignIn.createAccount();

      if (mod.isCancelledResponse(response)) {
        // User dismissed the account sheet; not an error.
        return { available: true, success: false };
      }

      if (!mod.isSuccessResponse(response)) {
        return { available: true, success: false };
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        return {
          available: true,
          success: false,
          error: 'Google did not return an ID token. Please try again.',
        };
      }

      const session = await loginWithGoogleIdToken(idToken);
      return { available: true, ...session };
    } catch (err: unknown) {
      if (mod.isErrorWithCode(err)) {
        if (err.code === mod.statusCodes.SIGN_IN_CANCELLED) {
          // User dismissed or cancelled the Google account chooser; not an error.
          return { available: true, success: false };
        }
        if (err.code === mod.statusCodes.IN_PROGRESS) {
          return {
            available: true,
            success: false,
            error: 'Google sign-in is already in progress.',
          };
        }
        if (err.code === mod.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          return {
            available: true,
            success: false,
            error: 'Google Play Services is not available or outdated on this device.',
          };
        }
      }

      return {
        available: true,
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Google sign-in failed. Please check your internet connection and try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { isAvailable, isLoading, signInWithGoogle };
}
