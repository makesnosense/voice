import { Send } from 'lucide-react';
import messagesStyles from './Messages.module.css';
import { useState, useEffect, useRef } from 'react';
import baseStyles from '../../../../styles/BaseCard.module.css';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';
import Username from './username/Username';
import MessageText from './message-text/MessageText';

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

export default function Messages() {
  const messages = useRoomStore((state) => state.messages);
  const sendMessage = useRoomStore((state) => state.sendMessage);
  const [messageInput, setMessageInput] = useState('');

  const messagesRef = useAutoScroll(messages);

  const handleSend = () => {
    const text = messageInput.trim();
    if (!text || !sendMessage) return;
    console.log(messageInput);
    sendMessage(text);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
                  <Username message={msg} />
                  <span className={messagesStyles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </span>
                </div>
                <MessageText text={msg.text} />
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
          onClick={handleSend}
          disabled={!messageInput.trim()}
          className={messagesStyles.sendButton}
        >
          <Send size={22} />
        </button>
      </div>
    </div>
  );
}
