import { sendCallNotification } from '../utils/fcm';
import type { RoomId } from '../../../shared/types';

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
