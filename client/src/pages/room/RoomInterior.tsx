import CopyCard from '../../components/CopyCard';
import layoutStyles from '../../styles/layout.module.css'
import { Mic, MicOff, MicVocal, Unplug } from 'lucide-react';
import buttonStyles from '../../components/Buttons.module.css';
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
  isMuted: boolean;
  toggleMute: () => void;
}


export default function RoomInterior({
  roomId,
  roomUserCount,
  messages,
  socketRef,
  isMicActive,
  audioLevel,
  isMuted,
  toggleMute
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
        <small>{isMicActive ? <MicVocal size={20} /> : <Unplug size={20} />} microphone {isMicActive ? ' connected' : 'not connected'}</small>

        <button
          onClick={toggleMute}
          className={`${buttonStyles.button} ${buttonStyles.iconButton}`}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
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

