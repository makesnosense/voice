import { create } from 'zustand';
import type { UserDataClientSide, Message } from '../../../shared/types';
import { ROOM_CONNECTION_STATUS } from '../pages/room/RoomPage.constants';
import type { RoomConnectionStatus } from '../pages/room/RoomPage.constants';

interface RoomStore {
  roomUsers: UserDataClientSide[];
  messages: Message[];
  connectionStatus: RoomConnectionStatus;

  setRoomUsers: (users: UserDataClientSide[]) => void;
  addMessage: (message: Message) => void;
  setConnectionStatus: (status: RoomConnectionStatus) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomUsers: [],
  messages: [],
  connectionStatus: ROOM_CONNECTION_STATUS.CONNECTING,

  setRoomUsers: (users) => set({ roomUsers: users }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  reset: () => set({ roomUsers: [], messages: [] }),
}));
