import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  NEUTRAL_COLOR,
  BACKGROUND_CARD,
  TEXT_SECONDARY,
} from '../../../styles/colors';
import { pressedStyle, disabledStyle } from '../../../styles/common';

interface InputCardProps {
  email: string;
  error: string | null;
  isSubmitting: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
}

export default function InputCard({
  email,
  error,
  isSubmitting,
  onEmailChange,
  onSubmit,
}: InputCardProps) {
  const isSubmitDisabled = !email.trim() || isSubmitting;

  return (
    <View style={styles.card}>
      <View
        style={[styles.inputContainer, !!error && styles.inputContainerError]}
      >
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={TEXT_MUTED}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          value={email}
          onChangeText={onEmailChange}
          onSubmitEditing={onSubmit}
          returnKeyType="done"
          editable={!isSubmitting}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          isSubmitDisabled && disabledStyle,
          pressed && !isSubmitDisabled && pressedStyle,
        ]}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Add contact</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    paddingHorizontal: 20,
  },
  inputContainer: {
    backgroundColor: BACKGROUND_CARD,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    overflow: 'hidden',
  },
  inputContainerError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: TEXT_PRIMARY,
    fontSize: 15,
  },
  error: {
    fontSize: 13,
    color: '#ef4444',
    paddingHorizontal: 4,
  },
  button: {
    backgroundColor: TEXT_SECONDARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
