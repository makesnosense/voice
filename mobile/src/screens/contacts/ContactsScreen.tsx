import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
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
import { TEXT_PRIMARY } from '../../styles/colors';
import { pressedStyle } from '../../styles/common';
import ContactRow from './ContactRow';
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="Contacts"
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
      {isLoading && <ActivityIndicator style={styles.loader} color="#94a3b8" />}

      {!isLoading && contacts.length === 0 && (
        <Text style={styles.empty}>No contacts yet</Text>
      )}

      <ScrollView contentContainerStyle={styles.list}>
        {contacts.map((contact, index) => (
          <View key={contact.id}>
            {index > 0 && <ContactSeparator />}
            <ContactRow contact={contact} />
          </View>
        ))}
      </ScrollView>
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2e8f0',
    marginLeft: 20,
  },
});

export default memo(ContactsScreen);
