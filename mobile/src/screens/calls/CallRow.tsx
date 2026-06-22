import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { UserPlus, AlertCircle } from 'lucide-react-native';
import {
  CALL_DIRECTION,
  CALL_OUTCOME,
  CallDirection,
  CallOutcome,
} from '../../../../shared/constants/calls';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  BACKGROUND_CARD,
  TEXT_DANGER,
} from '../../styles/colors';
import { pressedStyle } from '../../styles/common';
import type { CallHistoryEntry } from '../../../../shared/types/calls';
import CallIcon from './CallIcon';
import { formatCallTimestamp } from '../../../../shared/utils/format';

const ERROR_RESET_MS = 2000;

interface CallRowProps {
  entry: CallHistoryEntry;
  onPress: (entry: CallHistoryEntry) => void;
  onAddToContacts?: () => Promise<void>;
}

function getCallLabel(direction: CallDirection, outcome: CallOutcome): string {
  if (direction === CALL_DIRECTION.INCOMING) {
    if (
      outcome === CALL_OUTCOME.CANCELLED ||
      outcome === CALL_OUTCOME.NO_ANSWER
    )
      return 'Missed';
    if (outcome === CALL_OUTCOME.DECLINED) return 'Declined';
    return 'Incoming';
  } else {
    if (outcome === CALL_OUTCOME.CANCELLED) return 'Cancelled';
    if (outcome === CALL_OUTCOME.NO_ANSWER) return 'No answer';
    return 'Outgoing';
  }
}

export default function CallRow({
  entry,
  onPress,
  onAddToContacts,
}: CallRowProps) {
  const isIncoming = entry.direction === CALL_DIRECTION.INCOMING;
  const isMissedOrCancelled =
    entry.outcome === CALL_OUTCOME.NO_ANSWER ||
    entry.outcome === CALL_OUTCOME.CANCELLED;
  const isMissedIncoming = isIncoming && isMissedOrCancelled;

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
        <CallIcon direction={entry.direction} isRed={isMissedIncoming} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={[styles.direction, isMissedIncoming && styles.missedCall]}>
          {getCallLabel(entry.direction, entry.outcome)}
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
      <Text style={styles.date}>{formatCallTimestamp(entry.createdAt)}</Text>
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
  missedCall: {
    color: TEXT_DANGER,
  },
});
