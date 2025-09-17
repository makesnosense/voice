import UserCard from './UserCard';
import type { SocketId, AudioFrequencyData } from '../../../../shared/types';


interface UsersListProps {
  roomUsers: SocketId[];
  currentUserId: SocketId | undefined;
  // current user's mic properties
  isMicActive: boolean;
  audioFrequencyData: AudioFrequencyData;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function Users({
  roomUsers,
  currentUserId,
  isMicActive,
  audioFrequencyData,
  isMuted,
  onToggleMute
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

        return (
          <UserCard
            key={userId}
            userId={userId}
            isCurrentUser={isCurrentUser}
            // only pass mic props for current user
            isMicActive={isCurrentUser ? isMicActive : undefined}
            audioFrequencyData={isCurrentUser ? audioFrequencyData : undefined}
            isMuted={isCurrentUser ? isMuted : undefined}
            onToggleMute={isCurrentUser ? onToggleMute : undefined}
          />
        );
      })}
    </div>
  );
}