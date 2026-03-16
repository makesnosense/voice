import { create } from 'zustand';
import type { UserDataClientSide, Message } from '../types/core';
import { ROOM_CONNECTION_STATUS, type RoomConnectionStatus } from '../constants/room';

interface RoomStore {
  roomUsers: UserDataClientSide[];
  messages: Message[];
  roomConnectionStatus: RoomConnectionStatus;

  setRoomUsers: (users: UserDataClientSide[]) => void;
  addMessage: (message: Message) => void;
  setConnectionStatus: (status: RoomConnectionStatus) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomUsers: [],
  messages: [],
  roomConnectionStatus: ROOM_CONNECTION_STATUS.CONNECTING,

  setRoomUsers: (users) => set({ roomUsers: users }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setConnectionStatus: (status) => set({ roomConnectionStatus: status }),
  reset: () =>
    set({ roomUsers: [], messages: [], roomConnectionStatus: ROOM_CONNECTION_STATUS.CONNECTING }),
}));
