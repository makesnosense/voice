import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  PhoneIncoming,
  PhoneOutgoing,
  UserPlus,
  AlertCircle,
} from 'lucide-react-native';
import { CALL_DIRECTION } from '../../../../shared/constants/calls';
import {
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BACKGROUND_CARD,
} from '../../styles/colors';
import { pressedStyle } from '../../styles/common';
import type { CallHistoryEntry } from '../../../../shared/types/calls';

const ERROR_RESET_MS = 2000;

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
  onAddToContacts?: () => Promise<void>;
}

export default function CallRow({
  entry,
  onPress,
  onAddToContacts,
}: CallRowProps) {
  const isOutgoing = entry.direction === CALL_DIRECTION.OUTGOING;
  const displayName = entry.contactName ?? entry.contactEmail;
  const isCallable = entry.contactHasMobileDevice ?? true;

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [hasAddError, setHasAddError] = useState(false);

  useEffect(() => {
    if (!hasAddError) return;
    const timer = setTimeout(() => setHasAddError(false), ERROR_RESET_MS);
    return () => clearTimeout(timer);
  }, [hasAddError]);

  const handleAddToContacts = async () => {
    if (isAddingContact || !onAddToContacts) return;
    setIsAddingContact(true);
    setHasAddError(false);
    try {
      await onAddToContacts();
    } catch {
      setHasAddError(true);
    } finally {
      setIsAddingContact(false);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
        !isCallable && styles.rowDisabled,
      ]}
      disabled={!isCallable}
      onPress={() => onPress(entry)}
    >
      <View style={styles.iconSlot}>
        {isOutgoing ? (
          <PhoneOutgoing size={18} color={TEXT_SECONDARY} strokeWidth={1.75} />
        ) : (
          <PhoneIncoming size={18} color={TEXT_SECONDARY} strokeWidth={1.75} />
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

      {onAddToContacts && (
        <Pressable
          onPress={handleAddToContacts}
          disabled={isAddingContact}
          style={({ pressed }) => [styles.addButton, pressed && pressedStyle]}
          hitSlop={12}
        >
          {isAddingContact ? (
            <ActivityIndicator size="small" color={TEXT_MUTED} />
          ) : hasAddError ? (
            <AlertCircle size={22} color="#ef4444" />
          ) : (
            <UserPlus size={22} color={TEXT_PRIMARY} />
          )}
        </Pressable>
      )}
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
    color: TEXT_PRIMARY,
  },
  direction: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  date: {
    fontSize: 13,
    color: TEXT_MUTED,
    width: 64,
    textAlign: 'right',
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDisabled: {
    opacity: 0.38,
  },
  rowPressed: {
    backgroundColor: BACKGROUND_CARD,
  },
});
