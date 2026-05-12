import {
  getMessaging,
  getToken,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getFcmToken(): Promise<string | null> {
  const messaging = getMessaging(getApp());

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const token = await getToken(messaging);
      console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');
      return token;
    } catch (error) {
      const isLastAttempt = attempt === RETRY_DELAYS_MS.length;
      if (isLastAttempt) {
        console.error('❌ FCM token failed after all retries:', error);
        return null;
      }
      const delayMs = RETRY_DELAYS_MS[attempt];
      console.warn(
        `⚠️ FCM token attempt ${attempt + 1} failed, retrying in ${delayMs}ms`,
      );
      await sleep(delayMs);
    }
  }

  return null;
}
// if Google rotates FCM token while app is open
export function listenForTokenRefresh(
  callback: (token: string) => Promise<void>,
) {
  const messaging = getMessaging(getApp());

  return onTokenRefresh(messaging, async newToken => {
    console.log('🔄 FCM token refreshed:', newToken.substring(0, 20) + '...');
    await callback(newToken);
  });
}
