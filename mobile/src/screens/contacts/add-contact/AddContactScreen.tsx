import { useState } from 'react';
import { View, StyleSheet, Pressable, Keyboard } from 'react-native';
import { useContactsStore } from '../../../stores/useContactsStore';
import Header from '../../../components/Header';
import HeaderBackButton from '../../../components/HeaderBackButton';
import { BACKGROUND_PRIMARY } from '../../../styles/colors';
import { useContentPadding } from '../../../hooks/useContentPadding';
import InputCard from './InputCard';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

interface AddContactScreenProps {
  onBack: () => void;
}

export default function AddContactScreen({ onBack }: AddContactScreenProps) {
  const contentPadding = useContentPadding();
  const addContact = useContactsStore(state => state.addContact);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError(null);
  };

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

  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <Header
        title="Add contact"
        leftSlot={<HeaderBackButton onPress={onBack} />}
      />

      <View style={[styles.content, contentPadding]}>
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={10}>
          <InputCard
            email={email}
            error={error}
            isSubmitting={isSubmitting}
            onEmailChange={handleEmailChange}
            onSubmit={handleSubmit}
          />
        </KeyboardAvoidingView>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
