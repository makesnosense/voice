import { useNavigate } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import buttonStyles from '../../styles/Buttons.module.css';
import layoutStyles from '../../styles/Layout.module.css'
import useRoomIdValidation from './useRoomIdValidation';
import useRoom from './useRoom';
import Header from '../../components/Header';
import RoomError from './components/RoomError';
import RoomInterior from './components/RoomInterior';

export default function RoomPage() {
  const navigate = useNavigate();
  const validationResult = useRoomIdValidation();
  const roomState = useRoom(validationResult.roomId, validationResult.initialStatus);

  const handleExitRoom = () => {
    navigate('/');
  };

  const exitButton = (
    <button
      onClick={handleExitRoom}
      className={`${buttonStyles.button} ${buttonStyles.lightRed} ${buttonStyles.iconButton}`}
    >
      <ChevronLeft size={20} className={buttonStyles.icon} />
      Exit
    </button>
  );

  return (
    <div className={layoutStyles.page}>
      <Header leftContent={roomState.connectionStatus === 'joined' ? exitButton : null} />

      {(roomState.connectionStatus === 'error') && <RoomError errorType="not-found" />}
      {(roomState.connectionStatus === 'room-full') && <RoomError errorType="room-full" />}
      {(roomState.connectionStatus === 'joined') && (
        <RoomInterior {...roomState} />
      )}
      {(roomState.connectionStatus === 'connecting') && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Connecting to room...
        </div>
      )}

    </div>
  )
}