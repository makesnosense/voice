import { useEffect } from 'react';
import Header from '../../components/header/Header';
import BackButton from '../../components/header/back-button/BackButton';
import { BACK_BUTTON_VARIANT } from '../../components/header/back-button/BackButton.constants';
import layoutStyles from '../../styles/Layout.module.css';
import styles from './PrivacyPage.module.css';

const backButton = <BackButton label="" variant={BACK_BUTTON_VARIANT.NEUTRAL} />;

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — Voice';
  }, []);

  return (
    <div className={`${layoutStyles.page} ${styles.page}`}>
      <Header leftSlot={backButton} />
      <main className={styles.content}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.meta}>Effective May 1, 2026</p>

        <p className={styles.intro}>
          Voice is a voice calling app. This policy describes what data is stored, why, and how it
          can be removed.
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>What is stored</h2>
          <ul className={styles.list}>
            <li>
              <strong>Email address</strong> — used to identify the account and send login codes.
            </li>
            <li>
              <strong>Display name</strong> — optional, shown to contacts during calls.
            </li>
            <li>
              <strong>Call history</strong> — the last 20 calls are stored on Voice's server and
              cached locally on the user's device.
            </li>
            <li>
              <strong>Device tokens</strong> — FCM tokens stored on Voice's server to deliver
              incoming call notifications to the user's device.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Third-party services</h2>
          <ul className={styles.list}>
            <li>
              <strong>Firebase Cloud Messaging (Google)</strong> — used to deliver push
              notifications. Subject to{' '}
              <a
                className={styles.link}
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google's Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Resend</strong> — used to send login verification emails. Subject to{' '}
              <a
                className={styles.link}
                href="https://resend.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Resend's Privacy Policy
              </a>
              .
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Data retention</h2>
          <p>
            Data is retained until account deletion. Deleting an account permanently removes the
            associated email, name, device tokens, and call history from Voice's server.
          </p>
        </section>
      </main>
    </div>
  );
}
