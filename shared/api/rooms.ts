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
  ): Promise<void> {
    return this.apiFetch(`/rooms/${roomId}/invite`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(target),
    });
  }

  checkAlive(roomId: RoomId): Promise<RoomAliveResponse> {
    return this.apiFetch<RoomAliveResponse>(`/rooms/${roomId}/alive`, { method: 'GET' });
  }
}
