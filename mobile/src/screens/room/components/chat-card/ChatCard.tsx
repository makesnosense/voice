import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';
import {
  BACKGROUND_PRIMARY,
  BACKGROUND_CARD,
  BORDER_MUTED,
  BORDER_SUBTLE,
  TEXT_PRIMARY,
  TEXT_MUTED,
} from '../../../../styles/colors';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { runOnJS } from 'react-native-worklets';
import Message from './Message';

export default function ChatCard() {
  const messages = useRoomStore(state => state.messages);
  const sendMessage = useRoomStore(state => state.sendMessage);
  const [messageInput, setMessageInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const hasMessages = messages.length > 0;

  const scrollToBottom = useCallback((animated: boolean) => {
    scrollRef.current?.scrollToEnd({ animated });
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length, scrollToBottom]);

  useKeyboardHandler(
    {
      onMove: () => {
        'worklet';
        runOnJS(scrollToBottom)(false);
      },
    },
    [scrollToBottom],
  );

  const handleSend = () => {
    const text = messageInput.trim();
    if (!text || !sendMessage) return;
    console.log(messageInput);
    sendMessage(text);
    setMessageInput('');
  };

  return (
    <View style={[styles.card, hasMessages && styles.cardExpanded]}>
      <ScrollView
        ref={scrollRef}
        style={[styles.scrollView, !hasMessages && styles.scrollViewEmpty]}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: false })
        }
        keyboardShouldPersistTaps="handled"
      >
        {!hasMessages ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        ) : (
          messages.map((msg, index) => <Message key={index} message={msg} />)
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder="Message..."
          placeholderTextColor={TEXT_MUTED}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          submitBehavior="submit"
        />
        <Pressable
          style={[
            styles.sendButton,
            !messageInput.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!messageInput.trim()}
        >
          <Send
            size={15}
            color={messageInput.trim() ? BACKGROUND_PRIMARY : TEXT_MUTED}
            strokeWidth={1.75}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BACKGROUND_PRIMARY,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    overflow: 'hidden',
  },
  cardExpanded: {
    flexGrow: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewEmpty: {
    flex: 0,
    height: 70,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 12,
    gap: 6,
    justifyContent: 'flex-end',
  },
  emptyText: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER_MUTED,
  },
  input: {
    flex: 1,
    backgroundColor: BACKGROUND_CARD,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: TEXT_PRIMARY,
  },
  sendButton: {
    width: 34,
    height: 34,
    backgroundColor: TEXT_PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: BACKGROUND_CARD,
    borderWidth: 1,
    borderColor: BORDER_MUTED,
  },
});
