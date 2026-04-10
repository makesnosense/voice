import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WaveformBars from '../../components/WaveformBars';
import EmailStep from './EmailStep';
import OtpStep from './OtpStep';
import CreateRoomButton from '../../components/CreateRoomButton';

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
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.titleRow}>
        <WaveformBars />
        <Text style={styles.title}>Voice</Text>
      </View>

      {step === 'email' && (
        <EmailStep
          email={email}
          onEmailChange={setEmail}
          onSuccess={handleEmailSuccess}
        />
      )}

      {step === 'otp' && (
        <OtpStep email={email} onBack={() => setStep('email')} />
      )}

      {step === 'email' && <CreateRoomButton />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
});
