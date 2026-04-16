import { useState } from 'react';
import { UserMinus, UserPlus, ChevronDown } from 'lucide-react';
import { useContactsStore } from '../../stores/useContactsStore';
import baseStyles from '../../styles/BaseCard.module.css';
import contactsCardStyles from './ContactsCard.module.css';
import ContactRow from './contact-row/ContactRow';
import RemoveButton from '../remove-button/RemoveButton';
import InputBar from './input-bar/InputBar';
import { sortContactsWithMobileFirst } from '../../../../shared/utils/sort-contacts';
import type { Contact } from '../../../../shared/types/contacts';

const DISPLAY_LIMIT = 50;

const getFilteredContacts = (
  contacts: Contact[],
  query: string,
  includeContactsWithoutMobile: boolean
) => {
  const queryLowerCase = query.toLowerCase();
  return contacts.filter((contact) => {
    if (!includeContactsWithoutMobile && !contact.hasMobileDevice) return false;
    return (
      contact.email.toLowerCase().includes(queryLowerCase) ||
      contact.name?.toLowerCase().includes(queryLowerCase)
    );
  });
};

interface AddAction {
  onSubmit: (email: string) => Promise<void>;
  label: string;
}

interface ContactsCardProps {
  title?: string;
  rowButtons?: (contact: Contact) => React.ReactNode;
  addAction: AddAction;
  includeContactsWithoutMobile: boolean;
  showRemoveToggle: boolean;
}

export default function ContactsCard({
  title,
  rowButtons,
  addAction,
  includeContactsWithoutMobile,
  showRemoveToggle,
}: ContactsCardProps) {
  const { contacts, isLoading, error, removeContact } = useContactsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = sortContactsWithMobileFirst(
    searchQuery.trim() || !includeContactsWithoutMobile
      ? getFilteredContacts(contacts, searchQuery, includeContactsWithoutMobile)
      : contacts
  );

  const displayedContacts = filteredContacts.slice(0, DISPLAY_LIMIT);

  const handleRemove = async (contactId: string) => {
    setRemovingId(contactId);
    try {
      await removeContact(contactId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className={`${baseStyles.card} ${baseStyles.column} ${contactsCardStyles.container}`}>
      <div className={contactsCardStyles.headerRow}>
        {title && <span className={baseStyles.title}>{title}</span>}
        <div className={contactsCardStyles.headerButtons}>
          {showRemoveToggle && (
            <button
              className={`${contactsCardStyles.addButton} ${isRemoving ? contactsCardStyles.active : ''}`}
              onClick={() => setIsRemoving((prev) => !prev)}
              aria-pressed={isRemoving}
              title="Remove contacts"
            >
              <UserMinus size={22} />
            </button>
          )}
          <button
            className={contactsCardStyles.addButton}
            onClick={() => setIsAdding((prev) => !prev)}
            aria-expanded={isAdding}
          >
            <UserPlus size={22} />
            <ChevronDown
              size={14}
              className={`${contactsCardStyles.chevron} ${isAdding ? contactsCardStyles.chevronOpen : ''}`}
            />
          </button>
        </div>
      </div>

      <div className={contactsCardStyles.searchRow}>
        <InputBar
          isAdding={isAdding}
          onAddDismiss={() => setIsAdding(false)}
          onSearchQueryChange={setSearchQuery}
          onSubmit={addAction.onSubmit}
          submitLabel={addAction.label}
        />
      </div>

      {isLoading && <p className={contactsCardStyles.state}>loading...</p>}

      {error && (
        <p className={`${contactsCardStyles.state} ${contactsCardStyles.error}`}>{error}</p>
      )}

      {!isLoading && !error && filteredContacts.length === 0 && (
        <p className={contactsCardStyles.state}>
          {searchQuery.trim() ? 'no matches' : 'no contacts yet'}
        </p>
      )}

      {!isLoading && !error && filteredContacts.length > 0 && (
        <div className={contactsCardStyles.list}>
          {displayedContacts.map((contact) => (
            <ContactRow key={contact.id} contact={contact}>
              {isRemoving ? (
                <RemoveButton
                  onClick={() => handleRemove(contact.id)}
                  isRemoving={removingId === contact.id}
                  title="Remove contact"
                />
              ) : (
                rowButtons?.(contact)
              )}
            </ContactRow>
          ))}
          {filteredContacts.length > DISPLAY_LIMIT && (
            <p className={contactsCardStyles.overflow}>
              showing {DISPLAY_LIMIT} of {filteredContacts.length} — refine search to narrow
              results.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
