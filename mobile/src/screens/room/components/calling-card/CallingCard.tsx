import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PhoneOff } from 'lucide-react-native';
import { pressedStyle } from '../../../../styles/common';
import CallingDots from './CallingDots';
import { BORDER_MUTED } from '../../../../styles/colors';

interface CallingCardProps {
  contactName: string | null;
  contactEmail: string;
  isDeclined: boolean;
  onCancel: () => void;
}

export default function CallingCard({
  contactName,
  contactEmail,
  isDeclined,
  onCancel,
}: CallingCardProps) {
  const displayName = contactName ?? contactEmail.split('@')[0];

  return (
    <View style={[styles.card, isDeclined && styles.cardDeclined]}>
      <Text style={styles.name} numberOfLines={1}>
        {displayName}
      </Text>

      {isDeclined ? (
        <Text style={styles.declinedLabel}>Declined</Text>
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_MUTED,
    padding: 28,
    alignItems: 'center',
    gap: 26,
  },
  cardDeclined: {
    backgroundColor: 'transparent',
    gap: 80,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    height: 210,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  declinedLabel: {
    fontSize: 16,
    color: '#ef4444',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    height: 20,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94a3b8',
  },
  cancelButton: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
});
