import { generateRoomId } from '../utils/generators';
import type { Room, RoomId } from '../../../shared/types';

export function createRoom(rooms: Map<RoomId, Room>, roomId?: RoomId): RoomId {
  const id = roomId ?? generateRoomId();
  if (!rooms.has(id)) {
    rooms.set(id, { users: new Map() });
    console.log(`📱 created room: ${id}`);
  }
  return id;
}
