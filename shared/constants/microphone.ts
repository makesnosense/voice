import type { ObjectValues } from '../types';

export const MIC_PERMISSION_STATUS = {
  IDLE: 'idle',
  REQUESTING: 'requesting',
  GRANTED: 'granted',
  DENIED: 'denied',
  NOT_SUPPORTED: 'not-supported',
} as const;

export type MicPermissionStatus = ObjectValues<typeof MIC_PERMISSION_STATUS>;
