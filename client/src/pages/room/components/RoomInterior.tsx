import CopyCard from "./copycard/CopyCard";
import RemoteAudio from "./RemoteAudio";
import Users from "./users/Users";
import MicWarning from "./mic-warning/MicWarning";
import layoutStyles from "../../../styles/Layout.module.css";
import Messages from "./messages/Messages";
import { MIC_PERMISSION_STATUS } from "../../../stores/useMicrophoneStore";
import type { MicPermissionStatus } from "../../../stores/useMicrophoneStore";
import type {
  RoomId,
  Message,
  TypedSocket,
  SocketId,
  AudioFrequencyData,
  UserDataClientSide,
} from "../../../../../shared/types";
import type { WebRTCConnectionState } from "../WebRTCManager";

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
  webRtcConnectionState: WebRTCConnectionState | null;
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
  micPermissionStatus,
  webRtcConnectionState,
}: RoomInteriorProps) {
  return (
    <div className={layoutStyles.roomInteriorContainer}>
      <CopyCard />

      {/* single remote audio component */}
      {remoteStream && remoteUserId && (
        <RemoteAudio userId={remoteUserId} stream={remoteStream} />
      )}

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
        webRtcConnectionState={webRtcConnectionState}
      />

      {(micPermissionStatus === MIC_PERMISSION_STATUS.DENIED ||
        micPermissionStatus === MIC_PERMISSION_STATUS.NOT_SUPPORTED) && (
        <MicWarning micPermissionStatus={micPermissionStatus} />
      )}

      <Messages messages={messages} socketRef={socketRef} />
    </div>
  );
}
