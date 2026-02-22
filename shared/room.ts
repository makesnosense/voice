import type { ObjectValues } from './types';

export const ROOM_CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  JOINED: 'joined',
  ERROR: 'error',
  ROOM_FULL: 'room-full',
} as const;

export type RoomConnectionStatus = ObjectValues<typeof ROOM_CONNECTION_STATUS>;
export type RoomConnectionError = Exclude<RoomConnectionStatus, 'connecting' | 'joined'>;
