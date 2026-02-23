import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoomSocket } from '../../../shared/hooks/useRoomSocket';
import { useRoomStore } from '../../../shared/stores/useRoomStore';

import type { RoomId } from '../../../shared/types';

interface RoomScreenProps {
  roomId: RoomId;
  onLeave: () => void;
}

export const SOCKET_URL = __DEV__
  ? 'https://localhost:3003'
  : 'https://voice.k.vu';

export default function RoomScreen({ roomId, onLeave }: RoomScreenProps) {
  useRoomSocket(roomId, () => {}, onLeave, SOCKET_URL);

  const connectionStatus = useRoomStore(state => state.connectionStatus);
  const roomUsers = useRoomStore(state => state.roomUsers);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice</Text>
      <Text style={styles.status}>{connectionStatus}</Text>

      {roomUsers.map(user => (
        <Text key={user.userId} style={styles.user}>
          {user.userId}
        </Text>
      ))}

      <TouchableOpacity style={styles.leaveButton} onPress={onLeave}>
        <Text style={styles.leaveText}>leave</Text>
      </TouchableOpacity>
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
