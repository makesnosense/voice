import { ApiBase } from './base';
import type { RoomId } from '../types/core';
import type { CallHistoryEntry } from '../types/calls';

export class CallsApi extends ApiBase {
  create(targetUserId: string, accessToken: string): Promise<{ roomId: RoomId }> {
    return this.apiFetch<{ roomId: RoomId }>('/calls', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ targetUserId }),
    });
  }

  getHistory(accessToken: string): Promise<CallHistoryEntry[]> {
    return this.apiFetch<CallHistoryEntry[]>('/calls', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
