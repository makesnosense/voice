import { create } from 'zustand';
import { keychainStorage } from '../utils/keychain';
import { getUserFromJwt, isTokenExpired } from '../../../shared/jwt-decode';
import { ApiError } from '../../../shared/errors';
import { api } from '../api';

import type { User } from '../../../shared/types/auth';

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

export const useAuthStore = create<AuthStore>((set, get) => {
  let renewalPromise: Promise<string> | null = null;

  const renewAccessToken = async (refreshToken: string): Promise<string> => {
    try {
      const { accessToken } = await api.auth.renewAccessToken(refreshToken);
      const user = getUserFromJwt(accessToken);

      set({ accessToken: accessToken, user, isAuthenticated: true });
      return accessToken;
    } finally {
      renewalPromise = null;
    }
  };
  return {
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,

    initialize: async () => {
      let refreshToken: string | null;
      try {
        refreshToken = await keychainStorage.getRefreshToken();
      } catch (error) {
        console.error('❌ failed to read keychain:', error);
        return; // can't do anything, but don't log out
      }
      if (!refreshToken) return;

      try {
        await get().getValidAccessToken();
        console.log('✅ session restored');
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          console.error('❌ Auth rejected by server, clearing credentials');
          await get().logout();
        } else {
          console.error(
            '❌ Session restore failed, keeping credentials:',
            error,
          );
        }
      }
    },

    requestOtp: async (email: string) => {
      set({ isLoading: true });
      try {
        await api.auth.requestOtp(email);

        console.log('✅ otp sent to', email);
      } finally {
        set({ isLoading: false });
      }
    },

    verifyOtp: async (email: string, code: string) => {
      set({ isLoading: true });
      try {
        const { accessToken, refreshToken } = await api.auth.verifyOtp(
          email,
          code,
        );
        const user = getUserFromJwt(accessToken);
        if (!user) throw new Error('invalid token payload');

        await keychainStorage.setRefreshToken(refreshToken);
        set({ accessToken: accessToken, user, isAuthenticated: true });

        console.log('✅ authenticated as', user.email);
      } finally {
        set({ isLoading: false });
      }
    },

    logout: async () => {
      const refreshToken = await keychainStorage.getRefreshToken();

      if (refreshToken) {
        try {
          await api.auth.deleteSession(refreshToken);
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

      renewalPromise = renewAccessToken(refreshToken);
      return renewalPromise;
    },
  };
});
