import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import RNBootSplash from 'react-native-bootsplash';
import { useAuthStore } from './stores/useAuthStore';
import { useContactsStore } from './stores/useContactsStore';
import { useActiveRoomStore } from './stores/useActiveRoomStore';
import { usePermissionsStore } from './stores/usePermissionsStore.android';
import { useDeviceRegistration } from './hooks/useDeviceRegistration';
import { useIncomingCall } from './hooks/useIncomingCall';
import { useRoomLink } from './hooks/useRoomLink';
import { useServerConnectivity } from './hooks/useServerConnectivity';
import { runNativePermissions } from './native/runNativePermissions';
import { prependCallHistoryEntry } from './queries/call-history';
import { CALL_DIRECTION } from '../../shared/constants/calls';
import PermissionsScreen from './screens/PermissionsScreen';
import AuthScreen from './screens/auth/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import RoomScreen from './screens/room/RoomScreen';
import NoConnectionScreen from './screens/NoConnectionScreen';
import type { RoomId } from '../../shared/types/core';

export default function App() {
  const [bootSplashActive, setBootSplashActive] = useState(true);

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
  const serverConnectivity = useServerConnectivity();

  useEffect(() => {
    usePermissionsStore.getState().initialize();
  }, []);

  useEffect(() => {
    if (bootSplashActive) return;
    if (allPermissionsGranted || permissionsSkipped) runNativePermissions();
  }, [allPermissionsGranted, permissionsSkipped, bootSplashActive]);

  useEffect(() => {
    if (serverConnectivity.isChecking) return;
    if (serverConnectivity.isUnreachable) {
      RNBootSplash.hide({ fade: true }).then(() => setBootSplashActive(false));
      return;
    }
    useAuthStore
      .getState()
      .initialize()
      .finally(() => {
        RNBootSplash.hide({ fade: true }).then(() =>
          setBootSplashActive(false),
        );
      });
  }, [serverConnectivity.isChecking, serverConnectivity.isUnreachable]);

  useDeviceRegistration();

  useIncomingCall(incomingCallParams => {
    const contactInStore = useContactsStore
      .getState()
      .contacts.find(contact => contact.id === incomingCallParams.callerUserId);

    prependCallHistoryEntry({
      id: incomingCallParams.callId,
      createdAt: new Date().toISOString(),
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

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <HomeScreen />
    </>
  );
}
