import { PhoneOff } from 'lucide-react';
import baseStyles from '../../../../../styles/BaseCard.module.css';
import userCardStyles from '../usercard/UserCard.module.css';
import buttonStyles from '../../../../../styles/Buttons.module.css';
import callingCardStyles from './CallingCard.module.css';
import type { InvitedContact } from '../../../../../../../shared/types/contacts';
import { formatDisplayName } from '../../../../../../../shared/utils/format';
import {
  CALL_DISMISSAL_REASON,
  type CallDismissalReason,
} from '../../../../../../../shared/constants/calls';

const DISMISSAL_REASON_LABEL: Record<CallDismissalReason, string> = {
  [CALL_DISMISSAL_REASON.DECLINED]: 'declined',
  [CALL_DISMISSAL_REASON.NO_ANSWER]: 'no answer',
};

interface CallingCardProps {
  contact: InvitedContact;
  onCancel: () => void;
  callDismissalReason: CallDismissalReason | null;
}

export default function CallingCard({ contact, onCancel, callDismissalReason }: CallingCardProps) {
  const displayName = formatDisplayName(contact.name, contact.email);
  const isCallDismissed = callDismissalReason !== null;
  return (
    <div
      className={`${baseStyles.card} ${userCardStyles.userCard} ${callingCardStyles.callingCard} ${isCallDismissed ? callingCardStyles.declinedCard : ''}`}
    >
      <div className={userCardStyles.userCardContent}>
        <span className={`${baseStyles.title} ${callingCardStyles.displayName}`}>
          {displayName}
        </span>

        {isCallDismissed ? (
          <div className={callingCardStyles.declinedContent}>
            <span className={callingCardStyles.declinedLabel}>
              {DISMISSAL_REASON_LABEL[callDismissalReason]}
            </span>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
