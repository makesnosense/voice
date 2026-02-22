import { useParams } from 'react-router';
import { ROOM_CONNECTION_STATUS, type RoomConnectionStatus } from '../../../../shared/room';
import type { RoomId } from '../../../../shared/types';

interface RoomIdValidationResult {
  roomId: RoomId | null;
  initialStatus: RoomConnectionStatus;
  errorMessage?: string;
}

export default function useRoomIdValidation(): RoomIdValidationResult {
  const { roomId: paramRoomId } = useParams<{ roomId: RoomId }>();

  if (!paramRoomId) {
    return {
      roomId: null,
      initialStatus: ROOM_CONNECTION_STATUS.ERROR,
      errorMessage: 'Room ID is required',
    };
  }

  if (!isValidRoomId(paramRoomId)) {
    return {
      roomId: null,
      initialStatus: ROOM_CONNECTION_STATUS.ERROR,
      errorMessage: 'Invalid room ID format',
    };
  }

  return {
    roomId: paramRoomId as RoomId,
    initialStatus: ROOM_CONNECTION_STATUS.CONNECTING,
  };
}

function isValidRoomId(roomId: string): roomId is RoomId {
  return roomId.length > 0 && /^[a-zA-Z0-9-]+$/.test(roomId);
}
