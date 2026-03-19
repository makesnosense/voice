import { create } from 'zustand';
import { getUserFromJwt, isTokenExpired } from '../jwt-decode';
import { ApiError } from '../errors';
import type { Api } from '../api';
import type { TokenStorage, User } from '../types/auth';

export interface AuthStore {
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

export function createAuthStore(storage: TokenStorage, api: Api) {
  return create<AuthStore>((set, get) => {
    let renewalPromise: Promise<string> | null = null;

    const renewAccessToken = async (refreshToken: string): Promise<string> => {
      try {
        const { accessToken } = await api.auth.renewAccessToken(refreshToken);
        const user = getUserFromJwt(accessToken);
        if (!user) throw new Error('invalid token payload');

        set({ accessToken, user, isAuthenticated: true });
        console.log('✅ access token refreshed');
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
          refreshToken = await storage.getRefreshToken();
        } catch (error) {
          console.error('❌ failed to read token storage:', error);
          return;
        }
        if (!refreshToken) return;

        try {
          await get().getValidAccessToken();
          console.log('✅ session restored');
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            console.error('❌ auth rejected by server, clearing credentials');
            await get().logout();
          } else {
            console.error('❌ session restore failed, keeping credentials:', error);
          }
        }
      },

      requestOtp: async (email: string) => {
        set({ isLoading: true });
        try {
          await api.auth.requestOtp(email);
          console.log('✅ OTP sent to', email);
        } catch (error) {
          console.error('❌ failed to request OTP:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (email: string, code: string) => {
        set({ isLoading: true });
        try {
          const { accessToken, refreshToken } = await api.auth.verifyOtp(email, code);
          const user = getUserFromJwt(accessToken);
          if (!user) throw new Error('invalid token payload');

          await storage.setRefreshToken(refreshToken);
          set({ accessToken, user, isAuthenticated: true });
          console.log('✅ authenticated as', user.email);
        } catch (error) {
          console.error('❌ failed to verify OTP:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const refreshToken = await storage.getRefreshToken();
        if (refreshToken) {
          try {
            await api.auth.deleteSession(refreshToken);
            console.log('✅ session deleted on server');
          } catch {
            console.warn('⚠️ failed to delete session on server');
          }
        }

        await storage.clearRefreshToken();
        set({ accessToken: null, user: null, isAuthenticated: false });
        console.log('👋 logged out');
      },

      getValidAccessToken: async () => {
        const { accessToken } = get();
        if (accessToken && !isTokenExpired(accessToken)) return accessToken;

        if (renewalPromise) return renewalPromise;

        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) throw new Error('no refresh token available');

        renewalPromise = renewAccessToken(refreshToken);
        return renewalPromise;
      },
    };
  });
}
