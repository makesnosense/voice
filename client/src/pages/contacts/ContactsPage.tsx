import { useEffect } from 'react';
import Header from '../../components/header/Header';
import BackButton from '../../components/header/back-button/BackButton';
import { BACK_BUTTON_VARIANT } from '../../components/header/back-button/BackButton.constants';
import AppError from '../../components/app-error/AppError';
import { APP_ERROR } from '../../components/app-error/AppError.constants';
import { useContactsStore } from '../../stores/useContactsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import layoutStyles from '../../styles/Layout.module.css';
import contactsStyles from './ContactsPage.module.css';
import RemoveButton from './remove-button/RemoveButton';
import CallButton from './CallButton';
import ContactsCard from '../../components/contacts-card/ContactsCard';

const backButton = <BackButton label="Back" variant={BACK_BUTTON_VARIANT.NEUTRAL} />;

export default function ContactsPage() {
  const { fetchContacts, addContact } = useContactsStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const addAction = { label: 'Add', onSubmit: addContact };

  useEffect(() => {
    if (isAuthenticated) fetchContacts();
  }, [isAuthenticated, fetchContacts]);

  return (
    <div className={layoutStyles.page}>
      <Header leftSlot={backButton} />
      {isAuthenticated ? (
        <main className={contactsStyles.content}>
          <ContactsCard
            title={'Contacts'}
            includeContactsWithoutMobile={true}
            rowButtons={(contact) => (
              <>
                <RemoveButton contactId={contact.id} />
                {contact.hasMobileDevice && <CallButton contact={contact} />}
              </>
            )}
            addAction={addAction}
          />
        </main>
      ) : (
        <AppError error={APP_ERROR.UNAUTHORIZED} />
      )}
    </div>
  );
}
