import HeaderAnimation from './header-animation/HeaderAnimation';
import baseStyles from '../../../styles/BaseCard.module.css';
import headerStyles from '../Header.module.css';
import { useWebRTCStore } from '../../../stores/useWebRTCStore';
import { useRoomStore } from '../../../stores/useRoomStore';
import { ROOM_CONNECTION_STATUS } from '../../../pages/room/RoomPage.constants';
import { HEADER_ANIMATION_STATE } from '../title-header/header-animation/HeaderAnimationState';

export default function TitleHeader() {
  const isMutedLocal = useWebRTCStore((state) => state.isMutedLocal);
  const remoteStream = useWebRTCStore((state) => state.remoteStream);
  const connectionStatus = useRoomStore((state) => state.connectionStatus);

  const getAnimationState = () => {
    if (connectionStatus !== ROOM_CONNECTION_STATUS.JOINED) {
      return HEADER_ANIMATION_STATE.ACTIVE;
    }
    if (isMutedLocal) {
      return HEADER_ANIMATION_STATE.MUTED;
    }
    if (remoteStream === null) {
      return HEADER_ANIMATION_STATE.SILENT;
    }
    return HEADER_ANIMATION_STATE.ACTIVE;
  };

  return (
    <div className={`${baseStyles.card} ${headerStyles.titleCard}`}>
      <HeaderAnimation animationState={getAnimationState()} />
      <h1 className={baseStyles.title}>Voice</h1>
    </div>
  );
}
