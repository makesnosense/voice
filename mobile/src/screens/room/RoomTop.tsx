import type { RoomId } from '../../../../shared/types/core';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { View, StyleSheet } from 'react-native';

import ChatCard from './components/ChatCard';
import OtherParty from './components/other-party/OtherParty';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';

interface RoomTopProps {
  roomId: RoomId;
}

export default function RoomTop({ roomId }: RoomTopProps) {
  const messages = useRoomStore(state => state.messages);
  const hasMessages = messages.length > 0;

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={52}
      style={styles.container}
    >
      {!hasMessages && <View style={styles.filler} />}
      <View style={[styles.content, hasMessages && styles.contentExpanded]}>
        <OtherParty roomId={roomId} />
        <ChatCard />
      </View>
      {!hasMessages && <View style={styles.filler} />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filler: {
    flex: 1,
  },
  content: {
    gap: 8,
  },
  contentExpanded: {
    flex: 1,
  },
});
