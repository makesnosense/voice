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
import { ArrowLeft } from 'lucide-react-native';
import { useContactsStore } from '../../stores/useContactsStore';
import { PLATFORM } from '../../../../shared/constants/platform';

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
    } catch (e) {
      const message = e instanceof Error ? e.message : 'failed to add contact';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={addContactStyles.root}
      behavior={Platform.OS === PLATFORM.IOS ? 'padding' : 'height'}
    >
      <View style={[addContactStyles.container, { paddingTop: insets.top }]}>
        {/* header */}
        <View style={addContactStyles.header}>
          <Pressable
            onPress={onBack}
            style={addContactStyles.backButton}
            hitSlop={8}
          >
            <ArrowLeft size={22} color="#3b82f6" strokeWidth={1.75} />
          </Pressable>
          <Text style={addContactStyles.headerTitle}>Add contact</Text>
          <View style={addContactStyles.headerRight} />
        </View>

        {/* form */}
        <View style={addContactStyles.form}>
          <TextInput
            style={[
              addContactStyles.input,
              error ? addContactStyles.inputError : null,
            ]}
            placeholder="email address"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            value={email}
            onChangeText={v => {
              setEmail(v);
              setError(null);
            }}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
            editable={!isSubmitting}
          />
          {error && <Text style={addContactStyles.error}>{error}</Text>}

          <Pressable
            style={[
              addContactStyles.button,
              (!email.trim() || isSubmitting) &&
                addContactStyles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!email.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={addContactStyles.buttonText}>add</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const addContactStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
  },
  // balances the back button so title stays centered
  headerRight: {
    width: 36,
  },
  form: {
    padding: 24,
    gap: 12,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  inputError: {
    borderColor: '#f87171',
  },
  error: {
    fontSize: 13,
    color: '#ef4444',
    paddingHorizontal: 2,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});
