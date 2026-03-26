import { Router } from 'express';
import { requireAccessToken } from '../middleware/auth';
import { notifyDevicesOfCall } from '../services/calls';
import { getUserMobileDevices } from '../services/devices';
import { createRoom } from '../services/rooms';
import { callSchema } from '../schemas/calls';
import type { Room, RoomId } from '../../../shared/types/core';

export default function createCallsRouter(rooms: Map<RoomId, Room>) {
  const router = Router();

  router.post('/', requireAccessToken, async (req, res) => {
    const result = callSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'invalid request', details: result.error.issues });
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

      const roomId = createRoom(rooms);
      await notifyDevicesOfCall(caller.email, mobileDevices, roomId);

      res.json({ roomId });
    } catch (error) {
      console.error('Failed to initiate call:', error);
      res.status(500).json({ error: 'Failed to initiate call' });
    }
  });

  return router;
}
