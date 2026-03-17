import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { ApiError } from '../../../../../shared/errors';
import inputBarStyles from './InputBar.module.css';

interface InputBarProps {
  isAdding: boolean;
  onAddDismiss: () => void;
  onSearchQueryChange: (query: string) => void;
  onSubmit: (email: string) => Promise<void>;
  submitLabel: string;
}

export default function InputBar({
  isAdding,
  onAddDismiss,
  onSearchQueryChange,
  onSubmit,
  submitLabel,
}: InputBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      onSearchQueryChange('');
      inputRef.current?.focus();
    }

    setInputValue('');
    setError(null);
  }, [isAdding, onSearchQueryChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAdding) onAddDismiss();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAdding, onAddDismiss]);

  const handleSubmit = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      onAddDismiss();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={inputBarStyles.wrapper}>
      <div className={inputBarStyles.row}>
        <div
          className={`${inputBarStyles.inputPill} ${isAdding ? inputBarStyles.inputPillAdding : ''} ${error ? inputBarStyles.inputPillError : ''}`}
        >
          <Search
            size={14}
            className={`${inputBarStyles.icon} ${isAdding ? inputBarStyles.iconHidden : ''}`}
            aria-hidden
          />
          <input
            ref={inputRef}
            type={isAdding ? 'email' : 'text'}
            placeholder={isAdding ? 'Email address' : 'Search'}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (isAdding) {
                setError(null);
              } else {
                onSearchQueryChange(e.target.value);
              }
            }}
            onKeyDown={(e) => isAdding && e.key === 'Enter' && handleSubmit()}
            className={inputBarStyles.input}
            disabled={isSubmitting}
          />
        </div>

        <div
          className={`${inputBarStyles.buttons} ${isAdding ? inputBarStyles.buttonsVisible : ''}`}
        >
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !inputValue.trim()}
            className={inputBarStyles.addButton}
          >
            {submitLabel}
          </button>

          <button
            onClick={onAddDismiss}
            disabled={isSubmitting}
            className={inputBarStyles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </div>

      {error && <span className={inputBarStyles.error}>{error}</span>}
    </div>
  );
}
