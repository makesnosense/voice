import { useEffect } from 'react';
import RNBootSplash from 'react-native-bootsplash';
import { useAuthStore } from './stores/useAuthStore';
import { useAppPermissions } from './hooks/useAppPermissions.android';
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

export default function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const activeRoomId = useActiveRoomStore(state => state.activeRoomId);

  const permissions = useAppPermissions();
  const serverConnectivity = useServerConnectivity();

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

  if (permissions.isChecking || serverConnectivity.isChecking) return null;
  if (!permissions.allGranted)
    return <PermissionsScreen permissions={permissions} />;
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
