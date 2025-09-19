import type { Message } from '../../../../../../shared/types';
import messagesStyles from './Messages.module.css';

interface MessagesProps {
  messages: Message[];
}

export default function Messages({ messages }: MessagesProps) {
  return (
    <div className={messagesStyles.messages}>
      {messages.map((msg, index) => (
        <div key={index}>
          <div className={messagesStyles.messageHeader}>
            <strong>{msg.userId}</strong>
            <span className={messagesStyles.timestamp}>
              {new Date(msg.timestamp).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </span>
          </div>
          <div className={messagesStyles.messageText}>
            {msg.text}
          </div>
        </div>
      ))}
    </div>
  );
}