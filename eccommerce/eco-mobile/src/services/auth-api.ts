import Constants from 'expo-constants';
import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  avatar?: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
  message?: string;
  errors?: Array<{ path?: string[]; message: string }>;
}

interface TokenResponse {
  success: boolean;
  data?: { accessToken: string; refreshToken: string };
  message?: string;
}

function resolveApiBaseUrl(): string {
  let url = process.env.EXPO_PUBLIC_API_URL;

  if (!url) {
    if (Platform.OS === 'web') {
      url = 'http://localhost:5000/api';
    } else {
      const hostUri = Constants.expoConfig?.hostUri;
      if (hostUri) {
        const ip = hostUri.split(':')[0];
        url = `http://${ip}:5000/api`;
      } else {
        url = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
      }
    }
  }

  // On Android, "localhost" and "127.0.0.1" point to the Android device/emulator itself,
  // NOT the computer running the backend server.
  if (Platform.OS === 'android' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
    // In Android emulator, 10.0.2.2 maps directly to the host machine loopback.
    // On physical devices, Metro's host LAN IP reaches the host machine.
    const hostTarget =
      metroHost && metroHost !== 'localhost' && metroHost !== '127.0.0.1'
        ? metroHost
        : '10.0.2.2';
    url = url.replace(/localhost|127\.0\.0\.1/g, hostTarget);
  }

  return url;
}

export const API_BASE_URL = resolveApiBaseUrl();

let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenStorageReady: Promise<void> | null = null;

const ACCESS_TOKEN_KEY = 'eco.access-token';
const REFRESH_TOKEN_KEY = 'eco.refresh-token';

type SecureStoreModule = typeof import('expo-secure-store');
let cachedSecureStore: SecureStoreModule | null | undefined;

function getSecureStore(): SecureStoreModule | null {
  if (cachedSecureStore !== undefined) return cachedSecureStore;
  if (Platform.OS === 'web') {
    cachedSecureStore = null;
    return null;
  }
  try {
    // The JS package requires its native module during import. Check first so
    // an older development build can still use the in-memory session fallback.
    cachedSecureStore = requireOptionalNativeModule('ExpoSecureStore')
      ? (require('expo-secure-store') as SecureStoreModule)
      : null;
  } catch {
    cachedSecureStore = null;
  }
  return cachedSecureStore;
}

function initializeTokenStorage(): Promise<void> {
  if (!tokenStorageReady) {
    tokenStorageReady = (async () => {
      const store = getSecureStore();
      if (!store) return;
      try {
        [accessToken, refreshToken] = await Promise.all([
          store.getItemAsync(ACCESS_TOKEN_KEY),
          store.getItemAsync(REFRESH_TOKEN_KEY),
        ]);
      } catch {
        // Fallback to in-memory tokens
      }
    })();
  }
  return tokenStorageReady;
}

async function persistToken(key: string, value: string | null): Promise<void> {
  const store = getSecureStore();
  if (!store) return;
  try {
    if (value) await store.setItemAsync(key, value);
    else await store.deleteItemAsync(key);
  } catch {
    // Fallback: token remains stored in-memory
  }
}

export const authStorage = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  initialize: initializeTokenStorage,
  setTokens: async (access: string, refresh: string) => {
    await initializeTokenStorage();
    accessToken = access;
    refreshToken = refresh;
    await Promise.all([
      persistToken(ACCESS_TOKEN_KEY, access),
      persistToken(REFRESH_TOKEN_KEY, refresh),
    ]);
  },
  clear: async () => {
    await initializeTokenStorage();
    accessToken = null;
    refreshToken = null;
    await Promise.all([
      persistToken(ACCESS_TOKEN_KEY, null),
      persistToken(REFRESH_TOKEN_KEY, null),
    ]);
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  await initializeTokenStorage();
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const method = options.method || 'GET';
  console.log(`📡 [NETWORK REQ] ${method} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  console.log(`✅ [NETWORK RES] ${response.status} ${method} ${url}`);

  const contentType = response.headers.get('content-type');
  let data: any = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message = 'An error occurred';
    if (data && typeof data === 'object') {
      if (data.message) {
        message = data.message;
      } else if (Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors[0].message || data.errors[0];
      }
    } else if (typeof data === 'string' && data) {
      message = data;
    }
    const error: any = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

export const authApi = {
  async register(payload: {
    fullName?: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result.data?.accessToken) {
      await authStorage.setTokens(result.data.accessToken, result.data.refreshToken || '');
    }

    return result;
  },

  async login(payload: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result.data?.accessToken) {
      await authStorage.setTokens(result.data.accessToken, result.data.refreshToken || '');
    }

    return result;
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    return request<{ success: boolean; message?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async getMe(): Promise<{ success: boolean; data?: { user: User }; user?: User }> {
    return request('/auth/me', {
      method: 'GET',
    });
  },

  async refreshSession(): Promise<TokenResponse> {
    const currentRefreshToken = authStorage.getRefreshToken();
    if (!currentRefreshToken) throw new Error('No refresh token is available.');

    const result = await request<TokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });
    if (!result.data?.accessToken || !result.data.refreshToken) {
      throw new Error(result.message || 'The session could not be refreshed.');
    }

    await authStorage.setTokens(result.data.accessToken, result.data.refreshToken);
    return result;
  },

  oauthStartUrl(provider: string, returnUrl: string): string {
    return `${API_BASE_URL}/auth/oauth/${provider}?return_url=${encodeURIComponent(returnUrl)}`;
  },

  async oauthAuthorizationUrl(provider: string, returnUrl: string): Promise<string> {
    const result = await request<{ success: boolean; url: string }>(
      `/auth/oauth/${provider}/url?return_url=${encodeURIComponent(returnUrl)}`,
      { method: 'GET' }
    );
    return result.url;
  },

  async exchangeOAuthCode(code: string): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/auth/oauth/exchange', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });

    if (result.data?.accessToken) {
      await authStorage.setTokens(result.data.accessToken, result.data.refreshToken || '');
    }

    return result;
  },

  async loginWithGoogleIdToken(idToken: string): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/auth/oauth/google/native', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    if (result.data?.accessToken) {
      await authStorage.setTokens(result.data.accessToken, result.data.refreshToken || '');
    }

    return result;
  },

  async logout(): Promise<{ success: boolean; message?: string }> {
    const currentRefresh = authStorage.getRefreshToken();
    await authStorage.clear();
    try {
      await Promise.race([
        request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: currentRefresh || undefined }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
      ]);
    } catch (e) {
      // Ignore network errors or timeout during logout
    }
    return { success: true };
  },
};
