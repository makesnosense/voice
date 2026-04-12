import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { useContactsStore } from '../../stores/useContactsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../api';
import { pressedStyle } from '../../styles/common';
import { BORDER_MUTED, TEXT_MUTED } from '../../styles/colors';
import type { RoomId } from '../../../../shared/types/core';
import type {
  Contact,
  InvitedContact,
} from '../../../../shared/types/contacts';

interface InviteModalProps {
  roomId: RoomId;
  onClose: () => void;
  onUserInvited: (contact: InvitedContact) => void;
}

const ContactSeparator = () => <View style={styles.separator} />;

export default function InviteModal({
  roomId,
  onClose,
  onUserInvited,
}: InviteModalProps) {
  const { contacts, isLoading, fetchContacts } = useContactsStore();
  const [invitedUserId, setInvitedUserId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const mobileContacts = contacts.filter(contact => contact.hasMobileDevice);

  const handleInvite = async (contact: Contact) => {
    if (invitedUserId) return;
    setInvitedUserId(contact.id);
    setErrorId(null);
    try {
      const token = await useAuthStore.getState().getValidAccessToken();
      await api.rooms.inviteToRoom(roomId, { targetUserId: contact.id }, token);
      onUserInvited({ email: contact.email, name: contact.name });
    } catch (error) {
      console.error('Failed to invite contact:', error);
      setErrorId(contact.id);
      setInvitedUserId(null);
    }
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <Pressable
      style={({ pressed }) => [
        styles.contactRow,
        pressed && pressedStyle,
        invitedUserId !== null && styles.contactRowDisabled,
      ]}
      onPress={() => handleInvite(item)}
      disabled={invitedUserId !== null}
    >
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {item.name ?? item.email}
        </Text>
        {item.name && (
          <Text style={styles.contactEmail} numberOfLines={1}>
            {item.email}
          </Text>
        )}
      </View>

      {invitedUserId === item.id && (
        <ActivityIndicator size="small" color="#94a3b8" />
      )}
      {errorId === item.id && <AlertCircle size={16} color="#ef4444" />}
    </Pressable>
  );

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add to call</Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && pressedStyle,
              ]}
              onPress={onClose}
              hitSlop={8}
            >
              <X size={20} color="#64748b" />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator style={styles.loader} color="#94a3b8" />
          ) : mobileContacts.length === 0 ? (
            <Text style={styles.empty}>no contacts with the app installed</Text>
          ) : (
            <FlatList
              data={mobileContacts}
              keyExtractor={contact => contact.id}
              renderItem={renderContact}
              ItemSeparatorComponent={ContactSeparator}
              contentContainerStyle={styles.list}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },

  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    elevation: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER_MUTED,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  loader: {
    marginVertical: 32,
  },
  empty: {
    textAlign: 'center',
    marginVertical: 32,
    color: TEXT_MUTED,
    fontSize: 14,
  },
  list: {
    paddingTop: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    gap: 12,
  },
  contactRowDisabled: {
    opacity: 0.5,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  contactEmail: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER_MUTED,
    marginLeft: 20,
  },
});
