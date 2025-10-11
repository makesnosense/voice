
import ExitRoomButton from './components/exit-room-button/ExitRoomButton';
import layoutStyles from '../../styles/Layout.module.css'
import useRoomIdValidation from './useRoomIdValidation';
import useRoom, { CONNECTION_STATUS } from './useRoom';
import Header from '../../components/header/Header';
import Spinner from '../../components/spinner/Spinner';
import RoomError from './components/RoomError';
import RoomInterior from './components/RoomInterior';
import { HEADER_ANIMATION_STATE } from './../../components/header/header-animation/HeaderAnimationState';
import type { HeaderAnimationState } from '../../components/header/header-animation/HeaderAnimationState';


export default function RoomPage() {
  const validationResult = useRoomIdValidation();
  const roomState = useRoom(validationResult.roomId, validationResult.initialStatus);

  const getHeaderAnimationState = (): HeaderAnimationState => {
    if (roomState.connectionStatus !== CONNECTION_STATUS.JOINED) {
      return HEADER_ANIMATION_STATE.ACTIVE; // default state when not in room
    }

    if (roomState.isMutedLocal) {
      return HEADER_ANIMATION_STATE.MUTED;
    }

    const hasActiveConnection = roomState.remoteStream !== null;

    if (!hasActiveConnection) {
      return HEADER_ANIMATION_STATE.SILENT; // in room but no active webrtc connection (waiting for second person)
    }
    return HEADER_ANIMATION_STATE.ACTIVE; // webrtc active and unmuted
  };


  return (
    <div className={layoutStyles.page}>
      <Header
        animationState={getHeaderAnimationState()}
        leftContent={roomState.connectionStatus === CONNECTION_STATUS.JOINED ? <ExitRoomButton /> : null} />

      {(roomState.connectionStatus === CONNECTION_STATUS.ERROR) && <RoomError errorType="not-found" />}

      {(roomState.connectionStatus === CONNECTION_STATUS.ROOM_FULL) && <RoomError errorType="room-full" />}

      {(roomState.connectionStatus === CONNECTION_STATUS.JOINED) && (<RoomInterior {...roomState} />)}

      {(roomState.connectionStatus === CONNECTION_STATUS.CONNECTING) && (<Spinner />)}

    </div>
  )
}