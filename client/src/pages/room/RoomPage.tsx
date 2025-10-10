
import ExitRoomButton from './components/exit-room-button/ExitRoomButton';
import layoutStyles from '../../styles/Layout.module.css'
import useRoomIdValidation from './useRoomIdValidation';
import useRoom, { CONNECTION_STATUS } from './useRoom';
import Header from '../../components/Header';
import RoomError from './components/RoomError';
import RoomInterior from './components/RoomInterior';

export default function RoomPage() {
  const validationResult = useRoomIdValidation();
  const roomState = useRoom(validationResult.roomId, validationResult.initialStatus);

  return (
    <div className={layoutStyles.page}>
      <Header leftContent={roomState.connectionStatus === CONNECTION_STATUS.JOINED ? <ExitRoomButton /> : null} />

      {(roomState.connectionStatus === CONNECTION_STATUS.ERROR) && <RoomError errorType="not-found" />}
      {(roomState.connectionStatus === CONNECTION_STATUS.ROOM_FULL) && <RoomError errorType="room-full" />}
      {(roomState.connectionStatus === CONNECTION_STATUS.JOINED) && (
        <RoomInterior {...roomState} />
      )}
      {(roomState.connectionStatus === CONNECTION_STATUS.CONNECTING) && (
        <div>
          Connecting to room...
        </div>
      )}

    </div>
  )
}