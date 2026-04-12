import { useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { BORDER_MUTED, TEXT_MUTED } from '../../styles/colors';
import { pressedStyle } from '../../styles/common';
import InviteModal from './InviteModal';
import PhonePlus from './PhonePlus';
import type { InvitedContact } from '../../../../shared/types/contacts';
import type { RoomId } from '../../../../shared/types/core';

interface InviteCardProps {
  roomId: RoomId;
  onUserInvited: (contact: InvitedContact) => void;
}

export default function InviteCard({ roomId, onUserInvited }: InviteCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && pressedStyle]}
        onPress={() => setIsModalOpen(true)}
      >
        <PhonePlus size={18} color={TEXT_MUTED} />
        <Text style={styles.label}>Add user</Text>
      </Pressable>

      {isModalOpen && (
        <InviteModal
          roomId={roomId}
          onClose={() => setIsModalOpen(false)}
          onUserInvited={contact => {
            setIsModalOpen(false);
            onUserInvited(contact);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_MUTED,
    borderStyle: 'dashed',
    // padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 150,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_MUTED,
    letterSpacing: 0.2,
  },
});
