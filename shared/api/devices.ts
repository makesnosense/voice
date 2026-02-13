import { ApiBase } from './base';
import type { Platform } from '../platform';

export class DevicesApi extends ApiBase {
  registerDevice(
    refreshToken: string,
    platform: Platform,
    fcmToken?: string,
    deviceName?: string
  ): Promise<void> {
    return this.apiFetch('/devices/register', {
      method: 'POST',
      body: JSON.stringify({ refreshToken, platform, fcmToken, deviceName }),
    });
  }
}
