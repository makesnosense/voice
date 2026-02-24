import { useEffect, useState } from 'react';
import { Platform as RNPlatform } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { keychainStorage } from '../utils/keychain';
import { api } from '../api';
import { getFcmToken } from '../utils/fcm';
import { PLATFORM } from '../../../shared/constants/platform';

const getNativePlatform = () =>
  RNPlatform.OS === 'ios' ? PLATFORM.IOS : PLATFORM.ANDROID;

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
        });
        console.log('✅ device synced');
      } catch (err) {
        console.warn('⚠️ device sync failed:', err);
      }
    };

    syncDevice();
  }, [isAuthenticated, fcmToken]);
};
