import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../../../../shared/errors';
import { useContactsStore } from '../../../../stores/useContactsStore';
import styles from './AddContact.module.css';

interface AddContactProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function AddContact({ onCancel, onSuccess }: AddContactProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addContact } = useContactsStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await addContact(trimmed);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <input
          ref={inputRef}
          type="email"
          placeholder="email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          disabled={isSubmitting}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !email.trim()}
          className={styles.addButton}
        >
          add
        </button>
        <button onClick={onCancel} disabled={isSubmitting} className={styles.cancelButton}>
          cancel
        </button>
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
