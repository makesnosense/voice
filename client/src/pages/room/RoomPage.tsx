import ExitRoomButton from './components/exit-room-button/ExitRoomButton';
import layoutStyles from '../../styles/Layout.module.css';
import useRoomIdValidation from './useRoomIdValidation';
import useRoom from './useRoom';
import { ROOM_CONNECTION_STATUS } from './RoomPage.constants';
import Header from '../../components/header/Header';
import Spinner from '../../components/spinner/Spinner';
import RoomError from './components/room-error/RoomError';
import RoomInterior from './components/RoomInterior';

export default function RoomPage() {
  const validationResult = useRoomIdValidation();
  const roomState = useRoom(validationResult.roomId, validationResult.initialStatus);

  return (
    <div className={layoutStyles.page}>
      <Header
        leftContent={
          roomState.connectionStatus === ROOM_CONNECTION_STATUS.JOINED ? <ExitRoomButton /> : null
        }
        connectionStatus={roomState.connectionStatus}
      />

      {roomState.connectionStatus === ROOM_CONNECTION_STATUS.ERROR && (
        <RoomError connectionError={ROOM_CONNECTION_STATUS.ERROR} />
      )}

      {roomState.connectionStatus === ROOM_CONNECTION_STATUS.ROOM_FULL && (
        <RoomError connectionError={ROOM_CONNECTION_STATUS.ROOM_FULL} />
      )}

      {roomState.connectionStatus === ROOM_CONNECTION_STATUS.JOINED && (
        <RoomInterior {...roomState} />
      )}

      {roomState.connectionStatus === ROOM_CONNECTION_STATUS.CONNECTING && <Spinner />}
    </div>
  );
}
