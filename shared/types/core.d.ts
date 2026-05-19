import type { Server, Socket as ConnectedSocket } from 'socket.io';
import type { Socket as ClientSocket } from 'socket.io-client';
import type { Contact } from '../types/contacts';
import type { CallHistoryEntry } from '../types/calls';

export type ObjectValues<T> = T[keyof T];

export type RoomId = string & { readonly __brand: 'RoomId' };
export type SocketId = string & { readonly __brand: 'SocketId' };

// pre-collapse: fields may be absent if socket is anonymous
export interface VoiceSocketData {
  name?: string | null;
  email?: string | null;
}

// post-collapse: always present, anonymous users get null
export interface UserIdentity {
  name: string | null;
  email: string | null;
}

export interface UserDataServerSide extends UserIdentity {
  webRTCReady: boolean;
  isMuted: boolean;
}

export interface UserDataClientSide extends UserIdentity {
  socketId: SocketId;
  isMuted: boolean;
}

export interface Room {
  users: Map<SocketId, UserDataServerSide>;
  pendingInviteFcmTokens: string[];
}

export interface Message {
  text: string;
  socketId: SocketId;
  timestamp: number;
}

export interface CreateRoomResponse {
  roomId: RoomId;
}

export interface RoomAliveResponse {
  alive: boolean;
  userCount: number;
}

// Socket.IO event types
export interface ServerToClientEvents {
  'room-users-update': (users: UserDataClientSide[]) => void;
  'room-join-success': (data: { roomId: RoomId }) => void;
  'room-full': (error: string) => void;
  message: (message: Message) => void;
  'room-not-found': (error: string) => void;

  'call-declined': () => void;

  error: (data: { message: string; type?: string }) => void;

  'initiate-webrtc-call': (targetSocketId: SocketId) => void;

  // WebRTC events
  'webrtc-offer': (data: { offer: WebRTCOffer; fromSocketId: SocketId }) => void;
  'webrtc-answer': (data: { answer: WebRTCAnswer; fromSocketId: SocketId }) => void;
  'webrtc-ice-candidate': (data: { candidate: IceCandidate; fromSocketId: SocketId }) => void;
  'user-left': (socketId: SocketId) => void;
}

export interface ClientToServerEvents {
  'join-room': (roomId: RoomId) => void;
  message: (data: { text: string }) => void;
  'webrtc-ready': () => void;
  'mute-status-changed': (data: { isMuted: boolean }) => void;

  // WebRTC events
  'webrtc-offer': (data: { offer: WebRTCOffer; toSocketId: SocketId }) => void;
  'webrtc-answer': (data: { answer: WebRTCAnswer; toSocketId: SocketId }) => void;
  'webrtc-ice-candidate': (data: { candidate: IceCandidate; toSocketId: SocketId }) => void;
}

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, VoiceSocketData>;
export type TypedClientSocket = ClientSocket<ServerToClientEvents, ClientToServerEvents>;

export type ExtendedConnectedSocket = ConnectedSocket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  VoiceSocketData
> & {
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

export interface DataExport {
  exportedAt: string;
  profile: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
  };
  contacts: Contact[];
  callHistory: CallHistoryEntry[];
}
