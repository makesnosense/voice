import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserPlus } from 'lucide-react-native';
import { useContactsStore } from '../../stores/useContactsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import AddContactScreen from './AddContactScreen';
import Header from '../../components/Header';
import { memo } from 'react';

import type { Contact } from '../../../../shared/types/contacts';
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
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { contacts, isLoading, fetchContacts } = useContactsStore();

  useEffect(() => {
    if (isAuthenticated) fetchContacts();
  }, [isAuthenticated, fetchContacts]);

  if (view === CONTACTS_VIEW.ADD_CONTACT) {
    return (
      <AddContactScreen onBack={() => setView(CONTACTS_VIEW.CONTACTS_LIST)} />
    );
  }

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactRow}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name ?? item.email}</Text>
        {item.name && <Text style={styles.contactEmail}>{item.email}</Text>}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Contacts"
        rightSlot={
          <Pressable
            onPress={() => setView(CONTACTS_VIEW.ADD_CONTACT)}
            hitSlop={8}
          >
            <UserPlus size={24} color="#3b82f6" strokeWidth={1.75} />
          </Pressable>
        }
      />
      {isLoading && <ActivityIndicator style={styles.loader} color="#94a3b8" />}

      {!isLoading && contacts.length === 0 && (
        <Text style={styles.empty}>no contacts yet</Text>
      )}

      <FlatList
        data={contacts}
        keyExtractor={contact => contact.id}
        renderItem={renderContact}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={ContactSeparator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loader: {
    marginTop: 48,
  },
  empty: {
    textAlign: 'center',
    marginTop: 80,
    color: '#94a3b8',
    fontSize: 15,
  },
  list: {
    paddingTop: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 14,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '500',
  },
  contactEmail: {
    color: '#94a3b8',
    fontSize: 13,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
    marginLeft: 20, // aligns with text, not the avatar
  },
});

export default memo(ContactsScreen);
