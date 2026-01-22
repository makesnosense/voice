import type { Server } from 'socket.io';
import type { Socket } from 'socket.io-client';

export type ObjectValues<T> = T[keyof T];

export type RoomId = string & { readonly __brand: 'RoomId' };
export type SocketId = string & { readonly __brand: 'SocketId' };

export interface UserDataServerSide {
  webRTCReady: boolean;
  isMuted: boolean;
}

export interface UserDataClientSide {
  userId: SocketId;
  isMuted: boolean;
}

export interface Room {
  users: Map<SocketId, UserDataServerSide>;
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
  'room-users-update': (users: UserDataClientSide[]) => void;
  'room-join-success': (data: { roomId: RoomId }) => void;
  'room-full': (error: string) => void;
  message: (message: Message) => void;
  'room-not-found': (error: string) => void;

  error: (data: { message: string; type?: string }) => void;

  'initiate-webrtc-call': (targetUserId: SocketId) => void;

  // WebRTC events
  'webrtc-offer': (data: { offer: WebRTCOffer; fromUserId: SocketId }) => void;
  'webrtc-answer': (data: { answer: WebRTCAnswer; fromUserId: SocketId }) => void;
  'webrtc-ice-candidate': (data: { candidate: IceCandidate; fromUserId: SocketId }) => void;
  'user-left': (userId: SocketId) => void;
}

export interface ClientToServerEvents {
  'join-room': (roomId: RoomId) => void;
  message: (data: { text: string }) => void;
  'webrtc-ready': () => void;
  'mute-status-changed': (data: { isMuted: boolean }) => void;

  // WebRTC events
  'webrtc-offer': (data: { offer: WebRTCOffer; toUserId: SocketId }) => void;
  'webrtc-answer': (data: { answer: WebRTCAnswer; toUserId: SocketId }) => void;
  'webrtc-ice-candidate': (data: { candidate: IceCandidate; toUserId: SocketId }) => void;
}

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type ExtendedSocket = TypedSocket & {
  roomId?: RoomId;
};

export interface WebRTCOffer {
  sdp: string;
  type: 'offer';
}

export interface WebRTCAnswer {
  sdp: string;
  type: 'answer';
}

export interface IceCandidate {
  candidate: string;
  sdpMLineIndex: number | null;
  sdpMid: string | null;
}

export interface AudioFrequencyData {
  bands: number[]; // array of frequency band levels
  overallLevel: number; // keep the existing single level for compatibility
}

// JWT auth

export interface AccessTokenPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

export interface RefreshTokenPayload {
  userId: string;
  jti: string;
  iat: number;
}
