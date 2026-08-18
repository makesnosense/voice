import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PhoneOff } from 'lucide-react-native';
import { pressedStyle } from '../../../../../styles/common';
import CallingDots from './CallingDots';
import {
  TEXT_PRIMARY,
  BORDER_MUTED,
  BACKGROUND_PRIMARY,
  TEXT_DANGER,
} from '../../../../../styles/colors';
import {
  CALL_OUTCOME,
  type CallDismissalReason,
} from '../../../../../../../shared/constants/calls';

interface CallingCardProps {
  contactName: string | null;
  contactEmail: string;
  callDismissalReason: CallDismissalReason | null;
  onCancel: () => void;
}

export default function CallingCard({
  contactName,
  contactEmail,
  callDismissalReason,
  onCancel,
}: CallingCardProps) {
  const { t } = useTranslation();
  const displayName = contactName ?? contactEmail.split('@')[0];
  const isCallDismissed = callDismissalReason !== null;

  return (
    <View style={[styles.card, isCallDismissed && styles.cardDismissed]}>
      <Text style={styles.name} numberOfLines={1}>
        {displayName}
      </Text>

      {isCallDismissed ? (
        <Text style={styles.dismissedLabel}>
          {callDismissalReason === CALL_OUTCOME.DECLINED
            ? t('calls.callDismissedDeclined')
            : t('calls.callDismissedNoAnswer')}
        </Text>
      ) : (
        <>
          <CallingDots />
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && pressedStyle,
            ]}
            onPress={onCancel}
          >
            <PhoneOff size={18} color="#ef4444" />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BACKGROUND_PRIMARY,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_MUTED,
    padding: 28,
    alignItems: 'center',
    gap: 26,
  },
  cardDismissed: {
    backgroundColor: 'transparent',
    gap: 80,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    height: 210,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  dismissedLabel: {
    fontSize: 16,
    color: TEXT_DANGER,
  },
  cancelButton: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});
