import { ApiBase } from './base';
import type { Platform } from '../constants/platform';
import type { Device } from '../types/devices';

export class DevicesApi extends ApiBase {
  syncDevice(
    refreshToken: string,
    platform: Platform,
    options?: { fcmToken?: string; deviceName?: string }
  ): Promise<void> {
    return this.apiFetch('/devices', {
      method: 'POST',
      body: JSON.stringify({ refreshToken, platform, ...options }),
    });
  }

  getDevices(accessToken: string): Promise<Device[]> {
    return this.apiFetch<Device[]>('/devices', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
