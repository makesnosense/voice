import { ApiBase } from './base';
import type { RoomId } from '../types/core';

export class CallsApi extends ApiBase {
  initiate(targetUserId: string, accessToken: string): Promise<{ roomId: RoomId }> {
    return this.apiFetch<{ roomId: RoomId }>('/calls', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ targetUserId }),
    });
  }
}
