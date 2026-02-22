import { useParams } from 'react-router';

import type { RoomId } from '../../../../shared/types';

export default function useRoomIdValidation(): RoomId | null {
  const { roomId } = useParams<{ roomId: RoomId }>();

  if (!roomId || !/^[a-zA-Z0-9-]+$/.test(roomId)) return null;

  return roomId as RoomId;
}
