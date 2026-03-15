import type { ObjectValues } from '../types';

export const ROOM_CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  JOINED: 'joined',
  ROOM_NOT_FOUND: 'room-not-found',
  ROOM_FULL: 'room-full',
} as const;

export type RoomConnectionStatus = ObjectValues<typeof ROOM_CONNECTION_STATUS>;
