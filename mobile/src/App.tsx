import { useEffect } from 'react';
import RNBootSplash from 'react-native-bootsplash';
import { useAuthStore } from './stores/useAuthStore';
import { useDeviceRegistration } from './hooks/useDeviceRegistration';
import { useIncomingCall } from './hooks/useIncomingCall';
import PermissionsScreen from './screens/PermissionsScreen';
import AuthScreen from './screens/auth/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import RoomScreen from './screens/room/RoomScreen';
import { CALL_DIRECTION } from '../../shared/constants/calls';
import { useCallHistoryStore } from './stores/useCallHistoryStore';
import { useContactsStore } from './stores/useContactsStore';
import { useActiveRoomStore } from './stores/useActiveRoomStore';
import { useRoomLink } from './hooks/useRoomLink';
import { useServerConnectivity } from './hooks/useServerConnectivity';
import NoConnectionScreen from './screens/NoConnectionScreen';

import type { RoomId } from '../../shared/types/core';
import { usePermissionsStore } from './stores/usePermissionsStore.android';
import { useShallow } from 'zustand/react/shallow';

export default function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { isCheckingPermissions, allPermissionsGranted, permissionsSkipped } =
    usePermissionsStore(
      useShallow(state => ({
        isCheckingPermissions: state.isCheckingPermissions,
        allPermissionsGranted: state.allPermissionsGranted,
        permissionsSkipped: state.permissionsSkipped,
      })),
    );

  const activeRoomId = useActiveRoomStore(state => state.activeRoomId);

  // const permissions = useAppPermissions();
  const serverConnectivity = useServerConnectivity();

  useEffect(() => {
    usePermissionsStore.getState().initialize();
  }, []);

  useEffect(() => {
    if (serverConnectivity.isChecking) return;
    if (serverConnectivity.isUnreachable) {
      RNBootSplash.hide({ fade: true });
      return;
    }

    useAuthStore
      .getState()
      .initialize()
      .finally(() => {
        RNBootSplash.hide({ fade: true });
      });
  }, [serverConnectivity.isChecking, serverConnectivity.isUnreachable]);

  useDeviceRegistration();

  useIncomingCall(incomingCallParams => {
    const contactInStore = useContactsStore
      .getState()
      .contacts.find(contact => contact.id === incomingCallParams.callerUserId);

    useCallHistoryStore.getState().prependEntry({
      direction: CALL_DIRECTION.INCOMING,
      contactId: incomingCallParams.callerUserId,
      contactEmail: incomingCallParams.callerEmail,
      contactName: incomingCallParams.callerName,
      contactHasMobileDevice: contactInStore?.hasMobileDevice ?? true,
    });

    useActiveRoomStore.setState({
      activeRoomId: incomingCallParams.roomId as RoomId,
    });
  });

  useRoomLink(roomId => {
    useActiveRoomStore.setState({ activeRoomId: roomId });
  });

  if (isCheckingPermissions || serverConnectivity.isChecking) return null;
  if (!allPermissionsGranted && !permissionsSkipped)
    return <PermissionsScreen />;

  if (serverConnectivity.isUnreachable)
    return (
      <NoConnectionScreen
        onRetry={serverConnectivity.retry}
        isRetrying={serverConnectivity.isRetrying}
      />
    );
  if (activeRoomId)
    return (
      <RoomScreen
        roomId={activeRoomId}
        onLeave={() => useActiveRoomStore.setState({ activeRoomId: null })}
      />
    );

  if (!isAuthenticated) return <AuthScreen />;

  return <HomeScreen />;
}
