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

        <p className={`${styles.intro} ${styles.paragraph}`}>
          Voice is a voice calling app. This policy describes what data is stored, why, and how it
          can be removed.
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>Hosted version</h2>
          <p className={styles.paragraph}>
            This policy applies to the hosted version of Voice at{' '}
            <a className={styles.link} href={window.location.origin}>
              {window.location.host}
            </a>
            , operated from the Netherlands. Users in the EU may exercise their rights under GDPR —
            including access, erasure, and portability — by deleting their account in-app.
            Self-hosted deployments are governed by their respective operators.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>What is stored and processed</h2>
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
              <strong>Device information</strong> — device name (e.g. "Samsung Galaxy S22" or
              "Chrome on macOS"), platform, last active timestamp, and FCM token are stored on
              Voice's server per signed-in session. This is used to identify active sessions and
              deliver incoming call notifications. Device records are removed on logout or when
              manually removed from the active sessions list in Settings.
            </li>
            <li>
              <strong>Contacts</strong> — the list of users you have added as contacts is stored on
              Voice's server.
            </li>
            <li>
              <strong>Session tokens</strong> — authentication tokens are stored in{' '}
              <code>localStorage</code> on the browser, or in the system keychain on Android, to
              keep you signed in.
            </li>
            <li>
              <strong>IP addresses</strong> — processed transiently for rate limiting and call
              routing. Not stored.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Audio</h2>
          <p className={styles.paragraph}>
            Voice audio is relayed through Voice's TURN server to establish connectivity across
            networks. Audio is never recorded or stored.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Android app local logs</h2>
          <p className={styles.paragraph}>
            The Android app keeps a rolling diagnostic log on your device capturing application
            events — call state transitions, WebRTC connection status, errors — which may
            incidentally include room IDs or contact display names. The log is stored in the app's
            private storage, never transmitted to any server, and capped at 1,000 entries.
          </p>
          <p className={styles.paragraph}>
            The log can leave your device only if you share it using the{' '}
            <strong>Share local log</strong> button in Settings → About. This way, you control
            exactly where it goes.
          </p>
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
          <p className={styles.paragraph}>
            Data is retained until account deletion. Deleting an account permanently removes the
            associated email, name, contacts, device records, and call history from Voice's server.
            This includes any call history entries that appear in other users' history involving the
            deleted account.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Contact</h2>
          <p className={styles.paragraph}>
            For privacy-related questions:{' '}
            <a className={styles.link} href="mailto:voicevoice@proton.me">
              voicevoice@proton.me
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
