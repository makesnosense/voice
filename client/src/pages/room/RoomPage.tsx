import layoutStyles from '../../styles/Layout.module.css';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';
import useRoomId from './useRoomId';
import useRoom from './useRoom';
import { ROOM_CONNECTION_STATUS } from '../../../../shared/constants/room';
import Header from '../../components/header/Header';
import Spinner from '../../components/spinner/Spinner';
import AppError from '../../components/app-error/AppError';
import RoomInterior from './components/RoomInterior';
import type { RoomId } from '../../../../shared/types/core';
import BackButton from '../../components/header/back-button/BackButton';
import { BACK_BUTTON_VARIANT } from '../../components/header/back-button/BackButton.constants';
import { APP_ERROR } from '../../components/app-error/AppError.constants';

const exitButton = <BackButton label="Exit" variant={BACK_BUTTON_VARIANT.RED} />;

export default function RoomPage() {
  const roomId = useRoomId(); // returns RoomId | null
  const roomConnectionStatus = useRoomStore((state) => state.roomConnectionStatus);

  const leftSlot = roomConnectionStatus === ROOM_CONNECTION_STATUS.JOINED ? exitButton : null;

  return (
    <div className={layoutStyles.page}>
      <Header leftSlot={leftSlot} />
      {roomId ? <RoomPageContent roomId={roomId} /> : <AppError error={APP_ERROR.ROOM_NOT_FOUND} />}
    </div>
  );
}

function RoomPageContent({ roomId }: { roomId: RoomId }) {
  const { socketRef } = useRoom(roomId);
  const roomConnectionStatus = useRoomStore((state) => state.roomConnectionStatus);

  if (roomConnectionStatus === ROOM_CONNECTION_STATUS.ROOM_NOT_FOUND)
    return <AppError error={ROOM_CONNECTION_STATUS.ROOM_NOT_FOUND} />;
  if (roomConnectionStatus === ROOM_CONNECTION_STATUS.ROOM_FULL)
    return <AppError error={ROOM_CONNECTION_STATUS.ROOM_FULL} />;
  if (roomConnectionStatus === ROOM_CONNECTION_STATUS.CONNECTING) return <Spinner />;

  return <RoomInterior socketRef={socketRef} />;
}
