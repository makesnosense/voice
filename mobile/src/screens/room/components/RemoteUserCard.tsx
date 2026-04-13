import { View, Text, StyleSheet } from 'react-native';
import { MicOff, Mic } from 'lucide-react-native';
import { useRoomStore } from '../../../../../shared/stores/useRoomStore';
import { useWebRTCStore } from '../../../../../shared/stores/useWebRTCStore';
import { WEBRTC_CONNECTION_STATE } from '../../../../../shared/constants/webrtc';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  BACKGROUND_PRIMARY,
  BORDER_SUBTLE,
  STATUS_GREEN,
  STATUS_YELLOW,
  STATUS_RED,
} from '../../../styles/colors';

const CONNECTION_DOT_COLOR: Record<string, string> = {
  [WEBRTC_CONNECTION_STATE.WAITING_FOR_OTHER_PEER]: TEXT_MUTED,
  [WEBRTC_CONNECTION_STATE.CONNECTING]: STATUS_YELLOW,
  [WEBRTC_CONNECTION_STATE.CONNECTED]: STATUS_GREEN,
  [WEBRTC_CONNECTION_STATE.FAILED]: STATUS_RED,
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
        <MicOff size={22} color={STATUS_RED} />
      ) : (
        <Mic size={22} color={STATUS_GREEN} />
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
    backgroundColor: BACKGROUND_PRIMARY,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    padding: 28,
    alignItems: 'center',
    gap: 26,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_PRIMARY,
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
    color: TEXT_MUTED,
    includeFontPadding: false,
  },
});
