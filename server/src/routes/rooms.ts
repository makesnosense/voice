import { Router } from 'express';
import { createRoom } from '../services/rooms';
import { notifyDevicesOfCall } from '../services/calls';
import { getUserMobileDevices } from '../services/devices';
import { requireAccessToken } from '../middleware/auth';
import { callSchema } from '../schemas/calls';
import { createCallsLogEntry } from '../services/calls';
import type { Room, RoomId } from '../../../shared/types/core';

export default function createRoomsRouter(rooms: Map<RoomId, Room>) {
  const router = Router();

  router.post('/', (req, res) => {
    const roomId = createRoom(rooms);
    res.json({ roomId });
  });

  router.post('/:roomId/invite', requireAccessToken, async (req, res) => {
    const roomId = req.params.roomId as RoomId;

    const result = callSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'invalid request', details: result.error.issues });
    }

    if (!rooms.has(roomId)) {
      return res.status(404).json({ error: 'room not found' });
    }

    const { targetUserId } = result.data;
    const caller = req.user!;

    if (targetUserId === caller.userId) {
      return res.status(400).json({ error: 'Cannot call yourself' });
    }

    try {
      const mobileDevices = await getUserMobileDevices(targetUserId);
      if (mobileDevices.length === 0) {
        return res.status(404).json({ error: 'User not reachable' });
      }

      await notifyDevicesOfCall(caller, mobileDevices, roomId);
      await createCallsLogEntry(caller.userId, targetUserId);

      res.status(204).end();
    } catch (error) {
      console.error('failed to send invite:', error);
      res.status(500).json({ error: 'failed to send invite' });
    }
  });

  router.get('/:roomId/alive', (req, res) => {
    const roomId = req.params.roomId as RoomId;
    const room = rooms.get(roomId);
    if (!room) return res.json({ alive: false, userCount: 0 });
    res.json({ alive: true, userCount: room.users.size });
  });

  return router;
}
