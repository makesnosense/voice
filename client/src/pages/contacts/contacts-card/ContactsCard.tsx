import { useState } from 'react';
import { UserPlus, ChevronDown } from 'lucide-react';
import { useContactsStore } from '../../../stores/useContactsStore';
import baseStyles from '../../../styles/BaseCard.module.css';
import contactsCardStyles from './ContactsCard.module.css';
import ContactRow from './contact-row/ContactRow';
import { type Contact } from '../../../../../shared/contacts-types';

import InputBar from './input-bar/InputBar';

const getFilteredContacts = (contacts: Contact[], query: string) => {
  const q = query.toLowerCase();
  return contacts.filter(
    (c) => c.email.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q)
  );
};

export default function ContactsCard() {
  const { contacts, isLoading, error } = useContactsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = searchQuery.trim()
    ? getFilteredContacts(contacts, searchQuery)
    : contacts;

  return (
    <div className={`${baseStyles.card} ${baseStyles.column} ${contactsCardStyles.container}`}>
      <div className={contactsCardStyles.headerRow}>
        <span className={baseStyles.title}>Contacts</span>
        <button
          className={contactsCardStyles.addButton}
          onClick={() => setIsAdding((prev) => !prev)}
          aria-expanded={isAdding}
        >
          <UserPlus size={18} />
          <ChevronDown
            size={14}
            className={`${contactsCardStyles.chevron} ${isAdding ? contactsCardStyles.chevronOpen : ''}`}
          />
        </button>
      </div>

      <div className={contactsCardStyles.searchRow}>
        <InputBar
          isAdding={isAdding}
          onAddDismiss={() => setIsAdding(false)}
          onSearchQueryChange={setSearchQuery}
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
      {!isLoading &&
        !error &&
        filteredContacts.map((contact) => <ContactRow key={contact.id} contact={contact} />)}
    </div>
  );
}
