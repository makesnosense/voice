import { Router, type Response } from 'express';
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
import type { CallHistoryEntry, CallInitiationResponse } from '../../../shared/types/calls';
import type { ApiErrorResponse } from '../../../shared/errors';
import { ERROR_CODE } from '../../../shared/constants/errors';
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

  router.get(
    '/',
    requireAccessToken,
    async (req, res: Response<CallHistoryEntry[] | ApiErrorResponse>) => {
      if (!req.user) {
        return res
          .status(401)
          .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
      }

      try {
        const history = await getCallHistory(req.user.userId);
        res.json(history);
      } catch (error) {
        console.error('failed to fetch call history:', error);
        res.status(500).json({
          errorMessage: 'failed to fetch call history',
          errorCode: ERROR_CODE.INTERNAL_ERROR,
        });
      }
    }
  );

  router.post(
    '/',
    requireAccessToken,
    callInitiationLimiter,
    async (req, res: Response<CallInitiationResponse | ApiErrorResponse>) => {
      if (!req.user) {
        return res
          .status(401)
          .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
      }

      const result = callSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          errorMessage: 'invalid request',
          errorCode: ERROR_CODE.INVALID_REQUEST,
          details: result.error.issues,
        });
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

        const { roomId, room } = createRoom(rooms);

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
        res.status(500).json({
          errorMessage: 'Failed to initiate call',
          errorCode: ERROR_CODE.INTERNAL_ERROR,
        });
      }
    }
  );

  router.post(
    '/:callId/mark-answered',
    requireAccessToken,
    async (req, res: Response<ApiErrorResponse>) => {
      if (!req.user) {
        return res
          .status(401)
          .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
      }

      const callIdResult = z.uuid().safeParse(req.params.callId);
      if (!callIdResult.success) {
        return res
          .status(400)
          .json({ errorMessage: 'Invalid call id', errorCode: ERROR_CODE.INVALID_REQUEST });
      }
      const callId = callIdResult.data;

      const updated = await markCallAnswered(callId, req.user.userId);
      if (!updated) {
        return res.status(404).json({
          errorMessage: 'Call not found or already resolved',
          errorCode: ERROR_CODE.CALL_NOT_FOUND,
        });
      }

      res.status(204).end();
    }
  );

  router.post(
    '/:callId/mark-cancelled',
    requireAccessToken,
    async (req, res: Response<ApiErrorResponse>) => {
      if (!req.user) {
        return res
          .status(401)
          .json({ errorMessage: 'Unauthorized', errorCode: ERROR_CODE.UNAUTHORIZED });
      }

      const callIdResult = z.uuid().safeParse(req.params.callId);
      if (!callIdResult.success) {
        return res
          .status(400)
          .json({ errorMessage: 'Invalid call id', errorCode: ERROR_CODE.INVALID_REQUEST });
      }

      const callId = callIdResult.data;

      const updated = await markCallCancelled(callId, req.user.userId);
      if (!updated) {
        return res.status(404).json({
          errorMessage: 'Call not found or already resolved',
          errorCode: ERROR_CODE.CALL_NOT_FOUND,
        });
      }
      res.status(204).end();
    }
  );

  return router;
}
