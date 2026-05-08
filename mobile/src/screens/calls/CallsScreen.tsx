import { memo, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallHistoryStore } from '../../stores/useCallHistoryStore';
import { useContactsStore } from '../../stores/useContactsStore';
import { startCall } from '../../utils/start-call';
import CallRow from './CallRow';
import RejoinCard from './RejoinCard';
import Header from '../../components/Header';
import CreateRoomButton from '../../components/CreateRoomButton';
import {
  TEXT_MUTED,
  BORDER_MUTED,
  BACKGROUND_PRIMARY,
} from '../../styles/colors';

function CallsScreen() {
  const insets = useSafeAreaInsets();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { history, isLoading, fetchHistory, refresh } = useCallHistoryStore(
    useShallow(state => ({
      history: state.history,
      isLoading: state.isLoading,
      fetchHistory: state.fetchHistory,
      refresh: state.refresh,
    })),
  );

  const contacts = useContactsStore(state => state.contacts);
  const fetchContacts = useContactsStore(state => state.fetchContacts);
  const addContact = useContactsStore(state => state.addContact);

  const contactIdSet = useMemo(
    () => new Set(contacts.map(contact => contact.id)),
    [contacts],
  );

  useEffect(() => {
    fetchHistory();
    fetchContacts();
  }, [fetchHistory, fetchContacts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Calls" />

      <RejoinCard />

      {isLoading && history.length === 0 && (
        <ActivityIndicator style={styles.loader} color={TEXT_MUTED} />
      )}

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <CreateRoomButton style={styles.createRoomButton} />
        {!isLoading && history.length === 0 && (
          <Text style={styles.empty}>No past calls</Text>
        )}

        {history.map(entry => {
          return (
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
                    : () => addContact(entry.contactEmail)
                }
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  loader: {
    marginTop: 48,
  },
  list: {
    paddingTop: 8,
  },
  createRoomButton: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER_MUTED,
    marginLeft: 58,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: TEXT_MUTED,
    fontSize: 15,
  },
});

export default memo(CallsScreen);
