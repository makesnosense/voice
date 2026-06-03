import { ApiBase } from './base';
import type { CreateRoomResponse, RoomAliveResponse, RoomId } from '../types/core';

export class RoomsApi extends ApiBase {
  createRoom(): Promise<CreateRoomResponse> {
    return this.apiFetch<CreateRoomResponse>('/rooms', { method: 'POST' });
  }

  inviteToRoom(
    roomId: RoomId,
    target: { targetUserId: string },
    accessToken: string
  ): Promise<{ callId: string }> {
    return this.apiFetch<{ callId: string }>(`/rooms/${roomId}/invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(target),
    });
  }

  cancelInviteToRoom(roomId: RoomId, accessToken: string, callId?: string): Promise<void> {
    return this.apiFetch(`/rooms/${roomId}/cancel-invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId }),
    });
  }

  checkAlive(roomId: RoomId, accessToken: string): Promise<RoomAliveResponse> {
    return this.apiFetch<RoomAliveResponse>(`/rooms/${roomId}/alive`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
