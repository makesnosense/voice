import { useState, useRef } from 'react';
import { SquarePen, Check, X } from 'lucide-react';
import { useAuthStore } from '../../../../../stores/useAuthStore';
import nameFieldStyles from './NameField.module.css';

export default function NameField() {
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
    <>
      {isEditing ? (
        <div className={nameFieldStyles.editRow}>
          <input
            ref={inputRef}
            className={nameFieldStyles.input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Your name"
            maxLength={40}
            disabled={isSaving}
          />
          <button
            className={`${nameFieldStyles.iconButton} ${nameFieldStyles.confirm}`}
            onClick={saveName}
            disabled={isSaving}
            title="Save"
          >
            <Check size={14} />
          </button>
          <button
            className={`${nameFieldStyles.iconButton} ${nameFieldStyles.cancel}`}
            onClick={cancelEditing}
            disabled={isSaving}
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button className={nameFieldStyles.displayRow} onClick={startEditing}>
          <span className={user?.name ? nameFieldStyles.nameText : nameFieldStyles.namePlaceholder}>
            {user?.name ?? 'Add a name'}
          </span>
          <SquarePen size={17} className={nameFieldStyles.pencilIcon} />
        </button>
      )}
    </>
  );
}
