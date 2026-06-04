import { Router } from 'express';
import { requireAccessToken } from '../middleware/auth';
import {
  createCallsLogEntry,
  notifyDevicesOfCall,
  getCallHistory,
  markCallAnswered,
  markCallCancelled,
} from '../services/calls';
import { getUserMobileDevices } from '../services/devices';
import { findUserById } from '../services/users';
import { createRoom } from '../services/rooms';
import { callSchema } from '../schemas/calls';
import { sendCallCancelledNotification } from '../utils/fcm';
import type { Room, RoomId, TypedServer } from '../../../shared/types/core';
import { callInitiationLimiter } from '../middleware/api-rate-limiters';
import type InviteTimeoutManager from '../managers/invite-timeout-manager';
import z from 'zod';
import { INVITE_TIMEOUT_MS } from '../../../shared/constants/calls';

export default function createCallsRouter(
  rooms: Map<RoomId, Room>,
  io: TypedServer,
  inviteTimeoutManager: InviteTimeoutManager
) {
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
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = callSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'invalid request', details: result.error.issues });
    }

    const { targetUserId } = result.data;
    const caller = req.user;

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
      const room = rooms.get(roomId)!;

      const callsLogEntry = await createCallsLogEntry(caller.userId, targetUserId);
      await notifyDevicesOfCall(caller, fcmTokens, roomId, callsLogEntry.id);

      const targetUser = await findUserById(targetUserId);
      if (targetUser) {
        room.invitedUser = {
          userId: targetUserId,
          email: targetUser.email,
          name: targetUser.name,
          callId: callsLogEntry.id,
          fcmTokens,
        };

        inviteTimeoutManager.scheduleTimeout(roomId, INVITE_TIMEOUT_MS, () => {
          const currentRoom = rooms.get(roomId);
          if (!currentRoom?.invitedUser) return;
          const { fcmTokens: tokens } = currentRoom.invitedUser;
          currentRoom.invitedUser = null;
          tokens.forEach((token) => sendCallCancelledNotification(token).catch(() => {}));
          io.to(roomId).emit('invite-expired');
          console.log(`⏰ [Invite] timed out for room ${roomId}`);
        });
      }

      res.json({ roomId, callId: callsLogEntry.id });
    } catch (error) {
      console.error('Failed to initiate call:', error);
      res.status(500).json({ error: 'Failed to initiate call' });
    }
  });

  router.post('/:callId/mark-answered', requireAccessToken, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { callId } = req.params;
    if (!z.uuid().safeParse(callId).success) {
      return res.status(400).json({ error: 'Invalid call id' });
    }

    const updated = await markCallAnswered(callId, req.user.userId);
    if (!updated) return res.status(404).json({ error: 'Call not found or already resolved' });

    res.status(204).end();
  });

  router.post('/:callId/mark-cancelled', requireAccessToken, async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { callId } = req.params;
    if (!z.uuid().safeParse(callId).success) {
      return res.status(400).json({ error: 'Invalid call id' });
    }
    const updated = await markCallCancelled(callId, req.user.userId);
    if (!updated) return res.status(404).json({ error: 'Call not found or already resolved' });
    res.status(204).end();
  });

  return router;
}
