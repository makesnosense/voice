import { Mic, MicOff } from 'lucide-react';
import AudioWaves from '../../audiowaves/AudioWaves';
import baseStyles from '../../../../../styles/BaseCard.module.css';
import userCardStyles from './UserCard.module.css';
import buttonStyles from '../../../../../styles/Buttons.module.css';
import type { SocketId, AudioFrequencyData } from '../../../../../../../shared/types';

interface UserCardProps {
  userId: SocketId;
  isCurrentUser: boolean;

  // audio visualization (for any user)
  audioData?: AudioFrequencyData;
  isAudioActive?: boolean;

  // controls (only for current user)
  isMutedLocal?: boolean;
  onToggleMute?: () => void;

  // status (only for current user)
  isMicConnected?: boolean;

  // remote user mute status
  isRemoteUserMuted?: boolean;
}

export default function UserCard({
  isCurrentUser,
  audioData,
  isAudioActive = false,
  isMutedLocal = false,
  onToggleMute,
  isMicConnected = false,
  isRemoteUserMuted = false
}: UserCardProps) {

  const displayName = isCurrentUser ? 'You' : 'Other';

  const isMutedRemoteUser = !isCurrentUser && isRemoteUserMuted;

  return (
    <div className={`${baseStyles.card} ${baseStyles.textOnly} ${baseStyles.userCard}`}>
      <div className={userCardStyles.userCardContent}>
        <span className={`${baseStyles.title} ${userCardStyles.displayName}`}>
          {displayName}
        </span>

        <div className={userCardStyles.audioWavesContainer}>
          {isMutedRemoteUser && (
            <MicOff
              className={`${buttonStyles.lightRed} ${buttonStyles.noBorder}`}
              size={16}
            />
          )}

          {audioData && !isMutedRemoteUser && (
            <AudioWaves
              audioData={audioData}
              isActive={isAudioActive}
              size="medium"
            />
          )}
        </div>

        {isCurrentUser && (
          <>
            {!isMicConnected && (
              <small className={userCardStyles.micStatus}>
                <MicOff size={14} /> not connected
              </small>
            )}

            {isMicConnected && onToggleMute && (
              <button
                onClick={onToggleMute}
                className={`${buttonStyles.iconButton} ${buttonStyles.button} 
                  ${isMutedLocal ? buttonStyles.lightRed : buttonStyles.neutral}
                `}
              >
                {isMutedLocal ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
