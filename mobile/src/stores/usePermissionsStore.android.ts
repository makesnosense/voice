import { create } from 'zustand';
import { AppState, Linking } from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  checkNotifications,
  requestNotifications,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import { PERMISSION_STATUS, type PermissionStatus } from '../types/permissions';
import { waitForActivity } from '../utils/wait-for-activity';
import { runNativePermissions } from '../native/runNativePermissions';

function toStatus(granted: boolean): PermissionStatus {
  return granted ? PERMISSION_STATUS.GRANTED : PERMISSION_STATUS.DENIED;
}

function checkPermissions() {
  return Promise.all([
    checkNotifications().then(({ status }) => status === RESULTS.GRANTED),
    checkMultiple([PERMISSIONS.ANDROID.RECORD_AUDIO]).then(
      statuses =>
        statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.GRANTED,
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
    boolean,
    boolean,
  ]) => {
    const notificationsStatus = toStatus(notifications);
    const microphoneStatus = toStatus(microphone);
    const allPermissionsGranted =
      notificationsStatus === PERMISSION_STATUS.GRANTED &&
      microphoneStatus === PERMISSION_STATUS.GRANTED;

    set({
      notificationsStatus,
      microphoneStatus,
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
      applyPermissionsResults(
        await Promise.all([
          requestNotifications([]).then(
            ({ status }) => status === RESULTS.GRANTED,
          ),
          requestMultiple([PERMISSIONS.ANDROID.RECORD_AUDIO]).then(
            statuses =>
              statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.GRANTED,
          ),
        ]),
      );
      set({ permissionsRequested: true });
    },

    openAppSettings: () => Linking.openSettings(),

    dismiss: () => {
      set({ permissionsSkipped: true });
      runNativePermissions();
    },
  };
});
