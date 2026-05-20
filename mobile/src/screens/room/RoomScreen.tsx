import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InCallManager from 'react-native-incall-manager';
import { revokeLockScreenBypass } from '../../native/lock-screen-bypass';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';
import { useRoomSocket } from '../../../../shared/hooks/useRoomSocket';
import { useWebRTCStore } from '../../../../shared/stores/useWebRTCStore';
import { useMicrophoneStore } from '../../stores/useMicrophoneStore';
import { useRejoinStore } from '../../stores/useRejoinStore';
import { useAuthStore } from '../../stores/useAuthStore';
import useWebRTCInit from '../../hooks/useWebRTCInit';
import { BASE_URL } from '../../config';
import {
  startCallForegroundService,
  stopCallForegroundService,
} from '../../native/call-foreground-service';
import SelfCard from './components/SelfCard';
import { BACKGROUND_SECONDARY, TEXT_MUTED } from '../../styles/colors';
import type { RoomId } from '../../../../shared/types/core';
import RoomTop from './RoomTop';

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

const handleJoinSuccess = (roomId: RoomId) => {
  useRejoinStore.setState({ lastRoomId: roomId });
};

export default function RoomScreen({ roomId, onLeave }: RoomScreenProps) {
  const insets = useSafeAreaInsets();
  const roomUsers = useRoomStore(state => state.roomUsers);

  const isLoading = roomUsers.length === 0;

  const requestMicrophone = useMicrophoneStore(
    state => state.requestMicrophone,
  );

  const accessToken = useAuthStore(state => state.accessToken);

  useEffect(() => {
    requestMicrophone();
  }, [requestMicrophone]);

  const socketRef = useRoomSocket(
    roomId,
    handleDisconnect,
    handleCleanup,
    accessToken ?? undefined,
    handleJoinSuccess,
    BASE_URL,
  );
  useWebRTCInit(socketRef);

  useEffect(() => {
    startCallForegroundService();
    InCallManager.start({ media: 'audio' });
    InCallManager.setForceSpeakerphoneOn(false);
    return () => {
      stopCallForegroundService();
      InCallManager.stop();
    };
  }, []);

  useEffect(() => {
    return () => {
      revokeLockScreenBypass();
    };
  }, []);

  return (
    <View style={[styles.screen, { paddingVertical: insets.top + 16 }]}>
      <View style={styles.roomTop}>
        {isLoading ? (
          <ActivityIndicator color={TEXT_MUTED} />
        ) : (
          <RoomTop roomId={roomId} />
        )}
      </View>

      <SelfCard onLeave={onLeave} isLoading={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND_SECONDARY,
    justifyContent: 'space-between',
  },
  roomTop: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
});
