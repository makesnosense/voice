import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PhoneCall } from 'lucide-react-native';
import type { RoomId } from '../../../../shared/types/core';

interface RejoinCardProps {
  roomId: RoomId;
  onPress: (roomId: RoomId) => void;
}

export default function RejoinCard({ roomId, onPress }: RejoinCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => onPress(roomId)}>
      <View style={styles.iconSlot}>
        <PhoneCall size={18} color="#16a34a" strokeWidth={1.75} />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>Ongoing call</Text>
        <Text style={styles.sublabel}>Tap to rejoin</Text>
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
