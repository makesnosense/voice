import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

const { FCM_PROJECT_ID, FCM_PRIVATE_KEY, FCM_CLIENT_EMAIL } = process.env;

if (!FCM_PROJECT_ID || !FCM_PRIVATE_KEY || !FCM_CLIENT_EMAIL) {
  throw new Error('missing FCM environment variables');
}

// guard against hot-reload double init
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: FCM_PROJECT_ID,
      privateKey: FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: FCM_CLIENT_EMAIL,
    }),
  });
}

export interface CallNotificationPayload {
  callerEmail: string;
  callerName: string | null;
  roomId: string;
}

export async function sendCallNotification(
  fcmToken: string,
  payload: CallNotificationPayload
): Promise<void> {
  await getMessaging().send({
    token: fcmToken,
    data: {
      type: 'incoming_call',
      callerEmail: payload.callerEmail,
      callerName: payload.callerName ?? '',
      roomId: payload.roomId,
    },
    android: {
      priority: 'high',
    },
  });
}
