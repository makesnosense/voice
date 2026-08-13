import type { RoomId } from './core';

export interface CreateRoomResponse {
  roomId: RoomId;
}

export interface RoomAliveResponse {
  alive: boolean;
  userCount: number;
}

export interface RoomInviteResponse {
  callId: string;
}
