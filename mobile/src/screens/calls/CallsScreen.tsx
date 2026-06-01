import { memo, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { callHistoryQueryOptions } from '../../queries/call-history';
import { useContactsStore } from '../../stores/useContactsStore';
import Header from '../../components/Header';
import CreateRoomButton from '../../components/CreateRoomButton';
import { BACKGROUND_PRIMARY } from '../../styles/colors';
import NotificationsDisabledBanner from './NotificationsDisabledBanner';
import { useContentPadding } from '../../hooks/useContentPadding';
import RejoinCard from './RejoinCard';
import CallsList from './CallsList';

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
      <ScrollView
        contentContainerStyle={[styles.list, contentPadding]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={contentPadding.paddingTop}
          />
        }
      >
        <CreateRoomButton style={styles.createRoomButton} />
        <RejoinCard />
        <CallsList
          isPending={isPending}
          history={history}
          contactIdSet={contactIdSet}
          onAddContact={addContact}
        />
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
  list: {
    paddingTop: 8,
  },
  createRoomButton: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
});
