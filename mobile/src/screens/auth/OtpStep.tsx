import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../stores/useAuthStore';

interface OtpStepProps {
  email: string;
  onBack: () => void;
}

export default function OtpStep({ email, onBack }: OtpStepProps) {
  const { isLoading, verifyOtp } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (code: string) => {
    setError(null);
    try {
      await verifyOtp(email, code.trim());
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('❌ verifyOtp failed:', message);
      setError(message);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
    if (value.length === 6) handleSubmit(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.infoBlock}>
          <Text style={styles.info}>Code sent to</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Code"
            placeholderTextColor="#57534e"
            keyboardType="number-pad"
            value={otp}
            onChangeText={handleOtpChange}
            maxLength={6}
            editable={!isLoading}
          />
          {isLoading && (
            <ActivityIndicator
              size="small"
              color="#0f172a"
              style={styles.spinner}
            />
          )}
        </View>
      </View>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.changeEmail,
          pressed && styles.changeEmailPressed,
        ]}
      >
        <Text style={styles.changeEmailText}>Change email address</Text>
      </Pressable>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.error}>{error}</Text>
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
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    padding: 24,
    alignItems: 'center',
  },
  infoBlock: {
    alignItems: 'center',
    gap: 2,
  },
  info: {
    fontSize: 16,
    color: '#57534e',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#57534e',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputWrapper: {
    alignSelf: 'center',
    width: '50%',
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: 16,
    textAlign: 'center',
  },
  spinner: {
    position: 'absolute',
    right: 12,
  },
  changeEmail: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  changeEmailPressed: {
    backgroundColor: '#f1f5f9',
  },
  changeEmailText: {
    fontSize: 15,
    color: '#57534e',
    fontWeight: '500',
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
  error: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '500',
  },
});
