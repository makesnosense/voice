import { ApiBase } from './base';
import type { RoomId } from '../types/core';
import type { CreateRoomResponse, RoomAliveResponse, RoomInviteResponse } from '../types/rooms';

export class RoomsApi extends ApiBase {
  createRoom(): Promise<CreateRoomResponse> {
    return this.apiFetch<CreateRoomResponse>('/rooms', { method: 'POST' });
  }

  inviteToRoom(
    roomId: RoomId,
    target: { targetUserId: string },
    accessToken: string
  ): Promise<RoomInviteResponse> {
    return this.apiFetch<RoomInviteResponse>(`/rooms/${roomId}/invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(target),
    });
  }

  cancelInviteToRoom(roomId: RoomId, accessToken: string): Promise<void> {
    return this.apiFetch(`/rooms/${roomId}/cancel-invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  checkAlive(roomId: RoomId, accessToken: string): Promise<RoomAliveResponse> {
    return this.apiFetch<RoomAliveResponse>(`/rooms/${roomId}/alive`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
