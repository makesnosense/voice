import UserCard from './usercard/UserCard';
import { useWebRTCStore } from '../../../../stores/useWebRTCStore';
import usersStyles from './Users.module.css';
import type { SocketId, AudioFrequencyData } from '../../../../../../shared/types';
import { useRoomStore } from '../../../../../../shared/stores/useRoomStore';

interface UsersProps {
  currentUserId: SocketId | undefined;
}

export default function Users({ currentUserId }: UsersProps) {
  const roomUsers = useRoomStore((state) => state.roomUsers);
  const manager = useWebRTCStore((state) => state.manager);
  const isMicActive = useWebRTCStore((state) => state.isMicActive);
  const isMutedLocal = useWebRTCStore((state) => state.isMutedLocal);
  const toggleMute = useWebRTCStore((state) => state.toggleMute);
  const remoteUserId = useWebRTCStore((state) => state.remoteUserId);

  return (
    <div className={usersStyles.usersContainer}>
      {roomUsers.map((user) => {
        const isCurrentUser = user.userId === currentUserId;
        const isRemoteUser = user.userId === remoteUserId;

        let getAudioData: (() => AudioFrequencyData) | undefined;
        let isUserAudioActive = false;

        if (isCurrentUser && isMicActive && manager) {
          getAudioData = () => manager.getAudioFrequencyData();
          isUserAudioActive = !isMutedLocal;
        } else if (isRemoteUser && manager) {
          getAudioData = () => manager.getRemoteAudioFrequencyData();
          isUserAudioActive = !user.isMuted;
        }

        return (
          <UserCard
            key={user.userId}
            userId={user.userId}
            isCurrentUser={isCurrentUser}
            getAudioData={getAudioData}
            isAudioActive={isUserAudioActive}
            isMutedLocal={isCurrentUser ? isMutedLocal : undefined}
            onToggleMute={isCurrentUser ? toggleMute : undefined}
            isMicConnected={isCurrentUser ? isMicActive : undefined}
            isRemoteUserMuted={!isCurrentUser ? user.isMuted : undefined}
          />
        );
      })}
    </div>
  );
}
