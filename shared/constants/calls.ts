import type { ObjectValues } from '../types/core';

export const CALL_DIRECTION = {
  OUTGOING: 'outgoing',
  INCOMING: 'incoming',
} as const;

export type CallDirection = ObjectValues<typeof CALL_DIRECTION>;
