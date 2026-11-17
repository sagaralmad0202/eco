import { useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { useAuth } from '@/context/auth-context';
import { authApi } from '@/services/auth-api';

WebBrowser.maybeCompleteAuthSession();

type GoogleAuthResult = { success: boolean; error?: string };

/**
 * Browser OAuth flow for web and as the fallback when a native build is not
 * available (for example, when the app is opened in Expo Go).
 */
export function useGoogleAuth() {
  const { loginWithOAuthCode } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
    if (isGoogleLoading) return { success: false };

    setIsGoogleLoading(true);

    try {
      const returnUrl = Linking.createURL('oauth');
      // Ask the backend for the Google URL, then open Google directly. The
      // system auth sheet is branded accounts.google.com instead of localhost.
      const googleUrl = await authApi.oauthAuthorizationUrl('google', returnUrl);
      const session = await WebBrowser.openAuthSessionAsync(googleUrl, returnUrl);

      if (session.type !== 'success') {
        // Closing the provider sheet is not an error; the user chose not to continue.
        return { success: false };
      }

      const params = Linking.parse(session.url).queryParams ?? {};
      const rawError = params.error;
      const providerError = Array.isArray(rawError) ? rawError[0] : rawError;

      if (providerError) {
        // User cancelled on Google's consent / account chooser page
        if (
          providerError === 'access_denied' ||
          providerError.toLowerCase().includes('cancel') ||
          providerError.toLowerCase().includes('denied')
        ) {
          return { success: false };
        }
        return { success: false, error: providerError };
      }

      const rawCode = params.code;
      const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;

      if (!code) {
        return { success: false, error: 'Google did not return a sign-in code. Please try again.' };
      }

      return await loginWithOAuthCode(code);
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Google sign-in failed. Please try again.',
      };
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return { isGoogleLoading, signInWithGoogle };
}
