import { Mic, MicOff } from 'lucide-react';
import AudioWaves from './audiowaves/AudioWaves';
import baseStyles from '../../../styles/BaseCard.module.css';
import buttonStyles from '../../../styles/Buttons.module.css';
import type { SocketId, AudioFrequencyData } from '../../../../../shared/types';

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
    <div className={`${baseStyles.card} ${baseStyles.textOnly}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <span className={baseStyles.title} style={{ fontSize: '16px' }}>
          {displayName}
        </span>

        {isMutedRemoteUser && (
          <MicOff
            className={`${buttonStyles.lightRed} ${buttonStyles.noBorder}`}
            size={14} />
        )}

        {/* show audio waves when audio data is available */}
        {audioData && !isMutedRemoteUser && (
          <AudioWaves
            audioData={audioData}
            isActive={isAudioActive}
            size="small"
          />
        )}


        {/* current user controls and status */}
        {isCurrentUser && (
          <>
            {/* mic not connected status */}
            {!isMicConnected && (
              <small style={{
                fontSize: "10px",
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <MicOff size={14} /> not connected
              </small>
            )}

            {/* mute/unmute button */}
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