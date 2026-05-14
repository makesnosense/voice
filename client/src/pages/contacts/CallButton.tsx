import { useState } from 'react';
import { Phone, AlertCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router';
import { api } from '../../api';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';
import contactsCardStyles from '../../components/contacts-card/ContactsCard.module.css';
import type { Contact } from '../../../../shared/types/contacts';

interface CallButtonProps {
  toContact: Contact;
}

export default function CallButton({ toContact }: CallButtonProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [hasError, setHasError] = useState(false);
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);
  const navigate = useNavigate();

  const handleCall = async () => {
    if (isCalling) return;
    setIsCalling(true);
    setHasError(false);
    try {
      const token = await getValidAccessToken();
      const { roomId } = await api.calls.create(toContact.id, token);
      useRoomStore.setState({
        pendingInvitedContact: { email: toContact.email, name: toContact.name },
      });

      console.log('Setting pendingInvitedContact:', {
        email: toContact.email,
        name: toContact.name,
      });
      useRoomStore.setState({
        pendingInvitedContact: { email: toContact.email, name: toContact.name },
      });
      console.log('Store after set:', useRoomStore.getState().pendingInvitedContact);

      navigate(`/${roomId}`);
    } catch (error) {
      console.error('Failed to call contact:', error);
      setHasError(true);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className={contactsCardStyles.callButtonActions}>
      {hasError && <AlertCircle size={14} className={contactsCardStyles.callButtonErrorIcon} />}
      <button
        className={contactsCardStyles.callButton}
        title="Call"
        disabled={isCalling}
        onClick={handleCall}
      >
        {isCalling ? (
          <Loader size={18} className={contactsCardStyles.callButtonSpinner} />
        ) : (
          <Phone size={18} />
        )}
      </button>
    </div>
  );
}
