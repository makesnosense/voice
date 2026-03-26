import type { CallDirection } from '../constants/calls';

export interface CallNotificationPayload {
  callerEmail: string;
  callerName: string | null;
  roomId: string;
}

export interface CallHistoryEntry {
  id: string;
  createdAt: string;
  direction: CallDirection;
  contactId: string;
  contactEmail: string;
  contactName: string | null;
}
