import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useContactsStore } from '../../stores/useContactsStore';
import { PLATFORM } from '../../../../shared/constants/platform';
import Header from '../../components/Header';
import HeaderBackButton from '../../components/HeaderBackButton';

interface AddContactScreenProps {
  onBack: () => void;
}

export default function AddContactScreen({ onBack }: AddContactScreenProps) {
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === PLATFORM.IOS ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header
          title="Add contact"
          leftSlot={<HeaderBackButton onPress={onBack} />}
        />

        <View style={styles.content}>
          <View style={styles.card}>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Email address"
              placeholderTextColor="#a1a1aa"
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
              pressed && !isSubmitDisabled && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Add</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#f4f4f5',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d4d4d8',
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
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
    backgroundColor: '#18181b',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
