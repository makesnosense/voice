import { api } from '../api';
import { useActiveRoomStore } from '../stores/useActiveRoomStore';
import type { RoomId } from '../../../shared/types/core';

export async function createRoom(): Promise<void> {
  const { roomId } = await api.rooms.createRoom();
  useActiveRoomStore.setState({ activeRoomId: roomId as RoomId });
}
