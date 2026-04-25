import { useState, useRef } from 'react';
import { SquarePen, Check, X } from 'lucide-react';
import { useAuthStore } from '../../../../stores/useAuthStore';
import styles from './GeneralTab.module.css';

export default function GeneralTab() {
  const user = useAuthStore((state) => state.user);
  const updateName = useAuthStore((state) => state.updateName);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setDraft(user?.name ?? '');
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft('');
  };

  const saveName = async () => {
    const trimmed = draft.trim();
    const newName = trimmed.length > 0 ? trimmed : null;
    if (newName === (user?.name ?? null)) {
      cancelEditing();
      return;
    }
    setIsSaving(true);
    try {
      await updateName(newName);
      setIsEditing(false);
    } catch (error) {
      console.error('❌ failed to update name:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') saveName();
    if (event.key === 'Escape') cancelEditing();
  };

  return (
    <div className={styles.container}>
      <span className={styles.fieldLabel}>name</span>
      {isEditing ? (
        <div className={styles.editRow}>
          <input
            ref={inputRef}
            className={styles.input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your name"
            maxLength={40}
            disabled={isSaving}
          />
          <button
            className={`${styles.iconButton} ${styles.confirm}`}
            onClick={saveName}
            disabled={isSaving}
            title="Save"
          >
            <Check size={14} />
          </button>
          <button
            className={`${styles.iconButton} ${styles.cancel}`}
            onClick={cancelEditing}
            disabled={isSaving}
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button className={styles.displayRow} onClick={startEditing}>
          <span className={user?.name ? styles.nameText : styles.namePlaceholder}>
            {user?.name ?? 'Add a name'}
          </span>
          <SquarePen size={17} className={styles.pencilIcon} />
        </button>
      )}
    </div>
  );
}
