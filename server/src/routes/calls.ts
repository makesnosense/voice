import { Router } from 'express';
import { requireAccessToken } from '../middleware/auth';
import {
  createCallsLogEntry,
  notifyDevicesOfCall,
  getCallHistory,
  markCallAnswered,
} from '../services/calls';
import { getUserMobileDevices } from '../services/devices';
import { createRoom } from '../services/rooms';
import { callSchema } from '../schemas/calls';
import type { Room, RoomId } from '../../../shared/types/core';
import { callInitiationLimiter } from '../middleware/api-rate-limiters';
import z from 'zod';

export default function createCallsRouter(rooms: Map<RoomId, Room>) {
  const router = Router();

  router.get('/', requireAccessToken, async (req, res) => {
    try {
      const history = await getCallHistory(req.user!.userId);
      res.json(history);
    } catch (error) {
      console.error('failed to fetch call history:', error);
      res.status(500).json({ error: 'failed to fetch call history' });
    }
  });

  router.post('/', requireAccessToken, callInitiationLimiter, async (req, res) => {
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
      const fcmTokens = mobileDevices.flatMap((device) =>
        device.fcmToken ? [device.fcmToken] : []
      );

      const roomId = createRoom(rooms);
      const entry = await createCallsLogEntry(caller.userId, targetUserId);
      await notifyDevicesOfCall(caller, fcmTokens, roomId, entry.id);

      res.json({ roomId, callId: entry.id });
    } catch (error) {
      console.error('Failed to initiate call:', error);
      res.status(500).json({ error: 'Failed to initiate call' });
    }
  });

  router.post('/:callId/answer', requireAccessToken, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { callId } = req.params;
    if (!z.uuid().safeParse(callId).success) {
      return res.status(400).json({ error: 'Invalid call id' });
    }

    const updated = await markCallAnswered(callId, req.user.userId);
    if (!updated) return res.status(404).json({ error: 'Call not found or already resolved' });

    res.status(204).end();
  });

  return router;
}
