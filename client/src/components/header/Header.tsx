import { useWebRTCStore } from '../../stores/useWebRTCStore';
import { ROOM_CONNECTION_STATUS } from '../../pages/room/RoomPage.constants';
import { HEADER_ANIMATION_STATE } from './title-header/header-animation/HeaderAnimationState';
import TitleHeader from './title-header/TitleHeader';
import Pill from './pill/Pill';
import headerStyles from './Header.module.css';
import type { RoomConnectionStatus } from '../../pages/room/RoomPage.constants';

interface HeaderProps {
  leftContent?: React.ReactNode;
  connectionStatus?: RoomConnectionStatus;
}

export default function Header({ leftContent, connectionStatus }: HeaderProps) {
  const isMutedLocal = useWebRTCStore((state) => state.isMutedLocal);
  const remoteStream = useWebRTCStore((state) => state.remoteStream);

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
    <header className={`${headerStyles.headerContainer}`}>
      <div className={headerStyles.leftSlot}>{leftContent}</div>
      <TitleHeader animationState={getAnimationState()} />
      <Pill />
    </header>
  );
}
