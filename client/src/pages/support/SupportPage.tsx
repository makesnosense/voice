import { useEffect } from 'react';
import Header from '../../components/header/Header';
import BackButton from '../../components/header/back-button/BackButton';
import { BACK_BUTTON_VARIANT } from '../../components/header/back-button/BackButton.constants';
import layoutStyles from '../../styles/Layout.module.css';
import styles from '../privacy/PrivacyPage.module.css';
import { HOSTED_HOST } from '../privacy/PrivacyPage';

const SUPPORT_EMAIL = 'voicevoice@proton.me';

const backButton = <BackButton label="" variant={BACK_BUTTON_VARIANT.NEUTRAL} to="/" />;

export default function SupportPage() {
  useEffect(() => {
    document.title = 'Support — Voice';
  }, []);

  return (
    <div className={`${layoutStyles.page} ${styles.page}`}>
      <Header leftSlot={backButton} />
      <main className={styles.content}>
        <h1 className={styles.title}>Support</h1>
        <p className={styles.paragraph}>
          For questions, issues, or account help:{' '}
          <a className={styles.link} href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <p className={styles.paragraph}>
          This page is for the hosted app at {HOSTED_HOST}. Self-hosted deployments are operated
          independently — contact whoever runs your instance.
        </p>
      </main>
    </div>
  );
}
