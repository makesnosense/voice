import { create } from 'zustand';
import { Linking } from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  checkNotifications,
  requestNotifications,
  PERMISSIONS,
  type PermissionStatus as RNPermissionStatus,
} from 'react-native-permissions';
import { PERMISSION_STATUS, type PermissionStatus } from '../types/permissions';

type PermissionsResult = {
  notifications: RNPermissionStatus;
  microphone: RNPermissionStatus;
};

async function checkPermissions(): Promise<PermissionsResult> {
  const [notifications, statuses] = await Promise.all([
    checkNotifications().then(({ status }) => status),
    checkMultiple([PERMISSIONS.IOS.MICROPHONE]),
  ]);
  return {
    notifications,
    microphone: statuses[PERMISSIONS.IOS.MICROPHONE],
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
  }: PermissionsResult) => {
    const allPermissionsGranted =
      notifications === PERMISSION_STATUS.GRANTED &&
      microphone === PERMISSION_STATUS.GRANTED;

    set({
      notificationsStatus: notifications,
      microphoneStatus: microphone,
      allPermissionsGranted,
      isCheckingPermissions: false,
    });
  };

  return {
    notificationsStatus: PERMISSION_STATUS.CHECKING,
    microphoneStatus: PERMISSION_STATUS.CHECKING,
    // ios call audio routing over bluetooth is handled by AVAudioSession,
    // not a user-facing runtime permission the way android's
    // BLUETOOTH_CONNECT is — always reads as unavailable here, which the
    // allPermissionsGranted checks upstream already treat as acceptable
    bluetoothStatus: PERMISSION_STATUS.UNAVAILABLE,
    isCheckingPermissions: true,
    permissionsRequested: false,
    allPermissionsGranted: false,
    permissionsSkipped: false,

    initialize: () => {
      // no android-style activity-attachment wait needed on ios
      checkPermissions()
        .then(applyPermissionsResults)
        .catch(() => {});
    },

    requestPermissions: async () => {
      const { status: notifications } = await requestNotifications([]);
      const statuses = await requestMultiple([PERMISSIONS.IOS.MICROPHONE]);

      applyPermissionsResults({
        notifications,
        microphone: statuses[PERMISSIONS.IOS.MICROPHONE],
      });
      set({ permissionsRequested: true });
    },

    openAppSettings: () => Linking.openSettings(),

    dismiss: () => set({ permissionsSkipped: true }),
  };
});
