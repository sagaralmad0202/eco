import Constants from 'expo-constants';
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

function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // On physical device or emulator, Constants.expoConfig?.hostUri
  // contains the LAN IP of the computer running Metro (e.g. "192.168.1.11:8081")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }

  // Fallback to local machine IP
  return 'http://192.168.1.11:5000/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const authStorage = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => {
    accessToken = token;
  },
  getRefreshToken: () => refreshToken,
  setRefreshToken: (token: string | null) => {
    refreshToken = token;
  },
  clear: () => {
    accessToken = null;
    refreshToken = null;
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      authStorage.setAccessToken(result.data.accessToken);
    }
    if (result.data?.refreshToken) {
      authStorage.setRefreshToken(result.data.refreshToken);
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
      authStorage.setAccessToken(result.data.accessToken);
    }
    if (result.data?.refreshToken) {
      authStorage.setRefreshToken(result.data.refreshToken);
    }

    return result;
  },

  async getMe(): Promise<{ success: boolean; data?: { user: User }; user?: User }> {
    return request('/auth/me', {
      method: 'GET',
    });
  },

  async exchangeOAuthCode(code: string): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/auth/oauth/exchange', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });

    if (result.data?.accessToken) {
      authStorage.setAccessToken(result.data.accessToken);
    }
    if (result.data?.refreshToken) {
      authStorage.setRefreshToken(result.data.refreshToken);
    }

    return result;
  },

  async loginWithGoogleMobile(payload: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/auth/oauth/mobile', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'google',
        ...payload,
      }),
    });

    if (result.data?.accessToken) {
      authStorage.setAccessToken(result.data.accessToken);
    }
    if (result.data?.refreshToken) {
      authStorage.setRefreshToken(result.data.refreshToken);
    }

    return result;
  },

  async logout(): Promise<{ success: boolean; message?: string }> {
    const currentRefresh = authStorage.getRefreshToken();
    authStorage.clear();
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
