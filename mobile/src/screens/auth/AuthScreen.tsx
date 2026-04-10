import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WaveformBars from '../../components/WaveformBars';
import EmailStep from './EmailStep';
import OtpStep from './OtpStep';
import { createRoom } from '../../utils/create-room';
import { pressedStyle } from '../../styles/common';
import { TEXT_MUTED, BORDER_MUTED } from '../../styles/colors';

type AuthStep = 'email' | 'otp';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleEmailSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep('otp');
  };

  const handleCreateRoom = async () => {
    if (isCreatingRoom) return;
    setIsCreatingRoom(true);
    try {
      await createRoom();
    } catch (error) {
      console.error('❌ Failed to create room:', error);
    } finally {
      setIsCreatingRoom(false);
    }
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

      {step === 'email' && (
        <Pressable
          onPress={handleCreateRoom}
          disabled={isCreatingRoom}
          style={({ pressed }) => [
            styles.createRoomButton,
            { bottom: insets.bottom + 32 },
            pressed && pressedStyle,
          ]}
        >
          {isCreatingRoom ? (
            <ActivityIndicator size="small" color="#94a3b8" />
          ) : (
            <Text style={styles.createRoomLabel}>Create call</Text>
          )}
        </Pressable>
      )}
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
  createRoomButton: {
    position: 'absolute',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  createRoomLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
});
