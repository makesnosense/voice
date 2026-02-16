import CopyCard from './copycard/CopyCard';
import RemoteAudio from './RemoteAudio';
import Users from './users/Users';
import MicWarning from './mic-warning/MicWarning';
import layoutStyles from '../../../styles/Layout.module.css';
import Messages from './messages/Messages';
import { useWebRTCStore } from '../../../stores/useWebRTCStore';
import { useMicrophoneStore } from '../../../stores/useMicrophoneStore';
import { MIC_PERMISSION_STATUS } from '../../../stores/useMicrophoneStore';
// import type { MicPermissionStatus } from '../../../stores/useMicrophoneStore';
import type {
  Message,
  TypedSocket,
  SocketId,
  UserDataClientSide,
} from '../../../../../shared/types';

interface RoomInteriorProps {
  roomUsers: UserDataClientSide[];
  messages: Message[];
  socketRef: React.RefObject<TypedSocket | null>;
}

export default function RoomInterior({ roomUsers, messages, socketRef }: RoomInteriorProps) {
  const remoteStream = useWebRTCStore((state) => state.remoteStream);
  const remoteUserId = useWebRTCStore((state) => state.remoteUserId);
  const micPermissionStatus = useMicrophoneStore((state) => state.status);

  return (
    <div className={layoutStyles.roomInteriorContainer}>
      <CopyCard />

      {/* single remote audio component */}
      {remoteStream && remoteUserId && <RemoteAudio userId={remoteUserId} stream={remoteStream} />}

      <Users roomUsers={roomUsers} currentUserId={socketRef.current?.id as SocketId} />

      {(micPermissionStatus === MIC_PERMISSION_STATUS.DENIED ||
        micPermissionStatus === MIC_PERMISSION_STATUS.NOT_SUPPORTED) && (
        <MicWarning micPermissionStatus={micPermissionStatus} />
      )}

      <Messages messages={messages} socketRef={socketRef} />
    </div>
  );
}
