import {
  getMessaging,
  getToken,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

export async function getFcmToken(): Promise<string | null> {
  try {
    const messaging = getMessaging(getApp());
    const token = await getToken(messaging);
    console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('❌ failed to get FCM token:', error);
    return null;
  }
}

export function listenForTokenRefresh(
  callback: (token: string) => Promise<void>,
) {
  const messaging = getMessaging(getApp());

  return onTokenRefresh(messaging, async newToken => {
    console.log('🔄 FCM token refreshed:', newToken.substring(0, 20) + '...');
    await callback(newToken);
  });
}
