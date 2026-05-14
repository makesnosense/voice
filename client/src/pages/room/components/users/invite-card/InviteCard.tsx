import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import baseStyles from '../../../../../styles/BaseCard.module.css';
import styles from './InviteCard.module.css';
import InviteModal from './invite-modal/InviteModal';
import type { RoomId } from '../../../../../../../shared/types/core';
import type { InvitedContact } from '../../../../../../../shared/types/contacts';

interface InviteCardProps {
  roomId: RoomId;
  onUserInvited: (contact: InvitedContact) => void;
}

export default function InviteCard({ roomId, onUserInvited }: InviteCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className={`${baseStyles.card} ${styles.inviteCard}`}
        onClick={() => setIsModalOpen(true)}
        title="Add user to room"
      >
        <UserPlus size={32} />
      </button>

      {isModalOpen && (
        <InviteModal
          roomId={roomId}
          onClose={() => setIsModalOpen(false)}
          onInviteSent={(contact) => {
            setIsModalOpen(false);
            onUserInvited(contact);
          }}
        />
      )}
    </>
  );
}
