import layoutStyles from '../../styles/layout.module.css'
import useRoomIdValidation from './useRoomIdValidation';
import useRoom from './useRoom';
import Header from '../../components/Header';
import RoomError from './RoomError';
import RoomInterior from './RoomInterior';

export default function RoomPage() {
  const validationResult = useRoomIdValidation();
  const roomState = useRoom(validationResult.roomId, validationResult.initialStatus);

  return (
    <div className={layoutStyles.page}>
      <div className={layoutStyles.header}>
        <Header />
      </div>

      <div className={layoutStyles.content}>
        {(roomState.connectionStatus === 'error') && <RoomError />}
        {(roomState.connectionStatus === 'joined') && (
          <RoomInterior {...roomState} />
        )}
        {(roomState.connectionStatus === 'connecting') && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Connecting to room...
          </div>
        )}
      </div>
    </div>
  )
}

