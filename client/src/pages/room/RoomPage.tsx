import ExitRoomButton from './components/exit-room-button/ExitRoomButton';
import layoutStyles from '../../styles/Layout.module.css';
import { useRoomStore } from '../../stores/useRoomStore';
import useRoomIdValidation from './useRoomIdValidation';
import useRoom from './useRoom';
import { ROOM_CONNECTION_STATUS } from './RoomPage.constants';
import Header from '../../components/header/Header';
import Spinner from '../../components/spinner/Spinner';
import RoomError from './components/room-error/RoomError';
import RoomInterior from './components/RoomInterior';

export default function RoomPage() {
  const connectionStatus = useRoomStore((state) => state.connectionStatus);
  const validationResult = useRoomIdValidation();
  const { socketRef } = useRoom(validationResult.roomId, validationResult.initialStatus);

  return (
    <div className={layoutStyles.page}>
      <Header
        leftContent={connectionStatus === ROOM_CONNECTION_STATUS.JOINED ? <ExitRoomButton /> : null}
      />

      {connectionStatus === ROOM_CONNECTION_STATUS.ERROR && (
        <RoomError connectionError={ROOM_CONNECTION_STATUS.ERROR} />
      )}

      {connectionStatus === ROOM_CONNECTION_STATUS.ROOM_FULL && (
        <RoomError connectionError={ROOM_CONNECTION_STATUS.ROOM_FULL} />
      )}

      {connectionStatus === ROOM_CONNECTION_STATUS.JOINED && <RoomInterior socketRef={socketRef} />}

      {connectionStatus === ROOM_CONNECTION_STATUS.CONNECTING && <Spinner />}
    </div>
  );
}
