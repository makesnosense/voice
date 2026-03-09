import { useCallback, useEffect, useState } from 'react';
import {
  checkMultiple,
  requestMultiple,
  checkNotifications,
  requestNotifications,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {
  PERMISSION_STATUS,
  type PermissionStatus,
  type AppPermissions,
} from './useAppPermissions.types';
import { waitForActivity } from '../utils/wait-for-activity';

function toStatus(granted: boolean): PermissionStatus {
  return granted ? PERMISSION_STATUS.GRANTED : PERMISSION_STATUS.DENIED;
}

function checkAll() {
  return Promise.all([
    checkNotifications().then(({ status }) => status === RESULTS.GRANTED),
    checkMultiple([PERMISSIONS.ANDROID.RECORD_AUDIO]).then(
      statuses =>
        statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.GRANTED,
    ),
  ]);
}

function requestAll() {
  return Promise.all([
    requestNotifications([]).then(({ status }) => status === RESULTS.GRANTED),
    requestMultiple([PERMISSIONS.ANDROID.RECORD_AUDIO]).then(
      statuses =>
        statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.GRANTED,
    ),
  ]);
}

export function useAppPermissions(): AppPermissions {
  const [notificationsStatus, setNotificationsStatus] =
    useState<PermissionStatus>(PERMISSION_STATUS.CHECKING);

  const [microphoneStatus, setMicrophoneStatus] = useState<PermissionStatus>(
    PERMISSION_STATUS.CHECKING,
  );

  const applyStatuses = useCallback(
    ([notifications, microphone]: [boolean, boolean]) => {
      setNotificationsStatus(toStatus(notifications));
      setMicrophoneStatus(toStatus(microphone));
    },
    [],
  );

  useEffect(() => {
    waitForActivity()
      .then(() => checkAll())
      .then(applyStatuses)
      .catch(() => {});
  }, [applyStatuses]);

  const handleRequestAll = useCallback(async () => {
    await waitForActivity();
    applyStatuses(await requestAll());
  }, [applyStatuses]);

  const allGranted =
    notificationsStatus === PERMISSION_STATUS.GRANTED &&
    microphoneStatus === PERMISSION_STATUS.GRANTED;

  return {
    notificationsPermission: { status: notificationsStatus },
    microphonePermission: { status: microphoneStatus },
    allGranted,
    requestAll: handleRequestAll,
  };
}
