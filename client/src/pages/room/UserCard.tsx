// client/src/components/UserCard.tsx
import { User, Mic, MicOff, MicVocal } from 'lucide-react';
import baseStyles from '../../components/BaseCard.module.css';
import buttonStyles from '../../components/Buttons.module.css';
import type { SocketId } from '../../../../shared/types';

interface UserCardProps {
  userId: SocketId;
  isCurrentUser: boolean;
  // Props only for current user
  isMicActive?: boolean;
  audioLevel?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export default function UserCard({
  userId,
  isCurrentUser,
  isMicActive = false,
  audioLevel = 0,
  isMuted = false,
  onToggleMute
}: UserCardProps) {

  const displayName = isCurrentUser ? 'You' : `User ${userId.slice(-4)}`;

  return (
    <div className={`${baseStyles.card} ${baseStyles.textOnly}`}>
      <User size={20} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <span className={baseStyles.title} style={{ fontSize: '16px' }}>
          {displayName}
        </span>

        {isCurrentUser && (
          <>
            {/* Audio level indicator */}
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: isMicActive ? '#22c55e' : '#ccc',
              transform: `scale(${1 + audioLevel / 200})`,
              transition: 'transform 0.1s, background-color 0.3s',
              opacity: isMicActive ? 1 : 0.3
            }} />

            {/* Mic status text */}
            <small style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: isMicActive ? '#22c55e' : '#6b7280'
            }}>
              {isMicActive ? <MicVocal size={16} /> : <MicOff size={16} />}
              {isMicActive ? 'Connected' : 'Not connected'}
            </small>

            {/* Mute/Unmute button */}
            {isMicActive && (
              <button
                onClick={onToggleMute}
                className={`${buttonStyles.button} ${buttonStyles.iconButton} ${buttonStyles.lightGreen}`}
                style={{
                  fontSize: '14px',
                  padding: '8px 12px',
                  opacity: isMuted ? 0.7 : 1
                }}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
