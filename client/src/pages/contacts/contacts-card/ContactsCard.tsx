import { UserPlus } from 'lucide-react';
import { useContactsStore } from '../../../stores/useContactsStore';
import baseStyles from '../../../styles/BaseCard.module.css';
import styles from './ContactsCard.module.css';
import ContactRow from './contact-row/ContactRow';
import ContactSearch from './contact-search/ContactSearch';

export default function ContactsCard() {
  const { contacts, isLoading, error } = useContactsStore();

  return (
    <div className={`${baseStyles.card} ${baseStyles.column} ${styles.container}`}>
      <div className={styles.header}>
        <ContactSearch />
        <button className={styles.addButton}>
          <UserPlus size={24} />
        </button>
      </div>

      {isLoading && <p className={styles.state}>loading...</p>}
      {error && <p className={`${styles.state} ${styles.error}`}>{error}</p>}
      {!isLoading && !error && contacts.length === 0 && (
        <p className={styles.state}>no contacts yet</p>
      )}
      {!isLoading &&
        !error &&
        contacts.map((contact) => <ContactRow key={contact.id} contact={contact} />)}
    </div>
  );
}
