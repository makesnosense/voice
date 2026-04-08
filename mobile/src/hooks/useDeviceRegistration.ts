import { useEffect, useState } from 'react';
import { Platform as RNPlatform } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { keychainStorage } from '../utils/keychain';
import { api } from '../api';
import { getFcmToken } from '../utils/fcm';
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

export const useDeviceRegistration = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    getFcmToken().then(setFcmToken);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !fcmToken) return;

    const syncDevice = async () => {
      const refreshToken = await keychainStorage.getRefreshToken();
      if (!refreshToken) return;

      try {
        await api.devices.syncDevice(refreshToken, getNativePlatform(), {
          fcmToken,
          deviceName: getDeviceName(),
        });
        console.log('✅ Device synced');
      } catch (err) {
        console.warn('⚠️ Device sync failed:', err);
      }
    };

    syncDevice();
  }, [isAuthenticated, fcmToken]);
};
