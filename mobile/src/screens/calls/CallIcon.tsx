import { PhoneIncoming, PhoneOutgoing } from 'lucide-react-native';
import {
  CALL_DIRECTION,
  CALL_OUTCOME,
  CallDirection,
  CallOutcome,
} from '../../../../shared/constants/calls';
import { TEXT_DANGER, TEXT_SECONDARY } from '../../styles/colors';

export default function CallIcon({
  direction,
  outcome,
}: {
  direction: CallDirection;
  outcome: CallOutcome;
}) {
  const isMissedCall =
    direction === CALL_DIRECTION.INCOMING && outcome === CALL_OUTCOME.NO_ANSWER;

  if (direction === CALL_DIRECTION.OUTGOING) {
    return (
      <PhoneOutgoing size={18} color={TEXT_SECONDARY} strokeWidth={1.75} />
    );
  }
  return (
    <PhoneIncoming
      size={18}
      color={isMissedCall ? TEXT_DANGER : TEXT_SECONDARY}
      strokeWidth={1.75}
    />
  );
}
