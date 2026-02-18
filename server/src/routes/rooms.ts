import { Router } from 'express';
import { createRoom } from '../services/rooms';
import type { Room, RoomId } from '../../../shared/types';

export default function createRoomsRouter(rooms: Map<RoomId, Room>) {
  const router = Router();

  router.post('/create-room', (req, res) => {
    const roomId = createRoom(rooms);
    res.json({ roomId });
  });

  return router;
}
