import { PhoneOff } from 'lucide-react';
import baseStyles from '../../../../../styles/BaseCard.module.css';
import userCardStyles from '../usercard/UserCard.module.css';
import buttonStyles from '../../../../../styles/Buttons.module.css';
import callingCardStyles from './CallingCard.module.css';

interface CallingCardProps {
  email: string;
  onCancel: () => void;
}

export default function CallingCard({ email, onCancel }: CallingCardProps) {
  const displayName = email.split('@')[0];

  return (
    <div className={`${baseStyles.card} ${userCardStyles.userCard}`}>
      <div className={userCardStyles.userCardContent}>
        <span className={`${baseStyles.title} ${userCardStyles.displayName}`}>{displayName}</span>

        <div className={userCardStyles.audioWavesContainer}>
          <div className={callingCardStyles.dots}>
            <span />
            <span />
            <span />
          </div>
        </div>

        <button
          className={`${buttonStyles.iconButton} ${buttonStyles.button} ${buttonStyles.lightRed}`}
          onClick={onCancel}
          title="dismiss"
        >
          <PhoneOff size={16} />
        </button>
      </div>
    </div>
  );
}
