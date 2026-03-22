import { View, Text, StyleSheet } from 'react-native';
import { MicOff, Mic } from 'lucide-react-native';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';
import { useWebRTCStore } from '../../../../shared/stores/useWebRTCStore';
import { WEBRTC_CONNECTION_STATE } from '../../../../shared/constants/webrtc';

const CONNECTION_DOT_COLOR: Record<string, string> = {
  [WEBRTC_CONNECTION_STATE.WAITING_FOR_OTHER_PEER]: '#94a3b8',
  [WEBRTC_CONNECTION_STATE.CONNECTING]: '#fbbf24',
  [WEBRTC_CONNECTION_STATE.CONNECTED]: '#22c55e',
  [WEBRTC_CONNECTION_STATE.FAILED]: '#ef4444',
};

export default function RemoteUserCard() {
  const roomUsers = useRoomStore(state => state.roomUsers);
  const remoteUserId = useWebRTCStore(state => state.remoteUserId);
  const webRTCConnectionState = useWebRTCStore(
    state => state.webRTCConnectionState,
  );

  const remoteUser = roomUsers.find(u => u.userId === remoteUserId);

  return (
    <View style={styles.card}>
      <Text style={styles.name}>Other</Text>

      {remoteUser?.isMuted ? (
        <MicOff size={22} color="#ef4444" />
      ) : (
        <Mic size={22} color="#22c55e" />
      )}

      {webRTCConnectionState && (
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.dot,
              { backgroundColor: CONNECTION_DOT_COLOR[webRTCConnectionState] },
            ]}
          />
          <Text style={styles.connectionLabel}>{webRTCConnectionState}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    padding: 28,
    alignItems: 'center',
    gap: 26,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  connectionStatus: {
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  connectionLabel: {
    fontSize: 11,
    color: '#94a3b8',
    includeFontPadding: false,
  },
});
