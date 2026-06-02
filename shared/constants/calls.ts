import type { ObjectValues } from '../types/core';

export const CALL_DIRECTION = {
  OUTGOING: 'outgoing',
  INCOMING: 'incoming',
} as const;

export type CallDirection = ObjectValues<typeof CALL_DIRECTION>;

export const CALL_DISMISSAL_REASON = {
  DECLINED: 'declined',
  NO_ANSWER: 'no-answer',
} as const;

export type CallDismissalReason = ObjectValues<typeof CALL_DISMISSAL_REASON>;
