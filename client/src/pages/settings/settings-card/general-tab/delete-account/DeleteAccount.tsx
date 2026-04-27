import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../../stores/useAuthStore';
import styles from './DeleteAccount.module.css';

const CONFIRM_SECONDS = 9;

type Mode = 'idle' | 'confirming' | 'deleting';

export default function DeleteAccount() {
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const [mode, setMode] = useState<Mode>('idle');
  const [countdown, setCountdown] = useState(CONFIRM_SECONDS);

  useEffect(() => {
    if (mode !== 'confirming') return;
    setCountdown(CONFIRM_SECONDS);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const handleDelete = async () => {
    setMode('deleting');
    try {
      await deleteAccount();
    } catch (error) {
      console.error('❌ failed to delete account:', error);
      setMode('confirming');
    }
  };

  const isDeleteDisabled = countdown > 0 || mode === 'deleting';

  return (
    <div className={styles.card}>
      <div className={`${styles.state} ${mode === 'idle' ? styles.visible : styles.hidden}`}>
        <span className={styles.message}>This permanently deletes your account.</span>
        <button className={styles.deleteButton} onClick={() => setMode('confirming')}>
          Delete account
        </button>
      </div>
      <div
        className={`${styles.state} ${styles.confirmState} ${mode !== 'idle' ? styles.visible : styles.hidden}`}
      >
        <button
          className={styles.cancelButton}
          onClick={() => setMode('idle')}
          disabled={mode === 'deleting'}
        >
          Cancel
        </button>
        <button
          className={`${styles.confirmButton} ${isDeleteDisabled ? styles.confirmDisabled : ''}`}
          onClick={handleDelete}
          disabled={isDeleteDisabled}
        >
          {mode === 'deleting'
            ? 'Deleting...'
            : countdown > 0
              ? `Delete account (${countdown}s)`
              : 'Delete account'}
        </button>
      </div>
    </div>
  );
}
