import { create } from 'zustand';
import type { RoomId } from '../../../shared/types/core';

interface ActiveRoomStore {
  activeRoomId: RoomId | null;
}

export const useActiveRoomStore = create<ActiveRoomStore>(() => ({
  activeRoomId: null,
}));
