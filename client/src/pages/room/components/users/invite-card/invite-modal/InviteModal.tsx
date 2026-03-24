import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../../../stores/useAuthStore';
import PhonePlus from '../../../../../../icons/PhonePlus';
import { useContactsStore } from '../../../../../../stores/useContactsStore';
import ContactsCard from '../../../../../../components/contacts-card/ContactsCard';
import contactsCardStyles from '../../../../../../components/contacts-card/ContactsCard.module.css';
import styles from './InviteModal.module.css';
import { api } from '../../../../../../api';

import type { RoomId } from '../../../../../../../../shared/types/core';
import type { Contact } from '../../../../../../../../shared/types/contacts';

interface InviteModalProps {
  roomId: RoomId;
  onClose: () => void;
  onInviteSent: (email: string) => void;
}

export default function InviteModal({ roomId, onClose, onInviteSent }: InviteModalProps) {
  const { fetchContacts } = useContactsStore();
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);
  const [callingId, setCallingId] = useState<string | null>(null); // used only to disable respective row's button

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const inviteByEmail = async (email: string) => {
    const token = await getValidAccessToken();
    await api.rooms.inviteToRoom(roomId, email, token);
    onInviteSent(email);
  };

  const handleCall = async (contact: Contact) => {
    if (callingId) return;
    setCallingId(contact.id);
    try {
      await inviteByEmail(contact.email);
    } catch (error) {
      // TODO: surface error in UI
      console.error('Failed to invite contact:', error);
      setCallingId(null);
    }
  };

  const addAction = {
    label: 'Call',
    onSubmit: inviteByEmail,
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <span className={styles.closeIcon}>×</span>
          close
        </button>
        <ContactsCard
          title="Add user to room"
          includeContactsWithoutMobile={false}
          rowButtons={(contact) => (
            <button
              className={contactsCardStyles.callButton}
              title="Call"
              disabled={callingId === contact.id}
              onClick={() => handleCall(contact)}
            >
              <PhonePlus />
            </button>
          )}
          addAction={addAction}
        />
      </div>
    </div>
  );
}
