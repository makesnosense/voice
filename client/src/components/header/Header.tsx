import TitleHeader from './title-header/TitleHeader';
import Pill from './pill/Pill';
import headerStyles from './Header.module.css';
import type { RoomConnectionStatus } from '../../pages/room/RoomPage.constants';

interface HeaderProps {
  leftContent?: React.ReactNode;
  connectionStatus?: RoomConnectionStatus;
}

export default function Header({ leftContent }: HeaderProps) {
  return (
    <header className={`${headerStyles.headerContainer}`}>
      <div className={headerStyles.leftSlot}>{leftContent}</div>
      <TitleHeader />
      <Pill />
    </header>
  );
}
