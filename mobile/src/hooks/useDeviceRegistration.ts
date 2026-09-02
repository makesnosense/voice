import { useEffect } from 'react';
import { Platform as RNPlatform } from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';
import { keychainStorage } from '../utils/keychain';
import { api } from '../api';
import { getFcmToken, listenForTokenRefresh } from '../utils/fcm';
import { getVoipPushToken } from '../native/voip-push';
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

const syncDevice = async (options: {
  fcmToken?: string;
  voipPushToken?: string;
}) => {
  const refreshToken = await keychainStorage.getRefreshToken();
  if (!refreshToken) return;
  try {
    await api.devices.syncDevice(refreshToken, getNativePlatform(), {
      ...options,
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

    if (RNPlatform.OS === 'ios') {
      getVoipPushToken().then(token => {
        if (token) syncDevice({ voipPushToken: token });
      });
      return;
    }

    if (RNPlatform.OS !== 'android') return;

    getFcmToken().then(token => {
      if (token) syncDevice({ fcmToken: token });
    });

    // listenForTokenRefresh wraps firebase onTokenRefresh, which returns a
    // function that cancels the subscription — so this is "stop listening",
    // not "listen". useEffect cleanup must call it.
    const unsubscribe = listenForTokenRefresh(token =>
      syncDevice({ fcmToken: token }),
    );

    return unsubscribe;
  }, [isAuthenticated]);
};
