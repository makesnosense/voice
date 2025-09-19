import UserCard from './UserCard';
import type { SocketId, AudioFrequencyData } from '../../../../../shared/types';


interface UsersListProps {
  roomUsers: SocketId[];
  currentUserId: SocketId | undefined;
  // current user's mic properties
  isMicActive: boolean;
  audioFrequencyData: AudioFrequencyData;
  isMuted: boolean;
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
  isMuted,
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
      {roomUsers.map(userId => {
        const isCurrentUser = userId === currentUserId;
        const isRemoteUser = userId === remoteUserId;

        // determine audio data and activity for this user
        let userAudioData: AudioFrequencyData | undefined;
        let isUserAudioActive = false;

        if (isCurrentUser && isMicActive) {
          userAudioData = audioFrequencyData;
          isUserAudioActive = !isMuted;
        } else if (isRemoteUser) {
          userAudioData = remoteAudioFrequencyData;
          isUserAudioActive = true; // remote audio is always "active" when present
        }

        return (
          <UserCard
            key={userId}
            userId={userId}
            isCurrentUser={isCurrentUser}
            audioData={userAudioData}
            isAudioActive={isUserAudioActive}
            // current user specific props
            isMuted={isCurrentUser ? isMuted : undefined}
            onToggleMute={isCurrentUser ? onToggleMute : undefined}
            isMicConnected={isCurrentUser ? isMicActive : undefined}
          />
        );
      })}
    </div>
  );
}