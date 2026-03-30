import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PhoneCall } from 'lucide-react-native';
import { useRejoinStore } from '../../stores/useRejoinStore';
import type { RoomId } from '../../../../shared/types/core';

interface RejoinCardProps {
  onPress: (roomId: RoomId) => void;
}

export default function RejoinCard({ onPress }: RejoinCardProps) {
  const lastRoomId = useRejoinStore(state => state.lastRoomId);
  const userCount = useRejoinStore(state => state.userCount);

  if (!lastRoomId || userCount === null) return null;

  const sublabel =
    userCount === 0
      ? 'Empty — tap to rejoin'
      : `${userCount} person in call · tap to rejoin`;

  return (
    <Pressable style={styles.card} onPress={() => onPress(lastRoomId)}>
      <View style={styles.iconSlot}>
        <PhoneCall size={18} color="#16a34a" strokeWidth={1.75} />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>Ongoing call</Text>
        <Text style={styles.sublabel}>{sublabel}</Text>
      </View>
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
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
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
    color: '#15803d',
  },
  sublabel: {
    fontSize: 13,
    color: '#4ade80',
  },
});
