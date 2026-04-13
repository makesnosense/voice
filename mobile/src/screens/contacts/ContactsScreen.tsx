import { useEffect, useState, useMemo, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserPlus, UserMinus } from 'lucide-react-native';
import { useContactsStore } from '../../stores/useContactsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import AddContactScreen from './AddContactScreen';
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

const CONTACTS_VIEW = {
  CONTACTS_LIST: 'contacts-list',
  ADD_CONTACT: 'add-contact',
} as const;

type ContactsView = ObjectValues<typeof CONTACTS_VIEW>;

const ContactSeparator = () => <View style={styles.separator} />;

function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<ContactsView>(CONTACTS_VIEW.CONTACTS_LIST);
  const [isRemoveModeActive, setRemoveModeActive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { contacts, isLoading, fetchContacts, refresh, removeContact } =
    useContactsStore();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const sortedContacts = useMemo(
    () => sortContactsWithMobileFirst(contacts),
    [contacts],
  );

  useEffect(() => {
    if (isAuthenticated) fetchContacts();
  }, [isAuthenticated, fetchContacts]);

  if (view === CONTACTS_VIEW.ADD_CONTACT) {
    return (
      <AddContactScreen onBack={() => setView(CONTACTS_VIEW.CONTACTS_LIST)} />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

      {isLoading && (
        <ActivityIndicator style={styles.loader} color={TEXT_MUTED} />
      )}

      {!isLoading && contacts.length === 0 && (
        <Text style={styles.empty}>No contacts yet</Text>
      )}

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {sortedContacts.map((contact, index) => (
          <View key={contact.id}>
            {index > 0 && <ContactSeparator />}
            <ContactRow
              contact={contact}
              onRemove={
                isRemoveModeActive ? () => removeContact(contact.id) : undefined
              }
            />
          </View>
        ))}
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
  empty: {
    textAlign: 'center',
    marginTop: 80,
    color: TEXT_MUTED,
    fontSize: 15,
  },
  list: {
    paddingTop: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER_MUTED,
    marginLeft: 20,
  },
});

export default memo(ContactsScreen);
