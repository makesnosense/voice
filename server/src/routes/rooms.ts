import { Router, type Response } from 'express';
import { createRoom } from '../services/rooms';
import { getUserMobileDevicesPushTokens } from '../services/devices';
import { findUserById } from '../services/users';
import { requireAccessToken } from '../middleware/auth';
import { callSchema, declineCallSchema } from '../schemas/calls';
import { createCallsLogEntry, notifyDevicesOfCall, markCallDeclined } from '../services/calls';
import { sendCallCancelledNotification, sendCallDeclinedNotification } from '../utils/fcm';
import { sendVoipPush, VOIP_PUSH_TYPE } from '../utils/apns';
import type { Room, RoomId, TypedServer } from '../../../shared/types/core';
import type {
  CreateRoomResponse,
  RoomAliveResponse,
  RoomInviteResponse,
} from '../../../shared/types/rooms';
import type { ApiErrorResponse } from '../../../shared/errors';
import { ERROR_CODE } from '../../../shared/constants/errors';
import type InviteTimeoutManager from '../managers/invite-timeout-manager';
import type RoomDestructionManager from '../managers/room-destruction-manager';
import {
  cancelInviteLimiter,
  inviteDeclineLimiter,
  inviteLimiter,
  roomCreationLimiter,
} from '../middleware/api-rate-limiters';

export default function createRoomsRouter(
  rooms: Map<RoomId, Room>,
  io: TypedServer,
  inviteTimeoutManager: InviteTimeoutManager,
  roomDestructionManager: RoomDestructionManager
) {
  const router = Router();

  router.post('/', roomCreationLimiter, (_req, res: Response<CreateRoomResponse>) => {
    const { roomId } = createRoom(rooms, roomDestructionManager);
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
        const pushTokens = await getUserMobileDevicesPushTokens(targetUserId);
        if (pushTokens.fcmTokens.length === 0 && pushTokens.voipTokens.length === 0) {
          return res.status(404).json({
            errorMessage: 'User not reachable',
            errorCode: ERROR_CODE.USER_NOT_REACHABLE,
          });
        }

        const entry = await createCallsLogEntry(caller.userId, targetUserId);
        await notifyDevicesOfCall(caller, pushTokens, roomId, entry.id);

        const targetUser = await findUserById(targetUserId);
        if (targetUser) {
          room.invitedUser = {
            userId: targetUserId,
            email: targetUser.email,
            name: targetUser.name,
            callId: entry.id,
            fcmTokens: pushTokens.fcmTokens,
            voipTokens: pushTokens.voipTokens,
          };

          inviteTimeoutManager.scheduleInviteTimeout(roomId);
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
        const { fcmTokens, voipTokens } = room.invitedUser;

        const result = declineCallSchema.safeParse(req.body);
        if (!result.success) {
          return res
            .status(400)
            .json({ errorMessage: 'invalid request', errorCode: ERROR_CODE.INVALID_REQUEST });
        }

        const { callId, declinerFcmToken, declinerVoipToken } = result.data;

        const fcmTokensToNotify = fcmTokens.filter((token) => token !== declinerFcmToken);
        const voipTokensToNotify = voipTokens.filter((token) => token !== declinerVoipToken);

        await Promise.allSettled([
          ...fcmTokensToNotify.map((token) => sendCallDeclinedNotification(token)),
          ...voipTokensToNotify.map((token) =>
            sendVoipPush(token, VOIP_PUSH_TYPE.CALL_DECLINED, { callId })
          ),
        ]);

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
        const { fcmTokens, voipTokens, callId } = room.invitedUser;
        await Promise.allSettled([
          ...fcmTokens.map((token) => sendCallCancelledNotification(token)),
          ...voipTokens.map((token) =>
            sendVoipPush(token, VOIP_PUSH_TYPE.CALL_CANCELLED, { callId })
          ),
        ]);
        room.invitedUser = null;
      }

      console.log(`🚫 [Rooms] call cancelled for room ${roomId}`);
      res.status(204).end();
    }
  );

  return router;
}
