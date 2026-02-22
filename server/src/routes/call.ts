import { Router } from 'express';
import { requireAccessToken } from '../middleware/auth';
import { findUserByEmail } from '../services/users';
import { getUserMobileDevices } from '../services/devices';
import { notifyDevicesOfCall } from '../services/call';
import { createRoom } from '../services/rooms';
import { callSchema } from '../schemas/call';
import type { Room, RoomId } from '../../../shared/types';

export default function createCallRouter(rooms: Map<RoomId, Room>) {
  const router = Router();

  router.post('/call', requireAccessToken, async (req, res) => {
    const result = callSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'invalid request', details: result.error.issues });
    }

    const { targetEmail } = result.data;
    const caller = req.user!;

    if (targetEmail === caller.email) {
      return res.status(400).json({ error: 'cannot call yourself' });
    }

    try {
      const targetUser = await findUserByEmail(targetEmail);
      if (!targetUser) {
        return res.status(404).json({ error: 'user not found' });
      }

      const mobileDevices = await getUserMobileDevices(targetUser.id);
      if (mobileDevices.length === 0) {
        return res.status(404).json({ error: 'target has no reachable devices' });
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
