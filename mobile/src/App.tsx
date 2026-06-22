import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import RNBootSplash from 'react-native-bootsplash';
import { useAuthStore } from './stores/useAuthStore';
import { queryClient } from './query-client';
import { contactsQueryOptions } from './queries/contacts';
import { useActiveRoomStore } from './stores/useActiveRoomStore';
import { usePermissionsStore } from './stores/usePermissionsStore.android';
import { useDeviceRegistration } from './hooks/useDeviceRegistration';
import { useAnsweredCallDeepLink } from './hooks/useAnsweredCallDeepLink';
import { useRoomLink } from './hooks/useRoomLink';
import { useServerConnectivity } from './hooks/useServerConnectivity';
import { runNativePermissions } from './native/runNativePermissions';
import { prependCallHistoryEntry } from './queries/call-history';
import { CALL_DIRECTION, CALL_OUTCOME } from '../../shared/constants/calls';
import PermissionsScreen from './screens/PermissionsScreen';
import RoomScreen from './screens/room/RoomScreen';
import NoConnectionScreen from './screens/NoConnectionScreen';
import type { RoomId } from '../../shared/types/core';
import type { Contact } from '../../shared/types/contacts';
import { api } from './api';
import { useDismissedCallLogs } from './hooks/useDismissedCallLogsSync';
import AuthOrHome from './AuthOrHome';

export default function App() {
  const [bootSplashActive, setBootSplashActive] = useState(true);

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

  useAnsweredCallDeepLink(params => {
    const cachedContacts =
      queryClient.getQueryData<Contact[]>(contactsQueryOptions.queryKey) ?? [];
    const contactInStore = cachedContacts.find(
      contact => contact.id === params.callerUserId,
    );

    useAuthStore
      .getState()
      .getValidAccessToken()
      .then(token => api.calls.markAnswered(params.callId, token))
      .catch(err =>
        console.error('❌ Failed to record answered outcome:', err),
      );

    prependCallHistoryEntry({
      id: params.callId,
      createdAt: new Date().toISOString(),
      direction: CALL_DIRECTION.INCOMING,
      outcome: CALL_OUTCOME.ANSWERED,
      contactId: params.callerUserId,
      contactEmail: params.callerEmail,
      contactName: params.callerName,
      contactHasMobileDevice: contactInStore?.hasMobileDevice ?? true,
    });

    useActiveRoomStore.setState({
      activeRoomId: params.roomId as RoomId,
    });
  });

  useDismissedCallLogs();

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

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={styles.screenStack}>
        <View style={[styles.layer, activeRoomId && styles.hiddenLayer]}>
          <AuthOrHome />
        </View>
        {activeRoomId && (
          <View style={styles.layer}>
            <RoomScreen
              roomId={activeRoomId}
              onLeave={() =>
                useActiveRoomStore.setState({ activeRoomId: null })
              }
            />
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screenStack: {
    flex: 1,
  },
  layer: {
    ...StyleSheet.absoluteFill,
  },
  hiddenLayer: {
    display: 'none',
  },
});
