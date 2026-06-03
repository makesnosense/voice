import { Router } from 'express';
import { createRoom } from '../services/rooms';
import { getUserMobileDevices } from '../services/devices';
import { requireAccessToken } from '../middleware/auth';
import { callSchema, callIdSchema } from '../schemas/calls';
import {
  createCallsLogEntry,
  notifyDevicesOfCall,
  markCallDeclined,
  markCallCancelled,
} from '../services/calls';
import { sendCallCancelledNotification } from '../utils/fcm';
import type { Room, RoomId, TypedServer } from '../../../shared/types/core';
import {
  cancelInviteLimiter,
  inviteDeclineLimiter,
  inviteLimiter,
  roomCreationLimiter,
} from '../middleware/api-rate-limiters';

export default function createRoomsRouter(rooms: Map<RoomId, Room>, io: TypedServer) {
  const router = Router();

  router.post('/', roomCreationLimiter, (req, res) => {
    const roomId = createRoom(rooms);
    res.json({ roomId });
  });

  router.post('/:roomId/invite', requireAccessToken, inviteLimiter, async (req, res) => {
    const roomId = req.params.roomId as RoomId;

    const result = callSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'invalid request', details: result.error.issues });
    }

    const room = rooms.get(roomId);

    if (!room) return res.status(404).json({ error: 'room not found' });

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

      room.pendingInviteFcmTokens = fcmTokens;

      const entry = await createCallsLogEntry(caller.userId, targetUserId);
      await notifyDevicesOfCall(caller, fcmTokens, roomId, entry.id);

      res.json({ callId: entry.id });
    } catch (error) {
      console.error('failed to send invite:', error);
      res.status(500).json({ error: 'failed to send invite' });
    }
  });

  router.post('/:roomId/decline', inviteDeclineLimiter, async (req, res) => {
    const roomId = req.params.roomId as RoomId;

    const room = rooms.get(roomId);
    if (!room) return res.status(404).json({ error: 'room not found' });

    // cancel notifications on all other devices
    await Promise.allSettled(
      room.pendingInviteFcmTokens.map((token) => sendCallCancelledNotification(token))
    );
    room.pendingInviteFcmTokens = [];

    io.to(roomId).emit('call-declined');

    const { data } = callIdSchema.safeParse(req.body);
    if (data?.callId) await markCallDeclined(data.callId);

    console.log(`📵 [Rooms] call declined for room ${roomId}`);
    res.status(204).end();
  });

  router.get('/:roomId/alive', requireAccessToken, (req, res) => {
    const roomId = req.params.roomId as RoomId;
    const room = rooms.get(roomId);
    if (!room) return res.json({ alive: false, userCount: 0 });
    res.json({ alive: true, userCount: room.users.size });
  });

  router.post(
    '/:roomId/cancel-invite',
    requireAccessToken,
    cancelInviteLimiter,
    async (req, res) => {
      const roomId = req.params.roomId as RoomId;
      const room = rooms.get(roomId);

      if (!room) return res.status(404).json({ error: 'room not found' });

      await Promise.allSettled(
        room.pendingInviteFcmTokens.map((token) => sendCallCancelledNotification(token))
      );

      room.pendingInviteFcmTokens = [];

      const { data } = callIdSchema.safeParse(req.body);
      if (data?.callId) await markCallCancelled(data.callId, req.user!.userId);

      console.log(`🚫 [Rooms] call cancelled for room ${roomId}`);
      res.status(204).end();
    }
  );

  return router;
}
