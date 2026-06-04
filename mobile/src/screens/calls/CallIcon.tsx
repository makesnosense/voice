import { PhoneIncoming, PhoneOutgoing } from 'lucide-react-native';
import {
  CALL_DIRECTION,
  CallDirection,
} from '../../../../shared/constants/calls';
import { TEXT_DANGER, TEXT_SECONDARY } from '../../styles/colors';

export default function CallIcon({
  direction,
  isRed,
}: {
  direction: CallDirection;
  isRed: boolean;
}) {
  if (direction === CALL_DIRECTION.OUTGOING) {
    return (
      <PhoneOutgoing size={18} color={TEXT_SECONDARY} strokeWidth={1.75} />
    );
  }
  return (
    <PhoneIncoming
      size={18}
      color={isRed ? TEXT_DANGER : TEXT_SECONDARY}
      strokeWidth={1.75}
    />
  );
}
