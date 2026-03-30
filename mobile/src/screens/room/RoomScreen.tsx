import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InCallManager from 'react-native-incall-manager';
import { revokeLockScreenBypass } from '../../native/lock-screen-bypass';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';
import { useRoomSocket } from '../../../../shared/hooks/useRoomSocket';
import { useWebRTCStore } from '../../../../shared/stores/useWebRTCStore';
import { useMicrophoneStore } from '../../stores/useMicrophoneStore';
import { useRejoinStore } from '../../stores/useRejoinStore';
import useWebRTCInit from '../../hooks/useWebRTCInit';
import { BASE_URL } from '../../config';
import {
  startCallForegroundService,
  stopCallForegroundService,
} from '../../native/call-foreground-service';
import SelfCard from '../room/SelfCard';
import CopyCard from './CopyCard';
import RemoteUserCard from './RemoteUserCard';
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

const handleJoinSuccess = (roomId: RoomId) => {
  useRejoinStore.setState({ lastRoomId: roomId });
};

export default function RoomScreen({ roomId, onLeave }: RoomScreenProps) {
  const roomUsers = useRoomStore(state => state.roomUsers);
  const isAlone = roomUsers.length === 1;

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
    handleJoinSuccess,
    BASE_URL,
  );

  useWebRTCInit(socketRef);

  useEffect(() => {
    startCallForegroundService();
    InCallManager.start({ media: 'audio' });
    InCallManager.setForceSpeakerphoneOn(false); // start on earpiece by default
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
    <SafeAreaView style={styles.screen}>
      <View style={styles.topSlot}>
        {isAlone ? <CopyCard roomId={roomId} /> : <RemoteUserCard />}
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
