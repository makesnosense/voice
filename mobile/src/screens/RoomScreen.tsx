import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRoomSocket } from '../../../shared/hooks/useRoomSocket';
import { useRoomStore } from '../../../shared/stores/useRoomStore';
import { useWebRTCStore } from '../../../shared/stores/useWebRTCStore';
import { useMicrophoneStore } from '../stores/useMicrophoneStore';
import useWebRTCInit from '../hooks/useWebRTCInit';
import { BASE_URL } from '../config';
import type { RoomId } from '../../../shared/types';

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
  const connectionStatus = useRoomStore(state => state.connectionStatus);
  const roomUsers = useRoomStore(state => state.roomUsers);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice</Text>
      <Text style={styles.status}>{connectionStatus}</Text>

      {roomUsers.map(user => (
        <Text key={user.userId} style={styles.user}>
          {user.userId}
        </Text>
      ))}

      <Pressable style={styles.leaveButton} onPress={onLeave}>
        <Text style={styles.leaveText}>leave</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  status: {
    fontSize: 14,
    color: '#94a3b8',
  },
  user: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  leaveButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 8,
    padding: 14,
    paddingHorizontal: 32,
  },
  leaveText: {
    color: '#fca5a5',
    fontSize: 16,
  },
});
