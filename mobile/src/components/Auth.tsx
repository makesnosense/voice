import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../stores/useAuthStore';

type AuthStep = 'email' | 'otp';

export default function Auth() {
  const { isLoading, requestOtp, verifyOtp } = useAuthStore();

  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    setError(null);
    try {
      await requestOtp(email.trim());
      setStep('otp');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('❌ requestOtp failed:', message);
      setError(message);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    try {
      await verifyOtp(email.trim(), otp.trim());
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('❌ requestOtp failed:', message);
      setError(message);
    }
  };

  return (
    <View style={styles.container}>
      {step === 'email' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="email"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestOtp}
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <ActivityIndicator color="#f1f5f9" />
            ) : (
              <Text style={styles.buttonText}>send code</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {step === 'otp' && (
        <>
          <Text style={styles.info}>code sent to {email}</Text>
          <TextInput
            style={styles.input}
            placeholder="6-digit code"
            placeholderTextColor="#64748b"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleVerifyOtp}
            disabled={isLoading || otp.length < 6}
          >
            {isLoading ? (
              <ActivityIndicator color="#f1f5f9" />
            ) : (
              <Text style={styles.buttonText}>verify</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep('email')}>
            <Text style={styles.link}>← back</Text>
          </TouchableOpacity>
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  info: {
    fontSize: 14,
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#f1f5f9',
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#1e40af',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f1f5f9',
    fontSize: 16,
  },
  link: {
    color: '#64748b',
    fontSize: 14,
  },
  error: {
    color: '#f87171',
    fontSize: 14,
  },
});
