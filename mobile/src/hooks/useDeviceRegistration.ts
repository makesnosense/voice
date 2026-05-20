import { useEffect } from 'react';
import { Platform as RNPlatform } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { keychainStorage } from '../utils/keychain';
import { api } from '../api';
import { getFcmToken, listenForTokenRefresh } from '../utils/fcm';
import { PLATFORM } from '../../../shared/constants/platform';

const getNativePlatform = () =>
  RNPlatform.OS === 'ios' ? PLATFORM.IOS : PLATFORM.ANDROID;

const getDeviceName = (): string | undefined => {
  if (RNPlatform.OS === 'android') {
    const { Brand, Model } = RNPlatform.constants as {
      Brand?: string;
      Model?: string;
    };
    if (Brand && Model) {
      const brand = Brand.charAt(0).toUpperCase() + Brand.slice(1);
      return `${brand} ${Model}`;
    }
    return Model ?? Brand;
  }
  // iOS: Platform.constants doesn't expose model — undefined for now,
  // will be filled in when iOS support is added via react-native-device-info
  return undefined;
};

const syncDevice = async (token: string) => {
  const refreshToken = await keychainStorage.getRefreshToken();
  if (!refreshToken) return;
  try {
    await api.devices.syncDevice(refreshToken, getNativePlatform(), {
      fcmToken: token,
      deviceName: getDeviceName(),
    });
    console.log('✅ Device synced');
  } catch (err) {
    console.warn('⚠️ Device sync failed:', err);
  }
};

export const useDeviceRegistration = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    getFcmToken().then(token => {
      if (token) syncDevice(token);
    });
    const unsubscribe = listenForTokenRefresh(syncDevice);
    return unsubscribe;
  }, [isAuthenticated]);
};
