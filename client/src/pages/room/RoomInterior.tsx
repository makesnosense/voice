import CopyCard from '../../components/CopyCard';
import RemoteAudio from './RemoteAudio';
import Users from './Users';
import layoutStyles from '../../styles/layout.module.css'
import AudioSetupOverlay from './AudioSetupOverlay';
import Messages from './Messages';
import { useState } from 'react';
import type { RoomId, Message, TypedSocket, SocketId } from "../../../../shared/types";

interface RoomInteriorProps {
  roomId: RoomId;
  roomUsers: SocketId[];
  messages: Message[];
  socketRef: React.RefObject<TypedSocket | null>;
  isMicActive: boolean;
  audioLevel: number;
  isMuted: boolean;
  toggleMute: () => void;
  remoteStreams: Map<SocketId, MediaStream>;
  audioSetupComplete: boolean;
  handleAudioSetupComplete: () => void;
}


export default function RoomInterior({
  roomUsers,
  messages,
  socketRef,
  isMicActive,
  audioLevel,
  isMuted,
  toggleMute,
  remoteStreams,
  audioSetupComplete,
  handleAudioSetupComplete
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

  if (!audioSetupComplete) {
    return (
      <div className={layoutStyles.roomContainer}>
        <CopyCard />
        <Users
          roomUsers={roomUsers}
          currentUserId={socketRef.current?.id as SocketId}
          isMicActive={false}
          audioLevel={0}
          isMuted={false}
          onToggleMute={() => { }}
        />

        <AudioSetupOverlay onAudioSetupComplete={handleAudioSetupComplete} />
      </div>
    );
  }


  return (
    <div className={layoutStyles.roomContainer}>
      <span>
        <CopyCard />
      </span>


      {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
        <RemoteAudio key={userId} userId={userId} stream={stream} />
      ))}


      {/* <div className={layoutStyles.roomInfo}>
        <div>
          Current users:
          {roomUsers.map(userId => (
            <span key={userId}>
              {userId === socketRef.current?.id ? 'You ' : `User ${userId.slice(-4)}`}
            </span>
          ))}
        </div>
      </div> */}

      <div style={{ padding: '1rem 0' }}>
        <Users
          roomUsers={roomUsers}
          currentUserId={socketRef.current?.id as SocketId}
          isMicActive={isMicActive}
          audioLevel={audioLevel}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
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

