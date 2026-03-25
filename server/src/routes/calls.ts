import { Router } from 'express';
import { requireAccessToken } from '../middleware/auth';
import { notifyDevicesOfCall, getMobileDevicesForTarget, isSelfTarget } from '../services/calls';
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

    const caller = req.user!;

    if (isSelfTarget(result.data, caller)) {
      return res.status(400).json({ error: 'cannot call yourself' });
    }

    try {
      const mobileDevices = await getMobileDevicesForTarget(result.data);
      if (mobileDevices.length === 0) {
        return res.status(404).json({ error: 'user not reachable' });
      }

      const roomId = createRoom(rooms);
      await notifyDevicesOfCall(caller.email, mobileDevices, roomId);

      res.json({ roomId });
    } catch (error) {
      console.error('failed to initiate call:', error);
      res.status(500).json({ error: 'failed to initiate call' });
    }
  });

  return router;
}
