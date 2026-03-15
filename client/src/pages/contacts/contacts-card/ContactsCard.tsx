import { UserPlus } from 'lucide-react';
import { useContactsStore } from '../../../stores/useContactsStore';
import baseStyles from '../../../styles/BaseCard.module.css';
import contactsCardStyles from './ContactsCard.module.css';
import ContactRow from './contact-row/ContactRow';
import ContactSearch from './contact-search/ContactSearch';

export default function ContactsCard() {
  const { contacts, isLoading, error } = useContactsStore();

  return (
    <div className={`${baseStyles.card} ${baseStyles.column} ${contactsCardStyles.container}`}>
      <div className={`${contactsCardStyles.headerRow}`}>
        <span className={baseStyles.title}>Contacts</span>
        <button className={contactsCardStyles.addButton}>
          <UserPlus size={22} />
        </button>
      </div>

      <div className={contactsCardStyles.searchRow}>
        <ContactSearch />
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
