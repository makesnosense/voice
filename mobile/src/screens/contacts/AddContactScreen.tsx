import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useContactsStore } from '../../stores/useContactsStore';
import Header from '../../components/Header';
import HeaderBackButton from '../../components/HeaderBackButton';
import {
  TEXT_PRIMARY,
  TEXT_MUTED,
  NEUTRAL_COLOR,
  BACKGROUND_PRIMARY,
  BACKGROUND_CARD,
} from '../../styles/colors';
import { useContentPadding } from '../../hooks/useContentPadding';

interface AddContactScreenProps {
  onBack: () => void;
}

export default function AddContactScreen({ onBack }: AddContactScreenProps) {
  const contentPadding = useContentPadding();
  const addContact = useContactsStore(state => state.addContact);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await addContact(trimmed);
      onBack();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'failed to add contact';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = !email.trim() || isSubmitting;

  return (
    <View style={styles.container}>
      <Header
        title="Add contact"
        leftSlot={<HeaderBackButton onPress={onBack} />}
      />

      <View style={[styles.content, contentPadding]}>
        <View style={styles.card}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Email address"
            placeholderTextColor={TEXT_MUTED}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            value={email}
            onChangeText={value => {
              setEmail(value);
              setError(null);
            }}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            editable={!isSubmitting}
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            isSubmitDisabled && styles.buttonDisabled,
            pressed && !isSubmitDisabled && styles.pressedStyle,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={BACKGROUND_PRIMARY} />
          ) : (
            <Text style={styles.buttonText}>Add</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: BACKGROUND_CARD,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  inputError: {
    borderBottomWidth: 1,
    borderBottomColor: '#f87171',
  },
  error: {
    fontSize: 13,
    color: '#ef4444',
    paddingHorizontal: 4,
  },
  button: {
    backgroundColor: TEXT_PRIMARY,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  pressedStyle: {
    opacity: 0.75,
  },
  buttonText: {
    color: BACKGROUND_PRIMARY,
    fontSize: 16,
    fontWeight: '500',
  },
});
