import type { Platform } from '../constants/platform';

export interface Device {
  jti: string;
  platform: Platform;
  deviceName: string | null;
  lastSeen: string;
  createdAt: string;
}
