import CopyCard from './copycard/CopyCard';
import RemoteAudio from './RemoteAudio';
import Users from './users/Users';
import MicWarning from './mic-warning/MicWarning';
import layoutStyles from '../../../styles/Layout.module.css';
import Messages from './messages/Messages';
import { useWebRTCStore } from './../../../../../shared/stores/useWebRTCStore';
import { useMicrophoneStore } from '../../../stores/useMicrophoneStore';
import { MIC_PERMISSION_STATUS } from '../../../../../shared/constants/microphone';

import type { TypedClientSocket, SocketId } from '../../../../../shared/types';

interface RoomInteriorProps {
  socketRef: React.RefObject<TypedClientSocket | null>;
}

export default function RoomInterior({ socketRef }: RoomInteriorProps) {
  const remoteStream = useWebRTCStore((state) => state.remoteStream);
  const remoteUserId = useWebRTCStore((state) => state.remoteUserId);
  const micPermissionStatus = useMicrophoneStore((state) => state.status);

  return (
    <div className={layoutStyles.roomInteriorContainer}>
      <CopyCard />

      {/* single remote audio component */}
      {remoteStream && remoteUserId && <RemoteAudio userId={remoteUserId} stream={remoteStream} />}

      <Users currentUserId={socketRef.current?.id as SocketId} />

      {(micPermissionStatus === MIC_PERMISSION_STATUS.DENIED ||
        micPermissionStatus === MIC_PERMISSION_STATUS.NOT_SUPPORTED) && (
        <MicWarning micPermissionStatus={micPermissionStatus} />
      )}

      <Messages socketRef={socketRef} />
    </div>
  );
}
