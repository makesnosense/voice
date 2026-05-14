import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import {
  NEUTRAL_COLOR,
  BORDER_MUTED,
  TEXT_MUTED,
} from '../../../../styles/colors';
import { pressedStyle } from '../../../../styles/common';
import InviteModal from './invite-modal/InviteModal';
import { UserPlus } from 'lucide-react-native';
import type { InvitedContact } from '../../../../../../shared/types/contacts';
import type { RoomId } from '../../../../../../shared/types/core';

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
        <UserPlus size={34} color={NEUTRAL_COLOR} />
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
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_MUTED,
    letterSpacing: 0.2,
  },
});
