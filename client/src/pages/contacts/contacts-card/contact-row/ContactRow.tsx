import contactRowStyles from './ContactRow.module.css';
import type { Contact } from '../../../../../../shared/types/contacts';

interface ContactRowProps {
  contact: Contact;
  children?: React.ReactNode;
}

export default function ContactRow({ contact, children }: ContactRowProps) {
  return (
    <div className={contactRowStyles.row}>
      <div className={contactRowStyles.info}>
        {contact.name && <span className={contactRowStyles.name}>{contact.name}</span>}
        <span className={contactRowStyles.email}>{contact.email}</span>
      </div>
      <div className={contactRowStyles.buttons}>{children}</div>
    </div>
  );
}
