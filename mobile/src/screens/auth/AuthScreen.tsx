import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WaveformBars from '../../components/WaveformBars';
import EmailStep from './EmailStep';
import OtpStep from './OtpStep';
import CreateRoomButton from '../../components/CreateRoomButton';
import { TEXT_PRIMARY } from '../../styles/colors';
import {
  BACKGROUND_CARD,
  NEUTRAL_COLOR,
  BORDER_MUTED,
} from '../../styles/colors';
type AuthStep = 'email' | 'otp';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');

  const handleEmailSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep('otp');
  };

  return (
    <Pressable
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
      ]}
      onPress={Keyboard.dismiss}
    >
      {step === 'email' && (
        <>
          <View style={styles.titleRow}>
            <WaveformBars />
            <Text style={styles.title}>Voice</Text>
          </View>
          <EmailStep
            email={email}
            onEmailChange={setEmail}
            onSuccess={handleEmailSuccess}
          />
        </>
      )}

      {step === 'otp' && (
        <>
          <OtpStep email={email} />
          <Pressable
            onPress={() => setStep('email')}
            style={({ pressed }) => [
              styles.changeEmailButton,
              pressed && styles.changeEmailButtonPressed,
            ]}
          >
            <Text style={styles.textPrimary}>Change email address</Text>
          </Pressable>
        </>
      )}

      {step === 'email' && (
        <View
          style={[styles.createCallContainer, { bottom: insets.bottom + 32 }]}
        >
          <CreateRoomButton mutedColor />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  createCallContainer: {
    position: 'absolute',
  },
  changeEmailButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: NEUTRAL_COLOR,
    backgroundColor: BACKGROUND_CARD,
    alignItems: 'center',
  },
  changeEmailButtonPressed: {
    backgroundColor: BORDER_MUTED,
  },
  textPrimary: {
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
});
