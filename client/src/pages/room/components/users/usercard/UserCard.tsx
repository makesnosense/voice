import { Mic, MicOff } from 'lucide-react';
import AudioWaves from './audiowaves/AudioWaves';
import baseStyles from '../../../../../styles/BaseCard.module.css';
import userCardStyles from './UserCard.module.css';
import buttonStyles from '../../../../../styles/Buttons.module.css';
import WebRTCConnectionStatusDot from './WebRTCConnectionStatusDot/WebRTCConnectionStatusDot';
import type { AudioFrequencyData } from '../../../../../../../shared/types/core';
import DisplayName from '../display-name/DisplayName';

interface UserCardProps {
  displayName: string;
  isCurrentUser: boolean;

  // audio visualization (for any user)
  getAudioData?: () => AudioFrequencyData;
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
  displayName,
  isCurrentUser,
  getAudioData,
  isAudioActive = false,
  isMutedLocal = false,
  onToggleMute,
  isMicConnected = false,
  isRemoteUserMuted = false,
}: UserCardProps) {
  const isMutedRemoteUser = !isCurrentUser && isRemoteUserMuted;

  return (
    <div className={`${baseStyles.card} ${userCardStyles.userCard}`}>
      <div className={userCardStyles.userCardContent}>
        <DisplayName name={displayName} />

        <div className={userCardStyles.audioWavesContainer}>
          {isMutedRemoteUser && (
            <MicOff className={`${buttonStyles.lightRed} ${buttonStyles.noBorder}`} size={16} />
          )}

          {getAudioData && !isMutedRemoteUser && (
            <AudioWaves getAudioData={getAudioData} isActive={isAudioActive} size="medium" />
          )}
        </div>

        {isCurrentUser && (
          <>
            {!isMicConnected && (
              <small className={userCardStyles.micStatus}>
                <MicOff size={14} /> not provided
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

        {!isCurrentUser && <WebRTCConnectionStatusDot />}
      </div>
    </div>
  );
}
