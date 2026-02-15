import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { api } from '../api';
import { REFRESH_TOKEN_LOCAL_STORAGE_KEY } from '../stores/useAuthStore';
import { PLATFORM } from '../../../shared/platform';

const getDeviceName = () =>
  navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser';

export function useDeviceRegistration() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    if (!refreshToken) return;

    const syncDevice = async () => {
      try {
        await api.devices.syncDevice(refreshToken, PLATFORM.WEB, { deviceName: getDeviceName() });
        console.log('✅ device synced');
      } catch (err) {
        console.warn('⚠️ device sync failed:', err);
      }
    };

    syncDevice();
  }, [isAuthenticated]);
}
