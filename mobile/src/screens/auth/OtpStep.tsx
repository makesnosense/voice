import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  TEXT_PRIMARY,
  BACKGROUND_CARD,
  NEUTRAL_COLOR,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER_MUTED,
} from '../../styles/colors';
import { pressedStyle } from '../../styles/common';

const RESEND_COOLDOWN_SECONDS = 30;

interface OtpStepProps {
  email: string;
  onBack: () => void;
}

export default function OtpStep({ email, onBack }: OtpStepProps) {
  const { isLoading, verifyOtp, requestOtp } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCooldown();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSubmit = async (code: string) => {
    setError(null);
    try {
      await verifyOtp(email, code.trim());
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ verifyOtp failed:', message);
      setError(message);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
    if (value.length === 6) handleSubmit(value);
  };

  const handleResend = async () => {
    setError(null);
    setOtp('');
    try {
      await requestOtp(email);
      startCooldown();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('❌ requestOtp failed:', message);
      setError(message);
    }
  };

  const canResend = secondsLeft === 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardInfoBlock}>
          <Text style={styles.textSecondary}>Code sent to</Text>
          <Text style={[styles.textSecondary, styles.textSecondaryBold]}>
            {email}
          </Text>
        </View>

        <View style={styles.cardInputWrapper}>
          <TextInput
            style={styles.cardInput}
            placeholder="Code"
            placeholderTextColor="#57534e"
            keyboardType="number-pad"
            value={otp}
            onChangeText={handleOtpChange}
            maxLength={6}
            editable={!isLoading}
          />
          {isLoading && (
            <View style={styles.cardSpinner}>
              <ActivityIndicator size="small" color={TEXT_PRIMARY} />
            </View>
          )}
        </View>

        <View style={styles.cardDivider} />

        <Pressable
          onPress={handleResend}
          disabled={!canResend}
          style={({ pressed }) =>
            pressed && canResend ? pressedStyle : undefined
          }
        >
          <Text style={canResend ? styles.textPrimary : styles.textMuted}>
            {canResend ? 'Resend code' : `Resend code in ${secondsLeft}s`}
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.textPrimary}>Change email address</Text>
      </Pressable>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.textError}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  card: {
    width: '100%',
    gap: 16,
    backgroundColor: BACKGROUND_CARD,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    padding: 18,
    alignItems: 'center',
  },
  cardInfoBlock: {
    alignItems: 'center',
    gap: 2,
  },
  cardInputWrapper: {
    alignSelf: 'center',
    width: '50%',
  },
  cardInput: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: TEXT_MUTED,
    backgroundColor: BORDER_MUTED,
    color: TEXT_PRIMARY,
    fontSize: 16,
    textAlign: 'center',
  },
  cardSpinner: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  cardDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: NEUTRAL_COLOR,
  },

  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    backgroundColor: BACKGROUND_CARD,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: BORDER_MUTED,
  },

  textSecondary: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  textSecondaryBold: {
    fontWeight: '500',
  },
  textPrimary: {
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  textMuted: {
    fontSize: 15,
    color: TEXT_MUTED,
  },

  errorCard: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  textError: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '500',
  },
});
