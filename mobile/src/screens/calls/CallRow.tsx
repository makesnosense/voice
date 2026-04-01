import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PhoneIncoming, PhoneOutgoing } from 'lucide-react-native';
import { CALL_DIRECTION } from '../../../../shared/constants/calls';
import type { CallHistoryEntry } from '../../../../shared/types/calls';

const formatDate = (createdAtIso: string) => {
  const date = new Date(createdAtIso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

interface CallRowProps {
  entry: CallHistoryEntry;
  onPress: (entry: CallHistoryEntry) => void;
}

export default function CallRow({ entry, onPress }: CallRowProps) {
  const isOutgoing = entry.direction === CALL_DIRECTION.OUTGOING;
  const displayName = entry.contactName ?? entry.contactEmail;
  const isCallable = entry.contactHasMobileDevice ?? true;

  return (
    <Pressable
      style={[styles.row, !isCallable && styles.rowDisabled]}
      disabled={!isCallable}
      onPress={() => onPress(entry)}
    >
      <View style={styles.iconSlot}>
        {isOutgoing ? (
          <PhoneOutgoing size={18} color="#64748b" strokeWidth={1.75} />
        ) : (
          <PhoneIncoming size={18} color="#64748b" strokeWidth={1.75} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.direction}>
          {isOutgoing ? CALL_DIRECTION.OUTGOING : CALL_DIRECTION.INCOMING}
        </Text>
      </View>
      <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  direction: {
    fontSize: 13,
    color: '#94a3b8',
  },
  date: {
    fontSize: 13,
    color: '#94a3b8',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
    marginLeft: 58,
  },
  rowDisabled: {
    opacity: 0.38,
  },
});
