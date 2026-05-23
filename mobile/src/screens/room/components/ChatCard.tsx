import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { useRoomStore } from '../../../../../shared/stores/useRoomStore';
import {
  BACKGROUND_PRIMARY,
  BACKGROUND_SECONDARY,
  BACKGROUND_CARD,
  BORDER_MUTED,
  BORDER_SUBTLE,
  TEXT_PRIMARY,
  TEXT_MUTED,
} from '../../../styles/colors';

export default function ChatCard() {
  const localSocketId = useRoomStore(state => state.localSocketId);
  const messages = useRoomStore(state => state.messages);
  const sendMessage = useRoomStore(state => state.sendMessage);
  const [messageInput, setMessageInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = () => {
    const text = messageInput.trim();
    if (!text || !sendMessage) return;
    console.log(messageInput);
    sendMessage(text);
    setMessageInput('');
  };

  return (
    <View style={styles.card}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: false })
        }
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <Text style={styles.emptyText}>no messages yet</Text>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.socketId === localSocketId;
            return (
              <View
                key={index}
                style={[
                  styles.bubbleWrapper,
                  isOwn ? styles.bubbleWrapperOwn : styles.bubbleWrapperOther,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isOwn ? styles.bubbleOwn : styles.bubbleOther,
                  ]}
                >
                  <Text style={isOwn ? styles.textOwn : styles.textOther}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder="message..."
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
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
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
  bubbleWrapper: {
    flexDirection: 'row',
  },
  bubbleWrapperOwn: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  bubbleOwn: {
    backgroundColor: TEXT_PRIMARY,
    borderBottomRightRadius: 3,
  },
  bubbleOther: {
    backgroundColor: BACKGROUND_CARD,
    borderBottomLeftRadius: 3,
  },
  textOwn: {
    fontSize: 13,
    color: BACKGROUND_SECONDARY,
    lineHeight: 19,
  },
  textOther: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    lineHeight: 19,
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
