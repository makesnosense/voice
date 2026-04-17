import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PhoneCall, X } from 'lucide-react-native';
import { useRejoinStore } from '../../stores/useRejoinStore';
import { useActiveRoomStore } from '../../stores/useActiveRoomStore';
import { pressedStyle } from '../../styles/common';
import { BACKGROUND_PRIMARY } from '../../styles/colors';

const GREEN = {
  BG: '#f0fdf4',
  BORDER: '#bbf7d0',
  ICON: '#16a34a',
  TEXT: '#15803d',
  MUTED: '#4ade80',
} as const;

const RED = {
  BORDER: '#ef4444',
  TEXT: '#ef4444',
} as const;

const dismissRejoinCard = () =>
  useRejoinStore.setState({ lastRoomId: null, userCount: null });

export default function RejoinCard() {
  const lastRoomId = useRejoinStore(state => state.lastRoomId);
  const userCount = useRejoinStore(state => state.userCount);

  if (!lastRoomId || userCount === null) return null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && pressedStyle]}
      onPress={() => useActiveRoomStore.setState({ activeRoomId: lastRoomId })}
    >
      <View style={styles.iconSlot}>
        <PhoneCall size={18} color={GREEN.ICON} strokeWidth={1.75} />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>
          Active room:{' '}
          {userCount === 0
            ? 'empty'
            : `${userCount} ${userCount === 1 ? 'person' : 'people'} inside`}
        </Text>
        <Text style={styles.sublabel}>Tap to rejoin</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.dismissButton, pressed && pressedStyle]}
        onPress={dismissRejoinCard}
      >
        <X size={14} color={RED.TEXT} strokeWidth={1.5} />
        <Text style={styles.dismissLabel}>Dismiss</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: GREEN.BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GREEN.BORDER,
    gap: 14,
  },
  iconSlot: {
    width: 24,
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: GREEN.TEXT,
  },
  sublabel: {
    fontSize: 13,
    color: GREEN.MUTED,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 40,
    width: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: RED.BORDER,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  dismissLabel: {
    fontSize: 11,
    color: RED.TEXT,
  },
});
