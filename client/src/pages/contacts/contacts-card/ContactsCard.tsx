import { useState } from 'react';
import { UserPlus, ChevronDown } from 'lucide-react';
import { useContactsStore } from '../../../stores/useContactsStore';
import baseStyles from '../../../styles/BaseCard.module.css';
import contactsCardStyles from './ContactsCard.module.css';
import ContactRow from './contact-row/ContactRow';
import ContactSearch from './contact-search/ContactSearch';
import AddContact from './add-contact/AddContact';

export default function ContactsCard() {
  const { contacts, isLoading, error } = useContactsStore();
  const [isAdding, setIsAdding] = useState(false);

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
        {isAdding ? (
          <AddContact onCancel={() => setIsAdding(false)} onSuccess={() => setIsAdding(false)} />
        ) : (
          <ContactSearch />
        )}
      </div>

      {isLoading && <p className={contactsCardStyles.state}>loading...</p>}
      {error && (
        <p className={`${contactsCardStyles.state} ${contactsCardStyles.error}`}>{error}</p>
      )}
      {!isLoading && !error && contacts.length === 0 && (
        <p className={contactsCardStyles.state}>no contacts yet</p>
      )}
      {!isLoading &&
        !error &&
        contacts.map((contact) => <ContactRow key={contact.id} contact={contact} />)}
    </div>
  );
}
