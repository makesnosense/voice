import { useEffect, useState } from 'react';
import RNBootSplash from 'react-native-bootsplash';
import { useAuthStore } from './stores/useAuthStore';
import { useAppPermissions } from './hooks/useAppPermissions.android';
import { useDeviceRegistration } from './hooks/useDeviceRegistration';
import { useIncomingCall } from './hooks/useIncomingCall';
import PermissionsScreen from './screens/PermissionsScreen';
import AuthScreen from './screens/auth/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import RoomScreen from './screens/room/RoomScreen';
import type { RoomId } from '../../shared/types/core';

export default function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [activeRoomId, setActiveRoomId] = useState<RoomId | null>(null);

  const permissions = useAppPermissions();

  useEffect(() => {
    useAuthStore
      .getState()
      .initialize()
      .finally(() => {
        RNBootSplash.hide({ fade: true });
      });
  }, []);

  useDeviceRegistration();
  useIncomingCall(roomId => setActiveRoomId(roomId as RoomId));

  if (permissions.isChecking) return null;
  if (!permissions.allGranted)
    return <PermissionsScreen permissions={permissions} />;
  if (activeRoomId)
    return (
      <RoomScreen roomId={activeRoomId} onLeave={() => setActiveRoomId(null)} />
    );
  if (!isAuthenticated) return <AuthScreen />;

  return <HomeScreen onCall={roomId => setActiveRoomId(roomId as RoomId)} />;
}
