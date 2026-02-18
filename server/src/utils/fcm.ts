import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import config from '../config';
import type { CallNotificationPayload } from '../../../shared/call-types';

const { FCM_PROJECT_ID, FCM_PRIVATE_KEY, FCM_CLIENT_EMAIL } = process.env;

if (!FCM_PROJECT_ID || !FCM_PRIVATE_KEY || !FCM_CLIENT_EMAIL) {
  throw new Error('missing FCM environment variables');
}

// guard against hot-reload double init
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: config.fcm.projectId,
      privateKey: config.fcm.privateKey.replace(/\\n/g, '\n'),
      clientEmail: config.fcm.clientEmail,
    }),
  });
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
