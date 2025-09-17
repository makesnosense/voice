import { Mic, MicOff } from 'lucide-react';
import AudioWaves from '../../components/AudioWaves';
import baseStyles from '../../components/BaseCard.module.css';
import buttonStyles from '../../components/Buttons.module.css';
import type { SocketId, AudioFrequencyData } from '../../../../shared/types';

interface UserCardProps {
  userId: SocketId;
  isCurrentUser: boolean;
  // Props only for current user
  isMicActive?: boolean;
  audioFrequencyData?: AudioFrequencyData; // changed from audioLevel
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export default function UserCard({
  userId,
  isCurrentUser,
  isMicActive = false,
  audioFrequencyData = { bands: [0, 0, 0, 0, 0], overallLevel: 0 },
  isMuted = false,
  onToggleMute
}: UserCardProps) {

  const displayName = isCurrentUser ? 'You' : `User ${userId.slice(-4)}`;

  return (
    <div className={`${baseStyles.card} ${baseStyles.textOnly}`}>
      {/* <User size={20} /> */}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <span className={baseStyles.title} style={{ fontSize: '16px' }}>
          {displayName}
        </span>

        {isCurrentUser && (
          <>
            <AudioWaves
              audioData={audioFrequencyData}
              isActive={isMicActive && !isMuted}
              size="small"
            />

            {/* Mic status text */}
            {(isMicActive === false) && (
              <small style={{
                fontSize: "10px",
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}> <MicOff size={14} /> not connected

              </small>)
            }
            {/* Mute/Unmute button */}

            {isMicActive && (
              <button
                onClick={onToggleMute}
                className={` ${buttonStyles.iconButton} ${buttonStyles.button} 
                ${isMuted ? buttonStyles.lightRed : buttonStyles.neutral}
                `}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}


          </>
        )}
      </div>
    </div>
  );
}
