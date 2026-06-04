import { create } from 'zustand';
import type { UserDataClientSide, Message, SocketId, InvitedUserClientState } from '../types/core';
import { ROOM_CONNECTION_STATUS, type RoomConnectionStatus } from '../constants/room';
import type { CallDismissalReason } from '../constants/calls';

interface RoomState {
  roomUsers: UserDataClientSide[];
  messages: Message[];
  localSocketId: SocketId | null;
  sendMessage: ((text: string) => void) | null;
  roomConnectionStatus: RoomConnectionStatus;
  callDismissalReason: CallDismissalReason | null;
  invitedUser: InvitedUserClientState | null;
}

interface RoomStore extends RoomState {
  setRoomUsers: (users: UserDataClientSide[]) => void;
  setConnectionStatus: (status: RoomConnectionStatus) => void;
  reset: () => void;
}

const initialState: RoomState = {
  roomUsers: [],
  messages: [],
  localSocketId: null,
  sendMessage: null,
  roomConnectionStatus: ROOM_CONNECTION_STATUS.CONNECTING,
  callDismissalReason: null,
  invitedUser: null,
};

export const useRoomStore = create<RoomStore>((set) => ({
  ...initialState,

  setRoomUsers: (users) => set({ roomUsers: users }),

  setConnectionStatus: (status) => set({ roomConnectionStatus: status }),
  reset: () => set(initialState),
}));
