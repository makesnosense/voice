import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';
import { isFromLocalUser } from '../../../../../../shared/utils/format';
import { getMessageSenderName } from '../../../../i18n/format';
import {
  TEXT_MUTED,
  BACKGROUND_CARD,
  BACKGROUND_PRIMARY,
} from '../../../../styles/colors';
import type { Message } from '../../../../../../shared/types/core';
import MessageText from './MessageText';

interface MessageProps {
  message: Message;
}

export default function Message({ message }: MessageProps) {
  const { t } = useTranslation();
  const localUsersEmail = useAuthStore(state => state.user?.email ?? null);
  const localSocketId = useRoomStore(state => state.localSocketId);

  const senderName = getMessageSenderName(
    message,
    localSocketId,
    localUsersEmail,
    t,
  );

  // ownership is only reliable once logged in — anonymous users fall back to
  // socketId, which changes on reconnect and would flip old messages to "other"
  const isLoggedIn = localUsersEmail !== null;
  const isFromMe =
    isLoggedIn && isFromLocalUser(message, localSocketId, localUsersEmail);

  return (
    <View
      style={[styles.bubbleWrapper, isFromMe && styles.bubbleWrapperFromMe]}
    >
      <View style={[styles.bubble, isFromMe && styles.bubbleFromMe]}>
        <Text style={[styles.senderName, isFromMe && styles.senderNameFromMe]}>
          {senderName}
        </Text>
        <MessageText text={message.text} isFromMe={isFromMe} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleWrapper: {
    flexDirection: 'row',
  },
  bubbleWrapperFromMe: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: BACKGROUND_CARD,
  },
  bubbleFromMe: {
    backgroundColor: TEXT_MUTED,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  senderNameFromMe: {
    color: BACKGROUND_PRIMARY,
  },
});
