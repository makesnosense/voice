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

type PermissionsResult = {
  notifications: RNPermissionStatus;
  microphone: RNPermissionStatus;
  bluetooth: RNPermissionStatus;
};

async function checkPermissions(): Promise<PermissionsResult> {
  const [notifications, statuses] = await Promise.all([
    checkNotifications().then(({ status }) => status),
    checkMultiple([
      PERMISSIONS.ANDROID.RECORD_AUDIO,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    ]),
  ]);
  return {
    notifications,
    microphone: statuses[PERMISSIONS.ANDROID.RECORD_AUDIO],
    bluetooth: statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT],
  };
}

interface PermissionsStore {
  notificationsStatus: PermissionStatus;
  microphoneStatus: PermissionStatus;
  bluetoothStatus: PermissionStatus;
  isCheckingPermissions: boolean;
  permissionsRequested: boolean;
  allPermissionsGranted: boolean;
  permissionsSkipped: boolean;

  initialize: () => void;
  requestPermissions: () => Promise<void>;
  openAppSettings: () => void;
  dismiss: () => void;
}

export const usePermissionsStore = create<PermissionsStore>(set => {
  const applyPermissionsResults = ({
    notifications,
    microphone,
    bluetooth,
  }: PermissionsResult) => {
    const allPermissionsGranted =
      notifications === PERMISSION_STATUS.GRANTED &&
      microphone === PERMISSION_STATUS.GRANTED &&
      (bluetooth === PERMISSION_STATUS.GRANTED ||
        bluetooth === PERMISSION_STATUS.UNAVAILABLE);

    set({
      notificationsStatus: notifications,
      microphoneStatus: microphone,
      bluetoothStatus: bluetooth,
      allPermissionsGranted,
      isCheckingPermissions: false,
    });
  };

  return {
    notificationsStatus: PERMISSION_STATUS.CHECKING,
    microphoneStatus: PERMISSION_STATUS.CHECKING,
    bluetoothStatus: PERMISSION_STATUS.CHECKING,
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
      const statuses = await requestMultiple([
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      ]);

      applyPermissionsResults({
        notifications,
        microphone: statuses[PERMISSIONS.ANDROID.RECORD_AUDIO],
        bluetooth: statuses[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT],
      });
      set({ permissionsRequested: true });
    },

    openAppSettings: () => Linking.openSettings(),

    dismiss: () => set({ permissionsSkipped: true }),
  };
});
