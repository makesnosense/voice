import { useState } from 'react';
import { PhoneCall } from 'lucide-react';
import baseStyles from '../../../../../styles/BaseCard.module.css';
import styles from './InviteCard.module.css';
import InviteModal from './InviteModal';
import type { RoomId } from '../../../../../../../shared/types';

interface InviteCardProps {
  roomId: RoomId;
  onUserInvited: (email: string) => void;
}

export default function InviteCard({ roomId, onUserInvited }: InviteCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className={`${baseStyles.card} ${styles.inviteCard}`}
        onClick={() => setIsModalOpen(true)}
        title="add user to room"
      >
        <PhoneCall size={18} className={styles.icon} />
        <span className={styles.label}>add user</span>
      </button>

      {isModalOpen && (
        <InviteModal
          roomId={roomId}
          onClose={() => setIsModalOpen(false)}
          onInviteSent={(email) => {
            setIsModalOpen(false);
            onUserInvited(email);
          }}
        />
      )}
    </>
  );
}
