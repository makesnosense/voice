import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useContactsStore } from '../../../stores/useContactsStore';
import removeButtonStyles from './RemoveButton.module.css';

interface RemoveButtonProps {
  contactId: string;
}

export default function RemoveButton({ contactId }: RemoveButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const { removeContact } = useContactsStore();

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeContact(contactId);
    } catch {
      setIsRemoving(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isRemoving}
      className={removeButtonStyles.button}
      title="remove contact"
    >
      <Trash2 size={14} />
    </button>
  );
}
