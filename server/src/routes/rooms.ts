import { Router, type Response } from 'express';
import { createRoom } from '../services/rooms';
import { getUserMobileDevices } from '../services/devices';
import { findUserById } from '../services/users';
import { requireAccessToken } from '../middleware/auth';
import { callSchema, declineCallSchema } from '../schemas/calls';
import { createCallsLogEntry, notifyDevicesOfCall, markCallDeclined } from '../services/calls';
import { sendCallCancelledNotification, sendCallDeclinedNotification } from '../utils/fcm';
import type { Room, RoomId, TypedServer } from '../../../shared/types/core';
import type {
  CreateRoomResponse,
  RoomAliveResponse,
  RoomInviteResponse,
} from '../../../shared/types/rooms';
import type { ApiErrorResponse } from '../../../shared/errors';
import { ERROR_CODE } from '../../../shared/constants/errors';
import type InviteTimeoutManager from '../managers/invite-timeout-manager';
import {
  cancelInviteLimiter,
  inviteDeclineLimiter,
  inviteLimiter,
  roomCreationLimiter,
} from '../middleware/api-rate-limiters';
import { INVITE_TIMEOUT_MS } from '../../../shared/constants/calls';

export default function createRoomsRouter(
  rooms: Map<RoomId, Room>,
  io: TypedServer,
  inviteTimeoutManager: InviteTimeoutManager
) {
  const router = Router();

  router.post('/', roomCreationLimiter, (_req, res: Response<CreateRoomResponse>) => {
    const { roomId } = createRoom(rooms);
    res.json({ roomId });
  });

  router.post(
    '/:roomId/invite',
    requireAccessToken,
    inviteLimiter,
    async (req, res: Response<RoomInviteResponse | ApiErrorResponse>) => {
      if (!req.user) {
        return res
          .status(401)
          .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
      }

      const roomId = req.params.roomId as RoomId;

      const result = callSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          errorMessage: 'invalid request',
          errorCode: ERROR_CODE.INVALID_REQUEST,
          details: result.error.issues,
        });
      }

      const room = rooms.get(roomId);
      if (!room) {
        return res
          .status(404)
          .json({ errorMessage: 'room not found', errorCode: ERROR_CODE.ROOM_NOT_FOUND });
      }

      const { targetUserId } = result.data;
      const caller = req.user;

      if (targetUserId === caller.userId) {
        return res.status(400).json({
          errorMessage: 'Cannot call yourself',
          errorCode: ERROR_CODE.CANNOT_CALL_SELF,
        });
      }

      try {
        const mobileDevices = await getUserMobileDevices(targetUserId);
        if (mobileDevices.length === 0) {
          return res.status(404).json({
            errorMessage: 'User not reachable',
            errorCode: ERROR_CODE.USER_NOT_REACHABLE,
          });
        }

        const fcmTokens = mobileDevices.flatMap((device) =>
          device.fcmToken ? [device.fcmToken] : []
        );

        const entry = await createCallsLogEntry(caller.userId, targetUserId);
        await notifyDevicesOfCall(caller, fcmTokens, roomId, entry.id);

        const targetUser = await findUserById(targetUserId);
        if (targetUser) {
          // cancel any pre-existing invite timer for this room (e.g. re-invite)
          inviteTimeoutManager.cancelTimeout(roomId);

          room.invitedUser = {
            userId: targetUserId,
            email: targetUser.email,
            name: targetUser.name,
            callId: entry.id,
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

        res.json({ callId: entry.id });
      } catch (error) {
        console.error('failed to send invite:', error);
        res
          .status(500)
          .json({ errorMessage: 'failed to send invite', errorCode: ERROR_CODE.INTERNAL_ERROR });
      }
    }
  );

  router.post(
    '/:roomId/decline',
    inviteDeclineLimiter,
    async (req, res: Response<ApiErrorResponse>) => {
      const roomId = req.params.roomId as RoomId;

      const room = rooms.get(roomId);
      if (!room) {
        return res
          .status(404)
          .json({ errorMessage: 'room not found', errorCode: ERROR_CODE.ROOM_NOT_FOUND });
      }

      inviteTimeoutManager.cancelTimeout(roomId);

      if (room.invitedUser) {
        const { fcmTokens } = room.invitedUser;

        const result = declineCallSchema.safeParse(req.body);
        if (!result.success) {
          return res
            .status(400)
            .json({ errorMessage: 'invalid request', errorCode: ERROR_CODE.INVALID_REQUEST });
        }

        const { callId, declinerFcmToken } = result.data;

        const tokensToNotify = fcmTokens.filter((token) => token !== declinerFcmToken);

        await Promise.allSettled(
          tokensToNotify.map((token) => sendCallDeclinedNotification(token))
        );

        room.invitedUser = null;

        await markCallDeclined(callId);
      }

      io.to(roomId).emit('call-declined');
      console.log(`📵 [Rooms] call declined for room ${roomId}`);
      res.status(204).end();
    }
  );

  router.get('/:roomId/alive', requireAccessToken, (req, res: Response<RoomAliveResponse>) => {
    const roomId = req.params.roomId as RoomId;
    const room = rooms.get(roomId);
    if (!room) return res.json({ alive: false, userCount: 0 });
    res.json({ alive: true, userCount: room.users.size });
  });

  router.post(
    '/:roomId/cancel-invite',
    requireAccessToken,
    cancelInviteLimiter,
    async (req, res: Response<ApiErrorResponse>) => {
      const roomId = req.params.roomId as RoomId;
      const room = rooms.get(roomId);

      if (!room) {
        return res
          .status(404)
          .json({ errorMessage: 'room not found', errorCode: ERROR_CODE.ROOM_NOT_FOUND });
      }

      inviteTimeoutManager.cancelTimeout(roomId);

      if (room.invitedUser) {
        await Promise.allSettled(
          room.invitedUser.fcmTokens.map((token) => sendCallCancelledNotification(token))
        );
        room.invitedUser = null;
      }

      console.log(`🚫 [Rooms] call cancelled for room ${roomId}`);
      res.status(204).end();
    }
  );

  return router;
}
