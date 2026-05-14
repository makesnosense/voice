import { create } from 'zustand';
import type { UserDataClientSide, Message } from '../types/core';
import { ROOM_CONNECTION_STATUS, type RoomConnectionStatus } from '../constants/room';
import type { InvitedContact } from '../types/contacts';

interface RoomState {
  roomUsers: UserDataClientSide[];
  messages: Message[];
  roomConnectionStatus: RoomConnectionStatus;
  isCallDeclined: boolean;
}

interface RoomStore extends RoomState {
  setRoomUsers: (users: UserDataClientSide[]) => void;
  addMessage: (message: Message) => void;
  setConnectionStatus: (status: RoomConnectionStatus) => void;
  reset: () => void;
}

const initialState: RoomState = {
  roomUsers: [],
  messages: [],
  roomConnectionStatus: ROOM_CONNECTION_STATUS.CONNECTING,
  isCallDeclined: false,
};

export const useRoomStore = create<RoomStore>((set) => ({
  ...initialState,

  setRoomUsers: (users) => set({ roomUsers: users }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setConnectionStatus: (status) => set({ roomConnectionStatus: status }),
  reset: () => set(initialState),
}));
