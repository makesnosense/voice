import CopyCard from './copycard/CopyCard';
import RemoteAudio from './RemoteAudio';
import Users from './users/Users';
import MicWarning from './mic-warning/MicWarning';
import layoutStyles from '../../../styles/Layout.module.css';
import Messages from './messages/Messages';
import { useWebRTCStore } from './../../../../../shared/stores/useWebRTCStore';
import { useMicrophoneStore } from '../../../stores/useMicrophoneStore';
import { MIC_PERMISSION_STATUS } from '../../../../../shared/constants/microphone';

export default function RoomInterior() {
  const remoteStream = useWebRTCStore((state) => state.remoteStream);
  const remoteSocketId = useWebRTCStore((state) => state.remoteSocketId);
  const micPermissionStatus = useMicrophoneStore((state) => state.status);

  return (
    <div className={layoutStyles.roomInteriorContainer}>
      <CopyCard />

      {/* single remote audio component */}
      {remoteStream && remoteSocketId && (
        <RemoteAudio socketId={remoteSocketId} stream={remoteStream} />
      )}

      <Users />

      {(micPermissionStatus === MIC_PERMISSION_STATUS.DENIED ||
        micPermissionStatus === MIC_PERMISSION_STATUS.NOT_SUPPORTED) && (
        <MicWarning micPermissionStatus={micPermissionStatus} />
      )}

      <Messages />
    </div>
  );
}
