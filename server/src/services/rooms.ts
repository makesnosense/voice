import { generateRoomId } from '../utils/generators';
import type RoomDestructionManager from '../managers/room-destruction-manager';
import type { Room, RoomId } from '../../../shared/types/core';

export function createRoom(
  rooms: Map<RoomId, Room>,
  roomDestructionManager: RoomDestructionManager
): { roomId: RoomId; room: Room } {
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

  const room: Room = { users: new Map(), invitedUser: null, messages: [] };
  rooms.set(roomId, room);
  // empty from birth — same clock as "last user left". first joiner cancels it.
  roomDestructionManager.scheduleDestruction(roomId);
  console.log(`📱 created room: ${roomId}`);
  return { roomId, room };
}
