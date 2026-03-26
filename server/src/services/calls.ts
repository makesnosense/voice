import { sendCallNotification } from '../utils/fcm';
import { db } from '../db';
import { calls } from '../db/schema';

import type { RoomId } from '../../../shared/types/core';

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

export async function createCallsLogEntry(fromUserId: string, toUserId: string) {
  await db.insert(calls).values({ fromUserId, toUserId });
}
