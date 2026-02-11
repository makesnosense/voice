import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  requestPermission,
  hasPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import type { ObjectValues } from '../../../shared/types';

export const NOTIFICATION_PERMISSION_STATUS = {
  AUTHORIZED: 'authorized',
  DENIED: 'denied',
  NOT_DETERMINED: 'not_determined',
  PROVISIONAL: 'provisional',
} as const;

export type NotificationPermissionStatus = ObjectValues<
  typeof NOTIFICATION_PERMISSION_STATUS
>;

function mapAuthStatus(
  authStatus: ObjectValues<typeof AuthorizationStatus>,
): NotificationPermissionStatus {
  switch (authStatus) {
    case AuthorizationStatus.AUTHORIZED:
      return NOTIFICATION_PERMISSION_STATUS.AUTHORIZED;
    case AuthorizationStatus.DENIED:
      return NOTIFICATION_PERMISSION_STATUS.DENIED;
    case AuthorizationStatus.PROVISIONAL:
      return NOTIFICATION_PERMISSION_STATUS.PROVISIONAL;
    case AuthorizationStatus.NOT_DETERMINED:
    default:
      return NOTIFICATION_PERMISSION_STATUS.NOT_DETERMINED;
  }
}

export async function ensureNotificationPermissions(): Promise<NotificationPermissionStatus> {
  try {
    const app = getApp();
    const messaging = getMessaging(app);

    // check current status first
    const currentStatus = await hasPermission(messaging);

    // if already authorized, return immediately
    if (currentStatus === AuthorizationStatus.AUTHORIZED) {
      console.log('✅ notifications already authorized');
      return NOTIFICATION_PERMISSION_STATUS.AUTHORIZED;
    }

    // otherwise, request permissions
    console.log('⚠️ requesting notification permissions...');
    const authStatus = await requestPermission(messaging);
    console.log('📱 permission result:', authStatus);

    return mapAuthStatus(authStatus);
  } catch (error) {
    console.error('❌ failed to ensure notification permissions:', error);
    throw error;
  }
}
