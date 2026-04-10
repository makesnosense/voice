import type { RoomId } from '../types/core';

const ROOM_ID_PATTERN = /^[a-z0-9]{3}-[a-z0-9]{3}$/;

export function validateRoomId(value: string): value is RoomId {
  return ROOM_ID_PATTERN.test(value);
}
