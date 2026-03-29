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
import { memo } from 'react';

import type { Contact } from '../../../../shared/types/contacts';
import type { ObjectValues } from '../../../../shared/types/core';

const CONTACTS_VIEW = {
  CONTACTS_LIST: 'contacts-list',
  ADD_CONTACT: 'add-contact',
} as const;

type ContactsView = ObjectValues<typeof CONTACTS_VIEW>;
const ContactSeparator = () => <View style={contactsScreenStyles.separator} />;

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
    <View style={contactsScreenStyles.contactRow}>
      <View style={contactsScreenStyles.contactInfo}>
        <Text style={contactsScreenStyles.contactName}>
          {item.name ?? item.email}
        </Text>
        {item.name && (
          <Text style={contactsScreenStyles.contactEmail}>{item.email}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[contactsScreenStyles.container, { paddingTop: insets.top }]}>
      <View style={contactsScreenStyles.header}>
        <Text style={contactsScreenStyles.headerTitle}>Contacts</Text>
        <Pressable
          onPress={() => setView(CONTACTS_VIEW.ADD_CONTACT)}
          style={contactsScreenStyles.headerButton}
          hitSlop={8}
        >
          <UserPlus size={24} color="#3b82f6" strokeWidth={1.75} />
        </Pressable>
      </View>

      {isLoading && (
        <ActivityIndicator
          style={contactsScreenStyles.loader}
          color="#94a3b8"
        />
      )}

      {!isLoading && contacts.length === 0 && (
        <Text style={contactsScreenStyles.empty}>no contacts yet</Text>
      )}

      <FlatList
        data={contacts}
        keyExtractor={contact => contact.id}
        renderItem={renderContact}
        contentContainerStyle={contactsScreenStyles.list}
        ItemSeparatorComponent={ContactSeparator}
      />
    </View>
  );
}

const contactsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '500',
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
