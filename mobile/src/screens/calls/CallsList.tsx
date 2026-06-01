import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BORDER_MUTED, TEXT_MUTED } from '../../styles/colors';
import { startCall } from '../../utils/start-call';
import CallRow from './CallRow';
import type { CallHistoryEntry } from '../../../../shared/types/calls';

interface CallsListProps {
  isPending: boolean;
  history: CallHistoryEntry[];
  contactIdSet: Set<string>;
  onAddContact: (email: string) => Promise<void>; // was: void
}

function CallsList({
  isPending,
  history,
  contactIdSet,
  onAddContact,
}: CallsListProps) {
  if (isPending)
    return <ActivityIndicator style={styles.loader} color={TEXT_MUTED} />;
  if (history.length === 0)
    return <Text style={styles.empty}>No past calls</Text>;

  return history.map(entry => (
    <View key={entry.id}>
      <View style={styles.separator} />
      <CallRow
        entry={entry}
        onPress={() =>
          startCall({
            contactId: entry.contactId,
            contactEmail: entry.contactEmail,
            contactName: entry.contactName,
          })
        }
        onAddToContacts={
          contactIdSet.has(entry.contactId)
            ? undefined
            : () => onAddContact(entry.contactEmail)
        }
      />
    </View>
  ));
}

export default CallsList;

const styles = StyleSheet.create({
  loader: {
    marginTop: 48,
  },
  empty: {
    textAlign: 'center',
    marginTop: 80,
    color: TEXT_MUTED,
    fontSize: 15,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER_MUTED,
    marginLeft: 58,
  },
});
