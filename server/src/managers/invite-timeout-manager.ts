import type { Room, RoomId, TypedServer } from '../../../shared/types/core';
import { INVITE_TIMEOUT_MS } from '../../../shared/constants/calls';
import { sendCallCancelledNotification } from '../utils/fcm';
import { sendVoipPush, VOIP_PUSH_TYPE } from '../utils/apns';

export default class InviteTimeoutManager {
  private timers = new Map<RoomId, NodeJS.Timeout>();
  private rooms: Map<RoomId, Room>;
  private io: TypedServer;

  constructor(rooms: Map<RoomId, Room>, io: TypedServer) {
    this.rooms = rooms;
    this.io = io;
  }

  scheduleInviteTimeout(roomId: RoomId): void {
    this.cancelTimeout(roomId);
    this.timers.set(
      roomId,
      setTimeout(() => {
        this.timers.delete(roomId);

        const currentRoom = this.rooms.get(roomId);
        if (!currentRoom?.invitedUser) return;

        const { fcmTokens, voipTokens, callId } = currentRoom.invitedUser;
        currentRoom.invitedUser = null;

        fcmTokens.forEach((token) => sendCallCancelledNotification(token).catch(() => {}));
        voipTokens.forEach((token) =>
          sendVoipPush(token, VOIP_PUSH_TYPE.CALL_CANCELLED, { callId }).catch(() => {})
        );

        this.io.to(roomId).emit('invite-expired');
        console.log(`⏰ [Invite] timed out for room ${roomId}`);
      }, INVITE_TIMEOUT_MS)
    );
  }

  cancelTimeout(roomId: RoomId): void {
    const timer = this.timers.get(roomId);
    if (!timer) return;
    clearTimeout(timer);
    this.timers.delete(roomId);
  }
}
