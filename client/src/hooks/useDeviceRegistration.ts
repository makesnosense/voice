import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { api } from '../api';
import { REFRESH_TOKEN_LOCAL_STORAGE_KEY } from '../utils/auth-storage';
import { PLATFORM } from '../../../shared/constants/platform';

const getBrowserName = (userAgent: string): string => {
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) return 'Opera';
  if (userAgent.includes('Chrome/')) return 'Chrome';
  if (userAgent.includes('Firefox/')) return 'Firefox';
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari';
  return 'Browser';
};

const getOsName = (userAgent: string): string => {
  if (userAgent.includes('Windows NT')) return 'Windows';
  if (userAgent.includes('Mac OS X')) return 'macOS';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Unknown OS';
};

const getDeviceName = (): string => {
  const { userAgent } = navigator;
  return `${getBrowserName(userAgent)} on ${getOsName(userAgent)}`;
};

export function useDeviceRegistration() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    if (!refreshToken) return;

    const syncDevice = async () => {
      try {
        await api.devices.syncDevice(refreshToken, PLATFORM.WEB, { deviceName: getDeviceName() });
        console.log('✅ Device synced');
      } catch (err) {
        console.warn('⚠️ Device sync failed:', err);
      }
    };

    syncDevice();
  }, [isAuthenticated]);
}
