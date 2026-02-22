import { Router } from 'express';
import { createRoom } from '../services/rooms';
import { findUserByEmail } from '../services/users';
import { getUserMobileDevices } from '../services/devices';
import { notifyDevicesOfCall } from '../services/call';
import { requireAccessToken } from '../middleware/auth';
import { callSchema } from '../schemas/call';
import type { Room, RoomId } from '../../../shared/types';

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

    const { targetEmail } = req.body;

    if (!targetEmail) {
      return res.status(400).json({ error: 'targetEmail required' });
    }

    if (!rooms.has(roomId)) {
      return res.status(404).json({ error: 'room not found' });
    }

    const caller = req.user!;

    try {
      const targetUser = await findUserByEmail(targetEmail);
      if (!targetUser) {
        return res.status(404).json({ error: 'user not found' });
      }

      const mobileDevices = await getUserMobileDevices(targetUser.id);
      if (mobileDevices.length === 0) {
        return res.status(404).json({ error: 'target has no reachable devices' });
      }

      await notifyDevicesOfCall(caller.email, mobileDevices, roomId);

      res.json({ roomId });
    } catch (error) {
      console.error('failed to send invite:', error);
      res.status(500).json({ error: 'failed to send invite' });
    }
  });

  return router;
}
