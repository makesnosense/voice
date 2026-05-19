import type { TypedClientSocket } from '../../../../../../shared/types/core';
import { Send } from 'lucide-react';
import messagesStyles from './Messages.module.css';
import { useState, useEffect, useRef } from 'react';
import baseStyles from '../../../../styles/BaseCard.module.css';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';
interface MessagesProps {
  socketRef: React.RefObject<TypedClientSocket | null>;
}

function useAutoScroll(dependencies: React.DependencyList) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerElem = elementRef.current;
    if (containerElem) {
      containerElem.scrollTo({
        top: containerElem.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [dependencies]);
  return elementRef;
}

export default function Messages({ socketRef }: MessagesProps) {
  const messages = useRoomStore((state) => state.messages);
  const [messageInput, setMessageInput] = useState('');

  const messagesRef = useAutoScroll(messages);

  const sendMessage = () => {
    const text = messageInput.trim();
    if (text && socketRef.current) {
      console.log(messageInput);
      socketRef.current.emit('message', { text });
      setMessageInput('');
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderUsername = (socketId: string) => {
    const localSocketId = socketRef.current?.id;
    const isLocalUser = socketId === localSocketId;

    return (
      <strong
        className={`${messagesStyles.username} ${isLocalUser ? messagesStyles.currentUser : ''}`}
      >
        {isLocalUser ? 'You' : 'Other'}
      </strong>
    );
  };

  return (
    <div className={`${baseStyles.card} ${baseStyles.column} ${messagesStyles.messagesCard}`}>
      <div className={messagesStyles.messagesContent} ref={messagesRef}>
        {messages.length === 0 ? (
          <div className={messagesStyles.emptyState}>No chat messages yet</div>
        ) : (
          <div className={messagesStyles.messages}>
            {messages.map((msg, index) => (
              <div key={index} className={messagesStyles.message}>
                <div className={messagesStyles.messageHeader}>
                  {renderUsername(msg.socketId)}
                  <span className={messagesStyles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </span>
                </div>
                <div className={messagesStyles.messageText}>{msg.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={messagesStyles.messageInput}>
        <input
          type="text"
          value={messageInput}
          onChange={(event) => setMessageInput(event.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="type message..."
        />
        <button
          onClick={sendMessage}
          disabled={!messageInput.trim()}
          className={messagesStyles.sendButton}
        >
          <Send size={22} />
        </button>
      </div>
    </div>
  );
}
