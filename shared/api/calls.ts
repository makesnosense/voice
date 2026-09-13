import { ApiBase } from './base';
import type { CallHistoryEntry, CallInitiationResponse } from '../types/calls';

export class CallsApi extends ApiBase {
  create(targetUserId: string, accessToken: string): Promise<CallInitiationResponse> {
    return this.apiFetch<CallInitiationResponse>('/calls', {
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

  markAnswered(callId: string, accessToken: string): Promise<void> {
    return this.apiFetch(`/calls/${callId}/mark-answered`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  markCancelled(callId: string, accessToken: string): Promise<void> {
    return this.apiFetch(`/calls/${callId}/mark-cancelled`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
