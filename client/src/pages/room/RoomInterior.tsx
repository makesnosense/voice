import CopyCard from '../../components/CopyCard';
import layoutStyles from '../../styles/layout.module.css'

import Messages from './Messages';
import { useState } from 'react';
import type { RoomId, Message, TypedSocket } from "../../../../shared/types";

interface RoomInteriorProps {
  roomId: RoomId;
  roomUserCount: number;
  messages: Message[];
  socketRef: React.RefObject<TypedSocket | null>;
  isMicActive: boolean;
  audioLevel: number;
}


export default function RoomInterior({
  roomId,
  roomUserCount,
  messages,
  socketRef,
  isMicActive,
  audioLevel
}: RoomInteriorProps) {

  const [messageInput, setMessageInput] = useState('');


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

  return (
    <div className={layoutStyles.roomContainer}>
      <span>
        <CopyCard />
      </span>


      <div className={layoutStyles.roomInfo}>
        <h3>Room: <span>{roomId}</span></h3>
        <p>Users connected: <span>{roomUserCount}</span></p>



        {/* Minimal audio indicator */}
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          margin: '10px auto',
          backgroundColor: isMicActive ? '#22c55e' : '#ccc',
          transform: `scale(${1 + audioLevel / 100})`,
          transition: 'transform 0.1s',
          opacity: isMicActive ? 1 : 0.3
        }} />
        <small>{isMicActive ? '🎤 Active' : '🔇 Inactive'}</small>

      </div>

      <div className={layoutStyles.messagesArea}>
        <Messages messages={messages} />
      </div>
      <div className={layoutStyles.messageInput}>
        <input type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type message..." />
        <button
          onClick={sendMessage}
          className="send-button"
        >Send</button>
      </div>

    </div>
  );


}

