import type { ObjectValues } from '../../../shared/types/core';

export const PERMISSION_STATUS = {
  CHECKING: 'checking',
  GRANTED: 'granted',
  DENIED: 'denied',
} as const;

export type PermissionStatus = ObjectValues<typeof PERMISSION_STATUS>;
