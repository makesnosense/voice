import { create } from 'zustand';
import { getUserFromJwt, isTokenExpired } from '../../../shared/jwt-decode';
import axios from 'axios';
import type { StoreApi } from 'zustand';
import type { User } from '../../../shared/auth-types';

import type {
  OtpRequest,
  OtpVerificationRequest,
  OtpVerificationResponse,
  RenewAccessTokenRequest,
  RenewAccessTokenResponse,
} from '../../../shared/auth-types';

const REFRESH_TOKEN_LOCAL_STORAGE_KEY = 'refresh_token';

interface AuthStore {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authSuccessDelay: boolean;

  initialize: () => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  setAuthSuccessDelay: (value: boolean) => void;
  logout: () => void;

  // helper to get valid token (refreshes if needed)
  getValidAccessToken: () => Promise<string>;
}

// a cache to prevent race conditions
// module-scoped so all simultaneous calls to getValidAccessToken() see the same promise
let renewalPromise: Promise<string> | null = null;

const renewAccessToken = async (
  refreshToken: string,
  set: StoreApi<AuthStore>['setState']
): Promise<string> => {
  try {
    const body: RenewAccessTokenRequest = { refreshToken };
    const { data } = await axios.post<RenewAccessTokenResponse>('/api/auth/refresh', body);

    const user = getUserFromJwt(data.accessToken);
    if (!user) {
      throw new Error('invalid token payload');
    }

    set({
      accessToken: data.accessToken,
      user,
      isAuthenticated: true,
    });

    console.log('✅ access token refreshed');
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
  authSuccessDelay: false,

  initialize: async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    if (!refreshToken) {
      return;
    }

    try {
      await get().getValidAccessToken();
      console.log('✅ session restored');
    } catch (error) {
      console.error('❌ failed to restore session:', error);
      get().logout();
    }
  },

  requestOtp: async (email: string) => {
    set({ isLoading: true });
    try {
      const body: OtpRequest = { email };
      await axios.post('/api/auth/request-otp', body);
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
      const body: OtpVerificationRequest = { email, code };
      const { data } = await axios.post<OtpVerificationResponse>('/api/auth/verify-otp', body);

      const user = getUserFromJwt(data.accessToken);
      if (!user) {
        throw new Error('invalid token payload');
      }

      localStorage.setItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY, data.refreshToken);

      set({
        accessToken: data.accessToken,
        user,
        isAuthenticated: true,
      });

      // 🆕 register device after successful auth
      try {
        await axios.post('/api/devices/register', {
          refreshToken: data.refreshToken,
          platform: 'web',
          deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
        });
        console.log('✅ device registered');
      } catch (error) {
        // non-fatal - log but don't fail login
        console.warn('⚠️ device registration failed:', error);
      }

      console.log('✅ authenticated as', user.email);
    } catch (error) {
      console.error('❌ failed to verify OTP:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setAuthSuccessDelay: (value: boolean) => {
    set({ authSuccessDelay: value });
  },

  logout: async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);

    // 🆕 delete session on server before clearing local state
    if (refreshToken) {
      try {
        await axios.delete('/api/auth/sessions/current', {
          data: { refreshToken },
        });
        console.log('✅ session deleted on server');
      } catch (error) {
        console.warn('⚠️ failed to delete session on server:', error);
      }
    }

    localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      authSuccessDelay: false,
    });
    console.log('👋 logged out');
  },

  getValidAccessToken: async () => {
    const { accessToken } = get();

    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    }

    // if refresh already in progress, wait for it
    if (renewalPromise) {
      return renewalPromise;
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    if (!refreshToken) {
      throw new Error('no refresh token available');
    }

    renewalPromise = renewAccessToken(refreshToken, set);
    return renewalPromise;
  },
}));
