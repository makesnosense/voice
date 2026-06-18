import { PhoneOff } from 'lucide-react';
import baseStyles from '../../../../../styles/BaseCard.module.css';
import userCardStyles from '../usercard/UserCard.module.css';
import buttonStyles from '../../../../../styles/Buttons.module.css';
import callingCardStyles from './CallingCard.module.css';
import { formatDisplayName } from '../../../../../../../shared/utils/format';
import {
  CALL_OUTCOME,
  type CallDismissalReason,
} from '../../../../../../../shared/constants/calls';
import DisplayName from '../display-name/DisplayName';

const DISMISSAL_REASON_LABEL: Record<CallDismissalReason, string> = {
  [CALL_OUTCOME.DECLINED]: 'declined',
  [CALL_OUTCOME.NO_ANSWER]: 'no answer',
};

interface CallingCardProps {
  contactEmail: string;
  contactName: string | null;
  onCancel: () => void;
  callDismissalReason: CallDismissalReason | null;
}

export default function CallingCard({
  contactEmail,
  contactName,
  onCancel,
  callDismissalReason,
}: CallingCardProps) {
  const displayName = formatDisplayName(contactName, contactEmail);
  const isCallDismissed = callDismissalReason !== null;

  return (
    <div
      className={`${baseStyles.card} ${userCardStyles.userCard} ${callingCardStyles.callingCard} ${isCallDismissed ? callingCardStyles.declinedCard : ''}`}
    >
      <div className={userCardStyles.userCardContent}>
        <DisplayName name={displayName} />

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
