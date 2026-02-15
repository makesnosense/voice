import UserCard from './usercard/UserCard';
import type {
  SocketId,
  AudioFrequencyData,
  UserDataClientSide,
} from '../../../../../../shared/types';
import { useWebRTCStore } from '../../../../stores/useWebRTCStore';
import usersStyles from './Users.module.css';

interface UsersListProps {
  roomUsers: UserDataClientSide[];
  currentUserId: SocketId | undefined;
  // current user's mic properties
  isMicActive: boolean;
  isMutedLocal: boolean;
  onToggleMute: () => void;
  // remote user's properties
  remoteUserId: SocketId | null;
  hasRemoteStream: boolean;
}

export default function Users({
  roomUsers,
  currentUserId,
  isMicActive,
  isMutedLocal,
  onToggleMute,
  remoteUserId,
}: UsersListProps) {
  const webRTCManager = useWebRTCStore((state) => state.manager);

  return (
    <div className={usersStyles.usersContainer}>
      {roomUsers.map((user) => {
        const isCurrentUser = user.userId === currentUserId;
        const isRemoteUser = user.userId === remoteUserId;

        // determine audio data and activity for this user
        let getAudioData: (() => AudioFrequencyData) | undefined;
        let isUserAudioActive = false;

        if (isCurrentUser && isMicActive && webRTCManager) {
          getAudioData = () => webRTCManager.getAudioFrequencyData();
          isUserAudioActive = !isMutedLocal;
        } else if (isRemoteUser && webRTCManager) {
          getAudioData = () => webRTCManager.getRemoteAudioFrequencyData();
          isUserAudioActive = !user.isMuted; // server-provided!
        }

        return (
          <UserCard
            key={user.userId}
            userId={user.userId}
            isCurrentUser={isCurrentUser}
            getAudioData={getAudioData}
            isAudioActive={isUserAudioActive}
            isMutedLocal={isCurrentUser ? isMutedLocal : undefined}
            onToggleMute={isCurrentUser ? onToggleMute : undefined}
            isMicConnected={isCurrentUser ? isMicActive : undefined}
            isRemoteUserMuted={!isCurrentUser ? user.isMuted : undefined}
          />
        );
      })}
    </div>
  );
}
