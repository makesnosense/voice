import { create } from 'zustand';
import { AppState, Linking } from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  checkNotifications,
  requestNotifications,
  PERMISSIONS,
  type PermissionStatus as RNPermissionStatus,
} from 'react-native-permissions';
import { PERMISSION_STATUS, type PermissionStatus } from '../types/permissions';
import { waitForActivity } from '../utils/wait-for-activity';
import { runNativePermissions } from '../native/runNativePermissions';

function checkPermissions(): Promise<[RNPermissionStatus, RNPermissionStatus]> {
  return Promise.all([
    checkNotifications().then(({ status }) => status),
    checkMultiple([PERMISSIONS.ANDROID.RECORD_AUDIO]).then(
      statuses => statuses[PERMISSIONS.ANDROID.RECORD_AUDIO],
    ),
  ]);
}

interface PermissionsStore {
  notificationsStatus: PermissionStatus;
  microphoneStatus: PermissionStatus;
  isCheckingPermissions: boolean;
  permissionsRequested: boolean;
  allPermissionsGranted: boolean;
  permissionsSkipped: boolean;

  initialize: () => void;
  requestPermissions: () => Promise<void>;
  openAppSettings: () => void;
  dismiss: () => void;
}

export const usePermissionsStore = create<PermissionsStore>((set, get) => {
  const applyPermissionsResults = ([notifications, microphone]: [
    RNPermissionStatus,
    RNPermissionStatus,
  ]) => {
    const allPermissionsGranted =
      notifications === PERMISSION_STATUS.GRANTED &&
      microphone === PERMISSION_STATUS.GRANTED;

    set({
      notificationsStatus: notifications,
      microphoneStatus: microphone,
      allPermissionsGranted,
      isCheckingPermissions: false,
    });

    if (allPermissionsGranted || get().permissionsSkipped)
      runNativePermissions();
  };

  return {
    notificationsStatus: PERMISSION_STATUS.CHECKING,
    microphoneStatus: PERMISSION_STATUS.CHECKING,
    isCheckingPermissions: true,
    permissionsRequested: false,
    allPermissionsGranted: false,
    permissionsSkipped: false,

    initialize: () => {
      waitForActivity()
        .then(checkPermissions)
        .then(applyPermissionsResults)
        .catch(() => {});

      AppState.addEventListener('change', nextState => {
        if (nextState === 'active') {
          checkPermissions()
            .then(applyPermissionsResults)
            .catch(() => {});
        }
      });
    },

    requestPermissions: async () => {
      await waitForActivity();

      const { status: notifications } = await requestNotifications([]);
      const micStatuses = await requestMultiple([
        PERMISSIONS.ANDROID.RECORD_AUDIO,
      ]);

      applyPermissionsResults([
        notifications,
        micStatuses[PERMISSIONS.ANDROID.RECORD_AUDIO],
      ]);
      set({ permissionsRequested: true });
    },

    openAppSettings: () => Linking.openSettings(),

    dismiss: () => {
      set({ permissionsSkipped: true });
      runNativePermissions();
    },
  };
});
