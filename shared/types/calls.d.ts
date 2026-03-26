export interface CallNotificationPayload {
  callerEmail: string;
  callerName: string | null;
  roomId: string;
}

export interface CallHistoryEntry {
  id: string;
  createdAt: string;
  direction: 'outgoing' | 'incoming';
  contactId: string;
  contactEmail: string;
  contactName: string | null;
}
