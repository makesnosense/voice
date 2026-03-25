import { sendCallNotification } from '../utils/fcm';
import { findUserByEmail } from './users';
import { getUserMobileDevices } from '../services/devices';
import type { CallTarget } from '../schemas/call';
import type { RoomId } from '../../../shared/types/core';

export async function getMobileDevicesForTarget(data: CallTarget) {
  if ('targetUserId' in data) {
    return getUserMobileDevices(data.targetUserId);
  }
  const user = await findUserByEmail(data.targetEmail);
  return user ? getUserMobileDevices(user.id) : [];
}

export function isSelfTarget(data: CallTarget, caller: { userId: string; email: string }) {
  return 'targetUserId' in data
    ? data.targetUserId === caller.userId
    : data.targetEmail === caller.email;
}

export async function notifyDevicesOfCall(
  callerEmail: string,
  devices: { fcmToken: string | null }[],
  roomId: RoomId
): Promise<void> {
  await Promise.allSettled(
    devices.map((device) =>
      sendCallNotification(device.fcmToken!, {
        callerEmail,
        callerName: null,
        roomId,
      })
    )
  );
}
