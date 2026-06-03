import type { CallDirection, CallOutcome } from '../constants/calls';

export interface CallNotificationPayload {
  callerUserId: string;
  callerEmail: string;
  callerName: string | null;
  roomId: string;
  callId: string;
  sentAt: number;
}

// always relative to "us" – the authenticated user
// outgoing = authenticated user originated the call
// incoming = the contact did
export interface CallHistoryEntry {
  id: string;
  createdAt: string;
  direction: CallDirection;
  outcome: CallOutcome;
  contactId: string;
  contactEmail: string;
  contactName: string | null;
  contactHasMobileDevice: boolean;
}
