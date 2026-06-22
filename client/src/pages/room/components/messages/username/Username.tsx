import usernameStyles from './Username.module.css';
import { useAuthStore } from '../../../../../stores/useAuthStore';
import { useRoomStore } from '../../../../../../../shared/stores/useRoomStore';
import { getMessageSenderName, isFromLocalUser } from '../../../../../../../shared/utils/format';
import type { Message } from '../../../../../../../shared/types/core';

interface UsernameProps {
  message: Message;
}

export default function Username({ message }: UsernameProps) {
  const localUsersEmail = useAuthStore((state) => state.user?.email ?? null);
  const localSocketId = useRoomStore((state) => state.localSocketId);

  const displayName = getMessageSenderName(message, localSocketId, localUsersEmail);
  const isMessageFromMe = isFromLocalUser(message, localSocketId, localUsersEmail);

  return (
    <strong
      className={`${usernameStyles.username} ${isMessageFromMe ? usernameStyles.currentUser : ''}`}
    >
      {displayName}
    </strong>
  );
}
