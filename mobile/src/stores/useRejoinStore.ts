import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../utils/mmkv';
import { useAuthStore } from './useAuthStore';
import type { RoomId } from '../../../shared/types/core';

interface RejoinStore {
  lastRoomId: RoomId | null;
}

export const useRejoinStore = create<RejoinStore>()(
  persist((): RejoinStore => ({ lastRoomId: null }), {
    name: 'rejoin',
    storage: createJSONStorage(() => mmkvStorage),
  }),
);

useAuthStore.subscribe((state, prevState) => {
  if (prevState.isAuthenticated && !state.isAuthenticated) {
    useRejoinStore.setState({ lastRoomId: null });
  }
});
