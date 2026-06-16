import { useMemo, useState, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { UserPlus, UserMinus } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  contactsQueryOptions,
  useRemoveContactMutation,
} from '../../queries/contacts';
import AddContactScreen from './add-contact/AddContactScreen';
import Header from '../../components/Header';
import ContactRow from './ContactRow';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  BORDER_MUTED,
  BACKGROUND_PRIMARY,
} from '../../styles/colors';
import { pressedStyle } from '../../styles/common';
import { sortContactsWithMobileFirst } from '../../../../shared/utils/sort-contacts';
import type { ObjectValues } from '../../../../shared/types/core';
import { useContentPadding } from '../../hooks/useContentPadding';

const CONTACTS_VIEW = {
  CONTACTS_LIST: 'contacts-list',
  ADD_CONTACT: 'add-contact',
} as const;

type ContactsView = ObjectValues<typeof CONTACTS_VIEW>;

const ContactSeparator = () => <View style={styles.separator} />;

function ContactsScreen() {
  const listPadding = useContentPadding();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ContactsView>(CONTACTS_VIEW.CONTACTS_LIST);
  const [isRemoveModeActive, setRemoveModeActive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: contacts = [], isPending } = useQuery(contactsQueryOptions);
  const removeContactMutation = useRemoveContactMutation();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({
      queryKey: contactsQueryOptions.queryKey,
    });
    setIsRefreshing(false);
  };

  const sortedContacts = useMemo(
    () => sortContactsWithMobileFirst(contacts),
    [contacts],
  );

  if (view === CONTACTS_VIEW.ADD_CONTACT) {
    return (
      <AddContactScreen onBack={() => setView(CONTACTS_VIEW.CONTACTS_LIST)} />
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Contacts"
        leftSlot={
          <Pressable
            style={({ pressed }) => pressed && pressedStyle}
            onPress={() => setRemoveModeActive(prev => !prev)}
            hitSlop={8}
          >
            <UserMinus
              size={22}
              color={isRemoveModeActive ? '#ef4444' : TEXT_PRIMARY}
              strokeWidth={1.75}
            />
          </Pressable>
        }
        rightSlot={
          <Pressable
            style={({ pressed }) => pressed && pressedStyle}
            onPress={() => setView(CONTACTS_VIEW.ADD_CONTACT)}
            hitSlop={8}
          >
            <UserPlus size={22} color={TEXT_PRIMARY} strokeWidth={1.75} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.list, listPadding]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={listPadding.paddingTop}
          />
        }
      >
        {isPending && (
          <ActivityIndicator style={styles.loader} color={TEXT_MUTED} />
        )}

        {contacts.length === 0 && !isPending ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>No contacts yet</Text>
          </View>
        ) : (
          sortedContacts.map((contact, index) => (
            <View key={contact.id}>
              {index > 0 && <ContactSeparator />}
              <ContactRow
                contact={contact}
                onRemove={
                  isRemoveModeActive
                    ? () => removeContactMutation.mutateAsync(contact.id)
                    : undefined
                }
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

export default memo(ContactsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  loader: {
    marginTop: 48,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    color: TEXT_MUTED,
    fontSize: 15,
  },
  list: {
    paddingTop: 8,
    flexGrow: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER_MUTED,
    marginLeft: 20,
  },
});
