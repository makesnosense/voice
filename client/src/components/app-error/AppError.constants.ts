import type { ObjectValues } from '../../../../shared/types';

export const APP_ERROR = {
  ROOM_NOT_FOUND: 'room-not-found',
  ROOM_FULL: 'room-full',
  UNAUTHORIZED: 'unauthorized',
} as const;

export type AppErrorType = ObjectValues<typeof APP_ERROR>;
