import CopyCard from './copycard/CopyCard';
import RemoteAudio from './RemoteAudio';
import Users from './Users';
import layoutStyles from '../../../styles/Layout.module.css'
// import AudioSetupOverlay from './AudioSetupOverlay';
import Messages from './messages/Messages';

import type {
  RoomId, Message, TypedSocket, SocketId,
  AudioFrequencyData, MicPermissionStatus, UserDataClientSide
} from "../../../../../shared/types";

interface RoomInteriorProps {
  roomId: RoomId;
  roomUsers: UserDataClientSide[];
  messages: Message[];
  socketRef: React.RefObject<TypedSocket | null>;
  isMicActive: boolean;
  audioFrequencyData: AudioFrequencyData;
  isMutedLocal: boolean;
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
  isMutedLocal,
  toggleMute,
  remoteStream,
  remoteUserId,
  remoteAudioFrequencyData,
  micPermissionStatus
}: RoomInteriorProps) {

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
          isMutedLocal={isMutedLocal}
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


      <Messages
        messages={messages}
        socketRef={socketRef} />

    </div>
  );
}