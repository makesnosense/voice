import './RoomPage.css';

import useRoomIdValidation from './useRoomIdValidation';
import useRoom from './useRoom';
import Header from '../../components/Header';
import RoomError from './RoomError';
import RoomInterior from './RoomInterior';

export default function RoomPage() {
  const validationResult = useRoomIdValidation();
  const roomState = useRoom(validationResult.roomId, validationResult.initialStatus);

  return (
    <>
      <Header />
      {(roomState.connectionStatus === 'error') && <RoomError />}
      {(roomState.connectionStatus === 'joined') && <RoomInterior {...roomState} />}
    </>
  )
}

