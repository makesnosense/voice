import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Mic, MicOff, PhoneOff } from 'lucide-react-native';
import { useWebRTCStore } from '../../../../shared/stores/useWebRTCStore';

interface SelfCardProps {
  onLeave: () => void;
}

export default function SelfCard({ onLeave }: SelfCardProps) {
  const isMicActive = useWebRTCStore(state => state.isMicActive);
  const isMutedLocal = useWebRTCStore(state => state.isMutedLocal);
  const toggleMute = useWebRTCStore(state => state.toggleMute);

  return (
    <View style={styles.card}>
      <Text style={styles.name}>You</Text>

      <View style={styles.controls}>
        {isMicActive ? (
          <Pressable
            style={[
              styles.button,
              isMutedLocal ? styles.buttonRed : styles.buttonNeutral,
            ]}
            onPress={toggleMute}
          >
            {isMutedLocal ? (
              <MicOff size={18} color="#ef4444" />
            ) : (
              <Mic size={18} color="#475569" />
            )}
          </Pressable>
        ) : (
          <View style={[styles.button, styles.buttonDisabled]}>
            <MicOff size={18} color="#94a3b8" />
          </View>
        )}

        <Pressable style={[styles.button, styles.buttonRed]} onPress={onLeave}>
          <PhoneOff size={18} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    padding: 20,
    alignItems: 'center',
    gap: 22,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  buttonNeutral: {
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  buttonRed: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  buttonDisabled: {
    borderColor: 'rgba(226, 232, 240, 0.8)',
    opacity: 0.4,
  },
});
