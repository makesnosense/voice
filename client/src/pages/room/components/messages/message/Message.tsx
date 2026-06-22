import messageStyles from './Message.module.css';
import Username from './username/Username';
import MessageText from './message-text/MessageText';
import type { Message } from '../../../../../../../shared/types/core';

interface MessageProps {
  message: Message;
}

export default function Message({ message }: MessageProps) {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div>
      <div className={messageStyles.messageHeader}>
        <Username message={message} />
        <span className={messageStyles.timestamp}>{formattedTime}</span>
      </div>
      <MessageText text={message.text} />
    </div>
  );
}
