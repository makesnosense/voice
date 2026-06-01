import { memo, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { callHistoryQueryOptions } from '../../queries/call-history';
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
import NotificationsDisabledBanner from './NotificationsDisabledBanner';
import { useContentPadding } from '../../hooks/useContentPadding';

function CallsScreen() {
  const contentPadding = useContentPadding();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: history = [], isPending } = useQuery(callHistoryQueryOptions);

  const contacts = useContactsStore(state => state.contacts);
  const fetchContacts = useContactsStore(state => state.fetchContacts);
  const addContact = useContactsStore(state => state.addContact);

  const contactIdSet = useMemo(
    () => new Set(contacts.map(contact => contact.id)),
    [contacts],
  );

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: callHistoryQueryOptions.queryKey,
    });
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Header title="Calls" />
      <NotificationsDisabledBanner />

      {isPending && (
        <ActivityIndicator style={styles.loader} color={TEXT_MUTED} />
      )}

      <ScrollView
        contentContainerStyle={[styles.list, contentPadding]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <CreateRoomButton style={styles.createRoomButton} />
        <RejoinCard />
        {!isPending && history.length === 0 && (
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

export default memo(CallsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  loader: {
    marginTop: 48,
  },
  empty: {
    textAlign: 'center',
    marginTop: 80,
    color: TEXT_MUTED,
    fontSize: 15,
  },
  list: {
    paddingTop: 8,
  },
  createRoomButton: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER_MUTED,
    marginLeft: 58,
  },
});
