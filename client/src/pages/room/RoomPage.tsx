import layoutStyles from '../../styles/Layout.module.css';
import { useRoomStore } from '../../../../shared/stores/useRoomStore';
import useRoomId from './useRoomId';
import useRoom from './useRoom';
import { ROOM_CONNECTION_STATUS } from '../../../../shared/room';
import Header from '../../components/header/Header';
import Spinner from '../../components/spinner/Spinner';
import RoomError from './components/room-error/RoomError';
import RoomInterior from './components/RoomInterior';
import type { RoomId } from '../../../../shared/types';

export default function RoomPage() {
  const roomId = useRoomId(); // returns RoomId | null

  return (
    <div className={layoutStyles.page}>
      <Header />
      {roomId ? <RoomPageContent roomId={roomId} /> : <RoomError />}
    </div>
  );
}

function RoomPageContent({ roomId }: { roomId: RoomId }) {
  const { socketRef } = useRoom(roomId);
  const connectionStatus = useRoomStore((state) => state.connectionStatus);

  if (connectionStatus === ROOM_CONNECTION_STATUS.ERROR) return <RoomError />;
  if (connectionStatus === ROOM_CONNECTION_STATUS.ROOM_FULL)
    return <RoomError connectionError={ROOM_CONNECTION_STATUS.ROOM_FULL} />;
  if (connectionStatus === ROOM_CONNECTION_STATUS.CONNECTING) return <Spinner />;

  return <RoomInterior socketRef={socketRef} />;
}
