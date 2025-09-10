import { useParams } from 'react-router';
import type { RoomId, ConnectionStatus } from '../../../../shared/types';

interface RoomIdValidationResult {
  roomId: RoomId | null;
  initialStatus: ConnectionStatus;
  errorMessage?: string;
}


export default function useRoomIdValidation(): RoomIdValidationResult {
  const { roomId: paramRoomId } = useParams<{ roomId: RoomId }>();

  if (!paramRoomId) {
    return {
      roomId: null,
      initialStatus: 'error' as const,
      errorMessage: 'Room ID is required'
    };
  }

  if (!isValidRoomId(paramRoomId)) {
    return {
      roomId: null,
      initialStatus: 'error' as const,
      errorMessage: 'Invalid room ID format'
    };
  }

  return {
    roomId: paramRoomId as RoomId,
    initialStatus: 'connecting' as const
  };
}


function isValidRoomId(roomId: string): roomId is RoomId {
  return roomId.length > 0 && /^[a-zA-Z0-9-]+$/.test(roomId);
}