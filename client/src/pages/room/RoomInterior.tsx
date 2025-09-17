import CopyCard from '../../components/CopyCard';
import RemoteAudio from './RemoteAudio';
import Users from './Users';
import layoutStyles from '../../styles/layout.module.css'
import AudioSetupOverlay from './AudioSetupOverlay';
import Messages from './Messages';
import { useState } from 'react';
import baseStyles from '../../components/BaseCard.module.css'
import type { RoomId, Message, TypedSocket, SocketId, AudioFrequencyData } from "../../../../shared/types";

interface RoomInteriorProps {
  roomId: RoomId;
  roomUsers: SocketId[];
  messages: Message[];
  socketRef: React.RefObject<TypedSocket | null>;
  isMicActive: boolean;
  audioFrequencyData: AudioFrequencyData;
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
  audioFrequencyData,
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
          audioFrequencyData={audioFrequencyData}
          isMuted={false}
          onToggleMute={() => { }}
        />

        <AudioSetupOverlay onAudioSetupComplete={handleAudioSetupComplete} />
      </div>
    );
  }


  return (
    <div className={layoutStyles.roomContainer}>

      <CopyCard />



      {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
        <RemoteAudio key={userId} userId={userId} stream={stream} />
      ))}


      <div>
        <Users
          roomUsers={roomUsers}
          currentUserId={socketRef.current?.id as SocketId}
          isMicActive={isMicActive}
          audioFrequencyData={audioFrequencyData}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      </div>

      <div className={`${baseStyles.card} ${baseStyles.fullWidth} ${baseStyles.messagesCard}`}>
        <Messages messages={messages} />
      </div>

      <div className={`${baseStyles.fullWidth} ${layoutStyles.messageInputArea} `}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type message..."
        />
        <button onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>

  );
}

