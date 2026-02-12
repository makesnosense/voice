import { create } from 'zustand';
import { keychainStorage } from '../utils/keychain';
import { getUserFromJwt, isTokenExpired } from '../../../shared/jwt-decode';

import type { User } from '../../../shared/auth-types';

const API_BASE_URL = __DEV__
  ? 'https://localhost:3003/api'
  : 'https://voice.k.vu/api';

interface AuthStore {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initialize: () => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  getValidAccessToken: () => Promise<string>;
}

let renewalPromise: Promise<string> | null = null;

const renewAccessToken = async (
  refreshToken: string,
  set: (partial: Partial<AuthStore>) => void,
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error('Token renewal failed');

    const data = await response.json();
    const user = getUserFromJwt(data.accessToken);

    set({ accessToken: data.accessToken, user, isAuthenticated: true });
    return data.accessToken;
  } finally {
    renewalPromise = null;
  }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,

  initialize: async () => {
    const refreshToken = await keychainStorage.getRefreshToken();
    if (!refreshToken) return;

    try {
      await get().getValidAccessToken();
      console.log('✅ session restored');
    } catch {
      console.error('❌ failed to restore session, clearing credentials');
      await get().logout();
    }
  },

  requestOtp: async (email: string) => {
    set({ isLoading: true });
    try {
      console.log(`requesting ${API_BASE_URL}/auth/request-otp`);
      const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `http ${response.status}`);
      }

      console.log('✅ otp sent to', email);
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOtp: async (email: string, code: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) throw new Error('otp verification failed');

      const data = await response.json();
      const user = getUserFromJwt(data.accessToken);
      if (!user) throw new Error('invalid token payload');

      await keychainStorage.setRefreshToken(data.refreshToken);
      set({ accessToken: data.accessToken, user, isAuthenticated: true });

      console.log('✅ authenticated as', user.email);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    const refreshToken = await keychainStorage.getRefreshToken();

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/sessions/current`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        console.warn('⚠️ failed to delete session on server');
      }
    }

    await keychainStorage.clearRefreshToken();
    set({ accessToken: null, user: null, isAuthenticated: false });
    console.log('👋 logged out');
  },

  getValidAccessToken: async () => {
    const { accessToken } = get();

    if (accessToken && !isTokenExpired(accessToken)) return accessToken;

    if (renewalPromise) return renewalPromise;

    const refreshToken = await keychainStorage.getRefreshToken();
    if (!refreshToken) throw new Error('no refresh token available');

    renewalPromise = renewAccessToken(refreshToken, set);
    return renewalPromise;
  },
}));
