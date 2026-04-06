import { generateRoomId } from '../utils/generators';
import type { Room, RoomId } from '../../../shared/types/core';

export function createRoom(rooms: Map<RoomId, Room>): RoomId {
  let roomId: RoomId;
  let attempts = 0;
  const MAX_ATTEMPTS = 100;

  do {
    roomId = generateRoomId();
    attempts++;
    if (attempts > MAX_ATTEMPTS) {
      throw new Error('failed to generate unique room ID');
    }
  } while (rooms.has(roomId));

  rooms.set(roomId, { users: new Map(), pendingInviteFcmTokens: [] });
  console.log(`📱 created room: ${roomId}`);
  return roomId;
}
