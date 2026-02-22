import TitleHeader from './title-header/TitleHeader';
import Pill from './pill/Pill';
import headerStyles from './Header.module.css';
import { ROOM_CONNECTION_STATUS } from '../../../../shared/room';
import { useRoomStore } from '../../stores/useRoomStore';
import ExitRoomButton from '../../pages/room/components/exit-room-button/ExitRoomButton';

export default function Header() {
  const connectionStatus = useRoomStore((state) => state.connectionStatus);
  return (
    <header className={`${headerStyles.headerContainer}`}>
      <div className={headerStyles.leftSlot}>
        {connectionStatus === ROOM_CONNECTION_STATUS.JOINED ? <ExitRoomButton /> : null}
      </div>
      <TitleHeader />
      <Pill />
    </header>
  );
}
