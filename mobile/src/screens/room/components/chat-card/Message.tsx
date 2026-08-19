import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';
import { getMessageSenderName } from '../../../../i18n/format';
import { TEXT_MUTED, BACKGROUND_CARD } from '../../../../styles/colors';
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

  return (
    <View style={styles.bubbleWrapper}>
      <View style={styles.bubble}>
        <Text style={styles.senderName}>{senderName}</Text>
        <MessageText text={message.text} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleWrapper: {
    flexDirection: 'row',
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: BACKGROUND_CARD,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 2,
  },
});
