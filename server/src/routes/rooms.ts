import { Router } from 'express';
import { generateRoomId } from '../utils/generators';
import type { Room, RoomId } from '../../../shared/types';

export default function createRoomsRouter(rooms: Map<RoomId, Room>) {
  const router = Router();

  router.post('/create-room', (req, res) => {
    const roomId = generateRoomId();
    rooms.set(roomId, { users: new Map() });
    console.log(`📱 Created room: ${roomId}`);
    res.json({ roomId });
  });

  return router;
}
