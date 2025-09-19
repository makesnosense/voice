import CopyCard from './copycard/CopyCard';
import RemoteAudio from './RemoteAudio';
import Users from './Users';
import layoutStyles from '../../../styles/layout.module.css'
// import AudioSetupOverlay from './AudioSetupOverlay';
import Messages from './messages/Messages';
import { useState } from 'react';
import baseStyles from '../../../styles/BaseCard.module.css'
import type {
  RoomId, Message, TypedSocket, SocketId,
  AudioFrequencyData, MicPermissionStatus
} from "../../../../../shared/types";

interface RoomInteriorProps {
  roomId: RoomId;
  roomUsers: SocketId[];
  messages: Message[];
  socketRef: React.RefObject<TypedSocket | null>;
  isMicActive: boolean;
  audioFrequencyData: AudioFrequencyData;
  isMuted: boolean;
  toggleMute: () => void;
  remoteStream: MediaStream | null;
  remoteUserId: SocketId | null;
  remoteAudioFrequencyData: AudioFrequencyData;
  micPermissionStatus: MicPermissionStatus;
}


export default function RoomInterior({
  roomUsers,
  messages,
  socketRef,
  isMicActive,
  audioFrequencyData,
  isMuted,
  toggleMute,
  remoteStream,
  remoteUserId,
  remoteAudioFrequencyData,
  micPermissionStatus
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
      <CopyCard />

      {/* single remote audio component */}
      {remoteStream && remoteUserId && (
        <RemoteAudio userId={remoteUserId} stream={remoteStream} />
      )}

      <div>
        <Users
          roomUsers={roomUsers}
          currentUserId={socketRef.current?.id as SocketId}
          isMicActive={isMicActive}
          audioFrequencyData={audioFrequencyData}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          remoteAudioFrequencyData={remoteAudioFrequencyData}
          remoteUserId={remoteUserId}
          hasRemoteStream={!!remoteStream}
        />

        {/* show mic permission status if there's an issue */}
        {micPermissionStatus === 'denied' && (
          <div style={{
            marginTop: '8px',
            padding: '8px',
            background: '#fee2e2',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#991b1b',
            textAlign: 'center'
          }}>
            ⚠️ Microphone permission denied. Please enable it in browser settings.
          </div>
        )}

        {micPermissionStatus === 'not-supported' && (
          <div style={{
            marginTop: '8px',
            padding: '8px',
            background: '#fef3c7',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#92400e',
            textAlign: 'center'
          }}>
            ⚠️ Your browser doesn't support audio input.
          </div>
        )}
      </div>

      <div className={`${baseStyles.card} ${baseStyles.fullWidth} ${baseStyles.messagesCard}`}>
        <Messages messages={messages} />
      </div>

      <div className={`${baseStyles.fullWidth} ${layoutStyles.messageInputArea}`}>
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