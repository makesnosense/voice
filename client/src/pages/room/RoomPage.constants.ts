import type { ObjectValues } from "../../../../shared/types";

export const CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  JOINED: 'joined',
  ERROR: 'error',
  ROOM_FULL: 'room-full',
} as const;

export type ConnectionStatus = ObjectValues<typeof CONNECTION_STATUS>;
export type ConnectionError = Exclude<ConnectionStatus, 'connecting' | 'joined'>;
