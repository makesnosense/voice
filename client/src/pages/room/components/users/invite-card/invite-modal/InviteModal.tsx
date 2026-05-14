import { useEffect, useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { useAuthStore } from '../../../../../../stores/useAuthStore';
import PhonePlus from './PhonePlus';
import { useContactsStore } from '../../../../../../stores/useContactsStore';
import ContactsCard from '../../../../../../components/contacts-card/ContactsCard';
import contactsCardStyles from '../../../../../../components/contacts-card/ContactsCard.module.css';
import styles from './InviteModal.module.css';
import { api } from '../../../../../../api';
import type { RoomId } from '../../../../../../../../shared/types/core';
import type { Contact, InvitedContact } from '../../../../../../../../shared/types/contacts';

interface InviteModalProps {
  roomId: RoomId;
  onClose: () => void;
  onInviteSent: (contact: InvitedContact) => void;
}

export default function InviteModal({ roomId, onClose, onInviteSent }: InviteModalProps) {
  const { fetchContacts } = useContactsStore();
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);
  const [callingId, setCallingId] = useState<string | null>(null); // used only to disable respective row's button
  const [errorId, setErrorId] = useState<string | null>(null);

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
    const user = await api.users.getUserByEmail(email, token);
    await api.rooms.inviteToRoom(roomId, { targetUserId: user.id }, token);
    onInviteSent({ email: user.email, name: user.name });
  };

  const handleCall = async (contact: Contact) => {
    if (callingId) return;
    setCallingId(contact.id);
    setErrorId(null);
    try {
      const token = await getValidAccessToken();
      await api.rooms.inviteToRoom(roomId, { targetUserId: contact.id }, token);
      onInviteSent({ email: contact.email, name: contact.name });
    } catch (error) {
      console.error('Failed to invite contact:', error);
      setErrorId(contact.id);
    } finally {
      setCallingId(null);
    }
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
          showRemoveToggle={false}
          rowButtons={(contact) => (
            <div className={contactsCardStyles.callButtonActions}>
              {errorId === contact.id && (
                <AlertCircle size={14} className={contactsCardStyles.callButtonErrorIcon} />
              )}
              <button
                className={contactsCardStyles.callButton}
                title="Add to call"
                disabled={callingId !== null}
                onClick={() => handleCall(contact)}
              >
                {callingId === contact.id ? (
                  <Loader size={18} className={contactsCardStyles.callButtonSpinner} />
                ) : (
                  <PhonePlus size={18} />
                )}
              </button>
            </div>
          )}
          addAction={{ label: 'Call', onSubmit: inviteByEmail }}
        />
      </div>
    </div>
  );
}
