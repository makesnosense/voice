import { create } from 'zustand';
import { AppState, Linking, Platform } from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  checkNotifications,
  requestNotifications,
  PERMISSIONS,
  type Permission,
  type PermissionStatus as RNPermissionStatus,
} from 'react-native-permissions';
import { PERMISSION_STATUS, type PermissionStatus } from '../types/permissions';

type PermissionsResult = {
  notificationsStatus: RNPermissionStatus;
  microphoneStatus: RNPermissionStatus;
  bluetoothStatus: RNPermissionStatus;
};

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

export function createPermissionsStore(waitForActivity?: () => Promise<void>) {
  const isAndroid = Platform.OS === 'android';

  // PERMISSIONS.* ids for checkMultiple/requestMultiple.
  const microphonePermission = isAndroid
    ? PERMISSIONS.ANDROID.RECORD_AUDIO
    : PERMISSIONS.IOS.MICROPHONE;
  const bluetoothPermission = PERMISSIONS.ANDROID.BLUETOOTH_CONNECT;

  // notifications are not in this list —
  // they use a dedicated react-native-permissions API
  const nativePermissions: Permission[] = isAndroid
    ? [microphonePermission, bluetoothPermission]
    : [microphonePermission];

  function toResult(
    notificationsStatus: RNPermissionStatus,
    statuses: Record<string, RNPermissionStatus>,
  ): PermissionsResult {
    return {
      notificationsStatus,
      microphoneStatus: statuses[microphonePermission],
      // ios has no bluetooth-headset runtime permission. apple's ios
      // api avaudiosession routes call audio to paired headsets
      // without the app asking
      bluetoothStatus: isAndroid
        ? statuses[bluetoothPermission]
        : PERMISSION_STATUS.UNAVAILABLE,
    };
  }

  async function checkPermissions(): Promise<PermissionsResult> {
    const [notificationsStatus, statuses] = await Promise.all([
      checkNotifications().then(({ status }) => status),
      checkMultiple(nativePermissions),
    ]);
    return toResult(notificationsStatus, statuses);
  }

  async function requestNativePermissions(): Promise<PermissionsResult> {
    const { status: notificationsStatus } = await requestNotifications([]);
    const statuses = await requestMultiple(nativePermissions);
    return toResult(notificationsStatus, statuses);
  }

  return create<PermissionsStore>(set => {
    const applyPermissionsResults = ({
      notificationsStatus,
      microphoneStatus,
      bluetoothStatus,
    }: PermissionsResult) => {
      const notificationsGranted =
        notificationsStatus === PERMISSION_STATUS.GRANTED;
      const microphoneGranted = microphoneStatus === PERMISSION_STATUS.GRANTED;
      const bluetoothOk =
        bluetoothStatus === PERMISSION_STATUS.GRANTED ||
        bluetoothStatus === PERMISSION_STATUS.UNAVAILABLE;

      set({
        notificationsStatus,
        microphoneStatus,
        bluetoothStatus,
        allPermissionsGranted:
          notificationsGranted && microphoneGranted && bluetoothOk,
        isCheckingPermissions: false,
      });
    };

    const checkAndApply = () =>
      checkPermissions()
        .then(applyPermissionsResults)
        .catch(() => {});

    return {
      notificationsStatus: PERMISSION_STATUS.CHECKING,
      microphoneStatus: PERMISSION_STATUS.CHECKING,
      bluetoothStatus: isAndroid
        ? PERMISSION_STATUS.CHECKING
        : PERMISSION_STATUS.UNAVAILABLE,
      isCheckingPermissions: true,
      permissionsRequested: false,
      allPermissionsGranted: false,
      permissionsSkipped: false,

      initialize: () => {
        Promise.resolve(waitForActivity?.())
          .then(checkAndApply)
          .catch(() => {});

        AppState.addEventListener('change', nextState => {
          if (nextState === 'active') checkAndApply();
        });
      },

      requestPermissions: async () => {
        await waitForActivity?.();

        const result = await requestNativePermissions();
        applyPermissionsResults(result);
        set({ permissionsRequested: true });
      },

      openAppSettings: () => Linking.openSettings(),

      dismiss: () => set({ permissionsSkipped: true }),
    };
  });
}
