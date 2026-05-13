import { RESULTS } from 'react-native-permissions';
import type { PermissionStatus as RNPermissionStatus } from 'react-native-permissions';

export const PERMISSION_STATUS = {
  ...RESULTS,
  CHECKING: 'checking',
} as const;

export type PermissionStatus = RNPermissionStatus | 'checking';
