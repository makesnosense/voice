import { useParams } from 'react-router';
import { validateRoomId } from '../../../../shared/utils/room';

import type { RoomId } from '../../../../shared/types/core';

export default function useRoomIdValidation(): RoomId | null {
  const { roomId } = useParams<{ roomId: RoomId }>();

  if (!roomId || !validateRoomId(roomId)) return null;

  return roomId as RoomId;
}
