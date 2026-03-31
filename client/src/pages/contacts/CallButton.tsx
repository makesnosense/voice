import { useState } from 'react';
import { Phone } from 'lucide-react';
import { useNavigate } from 'react-router';
import { api } from '../../api';
import { useAuthStore } from '../../stores/useAuthStore';
import contactsCardStyles from '../../components/contacts-card/ContactsCard.module.css';
import type { Contact } from '../../../../shared/types/contacts';

interface CallButtonProps {
  toContact: Contact;
}

export default function CallButton({ toContact }: CallButtonProps) {
  const [isCalling, setIsCalling] = useState(false);
  const getValidAccessToken = useAuthStore((state) => state.getValidAccessToken);
  const navigate = useNavigate();

  const handleCall = async () => {
    if (isCalling) return;
    setIsCalling(true);
    try {
      const token = await getValidAccessToken();
      const { roomId } = await api.calls.create(toContact.id, token);
      navigate(`/${roomId}`, { state: { calledContactEmail: toContact.email } });
    } catch (error) {
      console.error('Failed to call contact:', error);
      setIsCalling(false);
    }
  };

  return (
    <button
      className={contactsCardStyles.callButton}
      title="Call"
      disabled={isCalling}
      onClick={handleCall}
    >
      <Phone size={18} />
    </button>
  );
}
