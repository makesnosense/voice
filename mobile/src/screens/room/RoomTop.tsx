import type { RoomId } from '../../../../shared/types/core';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { StyleSheet } from 'react-native';
import ChatCard from './components/ChatCard';
import OtherParty from './components/other-party/OtherParty';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RoomTopProps {
  roomId: RoomId;
}

export default function RoomTop({ roomId }: RoomTopProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={insets.top + 8}
      style={styles.container}
    >
      <OtherParty roomId={roomId} />
      <ChatCard />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
  },
});
