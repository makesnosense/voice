import { Trash2, Loader } from 'lucide-react';

import removeButtonStyles from './RemoveButton.module.css';

interface RemoveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isRemoving?: boolean;
  title?: string;
}

export default function RemoveButton({
  onClick,
  disabled = false,
  isRemoving = false,
  title = 'Remove',
}: RemoveButtonProps) {
  return (
    <button
      className={removeButtonStyles.button}
      onClick={onClick}
      disabled={disabled || isRemoving}
      title={title}
    >
      {isRemoving ? (
        <Loader size={15} className={removeButtonStyles.spinner} />
      ) : (
        <Trash2 size={15} strokeWidth={1.75} />
      )}
    </button>
  );
}
