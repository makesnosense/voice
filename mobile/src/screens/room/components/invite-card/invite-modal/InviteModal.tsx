import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useContactsStore } from '../../../../../stores/useContactsStore';
import { useAuthStore } from '../../../../../stores/useAuthStore';
import { api } from '../../../../../api';
import { pressedStyle } from '../../../../../styles/common';
import {
  BORDER_MUTED,
  TEXT_MUTED,
  TEXT_PRIMARY,
} from '../../../../../styles/colors';
import ContactRow from './ContactRow';
import type { RoomId } from '../../../../../../../shared/types/core';
import type {
  Contact,
  InvitedContact,
} from '../../../../../../../shared/types/contacts';

interface InviteModalProps {
  roomId: RoomId;
  onClose: () => void;
  onUserInvited: (contact: InvitedContact) => void;
}

const SHEET_SLIDE_DURATION = 320;
const BACKDROP_FADE_DURATION = 280;
const SHEET_TRANSLATE_Y = 500;

const ContactSeparator = () => <View style={styles.separator} />;

export default function InviteModal({
  roomId,
  onClose,
  onUserInvited,
}: InviteModalProps) {
  const { contacts, isLoading, refresh } = useContactsStore();
  const [invitedUserId, setInvitedUserId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_TRANSLATE_Y)).current;

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: BACKDROP_FADE_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: SHEET_SLIDE_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, sheetTranslateY]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: BACKDROP_FADE_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_TRANSLATE_Y,
        duration: SHEET_SLIDE_DURATION,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  };

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

  return (
    <Modal transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.container}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents="box-none"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add to call</Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && pressedStyle,
              ]}
              onPress={handleClose}
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
            <ScrollView contentContainerStyle={styles.list}>
              {mobileContacts.map((contact, index) => (
                <View key={contact.id}>
                  {index > 0 && <ContactSeparator />}
                  <ContactRow
                    contact={contact}
                    isInvited={invitedUserId === contact.id}
                    hasError={errorId === contact.id}
                    disabled={invitedUserId !== null}
                    onInvite={handleInvite}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
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
    color: TEXT_PRIMARY,
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER_MUTED,
    marginLeft: 20,
  },
});
