import type { ObjectValues } from '../../../shared/types';

export const PERMISSION_STATUS = {
  CHECKING: 'checking',
  GRANTED: 'granted',
  DENIED: 'denied',
} as const;

export type PermissionStatus = ObjectValues<typeof PERMISSION_STATUS>;

export interface PermissionState {
  status: PermissionStatus;
}

export interface AppPermissions {
  notificationsPermission: PermissionState;
  microphonePermission: PermissionState;
  allGranted: boolean;
  requestAll: () => Promise<void>;
}
