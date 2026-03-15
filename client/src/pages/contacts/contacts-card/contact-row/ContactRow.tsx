import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useContactsStore } from '../../../../stores/useContactsStore';
import contactRowStyles from './ContactRow.module.css';
import type { Contact } from '../../../../../../shared/contacts-types';

interface ContactRowProps {
  contact: Contact;
}

export default function ContactRow({ contact }: ContactRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const { removeContact } = useContactsStore();

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeContact(contact.id);
    } catch {
      setIsRemoving(false);
    }
  };

  return (
    <div className={contactRowStyles.row}>
      <div className={contactRowStyles.info}>
        {contact.name && <span className={contactRowStyles.name}>{contact.name}</span>}
        <span className={contactRowStyles.email}>{contact.email}</span>
      </div>
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className={contactRowStyles.removeButton}
        title="remove contact"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
