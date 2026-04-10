import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { TEXT_PRIMARY } from '../../styles/colors';

interface EmailStepProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSuccess: (email: string) => void;
}

export default function EmailStep({
  email,
  onEmailChange,
  onSuccess,
}: EmailStepProps) {
  const { isLoading, requestOtp } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    try {
      const trimmed = email.trim();
      await requestOtp(trimmed);
      onSuccess(trimmed);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error('❌ requestOtp failed:', message);
      setError(message);
    }
  };

  const handleEmailChange = (value: string) => {
    setError(null);
    onEmailChange(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#57534e"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="send"
          submitBehavior="submit"
          value={email}
          onChangeText={handleEmailChange}
          onSubmitEditing={handleSubmit}
        />
        {!!email && (
          <Pressable
            style={({ pressed }) => [
              styles.inputAction,
              pressed && styles.inputActionPressed,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={TEXT_PRIMARY} />
            ) : (
              <ArrowRight size={16} color={TEXT_PRIMARY} />
            )}
          </Pressable>
        )}
      </View>
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
    gap: 10,
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    paddingRight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d4d4d8',
    backgroundColor: '#f4f4f5',
    color: TEXT_PRIMARY,
    fontSize: 15,
  },
  inputAction: {
    position: 'absolute',
    right: 8,
    backgroundColor: '#e4e4e7',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d4d4d8',
    borderRadius: 7,
    padding: 6,
  },
  inputActionPressed: {
    opacity: 0.7,
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
