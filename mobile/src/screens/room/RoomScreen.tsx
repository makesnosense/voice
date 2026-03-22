// mobile/src/screens/RoomScreen.tsx
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { revokeLockScreenBypass } from '../../native/lock-screen-bypass';
import { useRoomSocket } from '../../../../shared/hooks/useRoomSocket';
import { useWebRTCStore } from '../../../../shared/stores/useWebRTCStore';
import { useMicrophoneStore } from '../../stores/useMicrophoneStore';
import useWebRTCInit from '../../hooks/useWebRTCInit';
import { BASE_URL } from '../../config';
import {
  startCallForegroundService,
  stopCallForegroundService,
} from '../../native/call-foreground-service';
import SelfCard from '../room/SelfCard';
import type { RoomId } from '../../../../shared/types/core';

interface RoomScreenProps {
  roomId: RoomId;
  onLeave: () => void;
}

const handleDisconnect = () => {
  useWebRTCStore.getState().cleanup();
};

const handleCleanup = () => {
  useWebRTCStore.getState().cleanup();
  useMicrophoneStore.getState().cleanup();
};

export default function RoomScreen({ roomId, onLeave }: RoomScreenProps) {
  const requestMicrophone = useMicrophoneStore(
    state => state.requestMicrophone,
  );

  useEffect(() => {
    requestMicrophone();
  }, [requestMicrophone]);

  const socketRef = useRoomSocket(
    roomId,
    handleDisconnect,
    handleCleanup,
    BASE_URL,
  );

  useWebRTCInit(socketRef);

  useEffect(() => {
    startCallForegroundService();
    return () => {
      stopCallForegroundService();
    };
  }, []);

  useEffect(() => {
    return () => {
      revokeLockScreenBypass();
    };
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topSlot}>
        {/* RemoteUserCard / CopyCard goes here */}
      </View>

      <SelfCard onLeave={onLeave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    justifyContent: 'space-between',
  },
  topSlot: {
    flex: 1,
    justifyContent: 'center',
  },
});
