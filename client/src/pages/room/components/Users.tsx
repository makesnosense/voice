import UserCard from './usercard/UserCard';
import type { SocketId, AudioFrequencyData, UserDataClientSide } from '../../../../../shared/types';


interface UsersListProps {
  roomUsers: UserDataClientSide[];
  currentUserId: SocketId | undefined;
  // current user's mic properties
  isMicActive: boolean;
  audioFrequencyData: AudioFrequencyData;
  isMutedLocal: boolean;
  onToggleMute: () => void;
  // remote user's properties
  remoteAudioFrequencyData: AudioFrequencyData;
  remoteUserId: SocketId | null;
  hasRemoteStream: boolean;
}

export default function Users({
  roomUsers,
  currentUserId,
  isMicActive,
  audioFrequencyData,
  isMutedLocal,
  onToggleMute,
  remoteAudioFrequencyData,
  remoteUserId
}: UsersListProps) {

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      {roomUsers.map(user => {
        const isCurrentUser = user.userId === currentUserId;
        const isRemoteUser = user.userId === remoteUserId;

        // determine audio data and activity for this user
        let userAudioData: AudioFrequencyData | undefined;
        let isUserAudioActive = false;

        if (isCurrentUser && isMicActive) {
          userAudioData = audioFrequencyData;
          isUserAudioActive = !isMutedLocal;
        } else if (isRemoteUser) {
          userAudioData = remoteAudioFrequencyData;
          isUserAudioActive = !user.isMuted; // server-provided!
        }

        return (
          <UserCard
            key={user.userId}
            userId={user.userId}
            isCurrentUser={isCurrentUser}
            audioData={userAudioData}
            isAudioActive={isUserAudioActive}
            // current user specific props
            isMutedLocal={isCurrentUser ? isMutedLocal : undefined}
            onToggleMute={isCurrentUser ? onToggleMute : undefined}
            isMicConnected={isCurrentUser ? isMicActive : undefined}
            // remote user mute status
            isRemoteUserMuted={!isCurrentUser ? user.isMuted : undefined}
          />
        );
      })}
    </div>
  );
}
