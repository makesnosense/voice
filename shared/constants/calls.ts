import type { ObjectValues } from '../types/core';

export const INVITE_TIMEOUT_MS = 60_000;

export const CALL_DIRECTION = {
  OUTGOING: 'outgoing',
  INCOMING: 'incoming',
} as const;

export type CallDirection = ObjectValues<typeof CALL_DIRECTION>;

export const CALL_OUTCOME = {
  ANSWERED: 'answered',
  DECLINED: 'declined',
  NO_ANSWER: 'no-answer',
  CANCELLED: 'cancelled',
} as const;

export type CallOutcome = ObjectValues<typeof CALL_OUTCOME>;

export type CallDismissalReason = Extract<CallOutcome, 'declined' | 'no-answer'>;
