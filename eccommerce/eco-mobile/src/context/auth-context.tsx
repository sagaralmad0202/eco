import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, authStorage, User } from '@/services/auth-api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (payload: {
    fullName?: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (email: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOAuthCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  loginWithOAuthCode: async () => ({ success: false }),
  logout: async () => {},
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      if (response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Invalid credentials or server error',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: {
    fullName?: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(payload);
      if (response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.message || 'Signup failed' };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to create account. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (email: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.loginWithGoogleMobile({ email, fullName });
      if (response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.message || 'Google login failed' };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Google login failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuthCode = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.exchangeOAuthCode(code);
      if (response.data?.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.message || 'OAuth exchange failed' };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to exchange Google login credentials.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore logout errors
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithOAuthCode,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
