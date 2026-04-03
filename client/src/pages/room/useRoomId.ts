import { useParams } from 'react-router';

import type { RoomId } from '../../../../shared/types/core';

export default function useRoomIdValidation(): RoomId | null {
  const { roomId } = useParams<{ roomId: RoomId }>();

  if (!roomId || !/^[a-z0-9]{3}-[a-z0-9]{3}$/.test(roomId)) return null;

  return roomId as RoomId;
}
