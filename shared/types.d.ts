import type { Server, Socket } from 'socket.io';

export type RoomId = string & { readonly __brand: 'RoomId' };
export type SocketId = string & { readonly __brand: 'SocketId' };

export interface Room {
  created: number;
  users: Set<SocketId>;
}

export interface Message {
  text: string;
  userId: SocketId;
  timestamp: number;
}

export interface CreateRoomResponse {
  roomId: RoomId;
}

// Socket.IO event types
export interface ServerToClientEvents {
  'room-usercount-update': (count: number) => void;
  'room-join-success': ({ roomId: RoomId, userCount: number }) => void;
  'message': (message: Message) => void;
  'error': (error: string) => void;
}

export interface ClientToServerEvents {
  'join-room': (roomId: RoomId) => void;
  'message': (data: { text: string }) => void;
}

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export type ExtendedSocket = TypedSocket & {
  roomId?: RoomId;
};