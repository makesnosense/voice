import type { Server } from '../server/node_modules/socket.io';
import type { Socket } from '../client/node_modules/socket.io';


export type RoomId = string & { readonly __brand: 'RoomId' };
export type SocketId = string & { readonly __brand: 'SocketId' };

type ConnectionStatus = 'connecting' | 'joined' | 'error';
type MicPermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'not-supported';

export interface Room {
  users: Map<SocketId, { webRTCReady: boolean }>;
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
  'room-users-update': (users: SocketId[]) => void;
  'room-join-success': (data: { roomId: RoomId }) => void;
  'message': (message: Message) => void;
  'room-not-found': (error: string) => void;

  'initiate-webrtc-call': (targetUserId: SocketId) => void;

  // WebRTC events
  'webrtc-offer': (data: { offer: WebRTCOffer; fromUserId: SocketId }) => void;
  'webrtc-answer': (data: { answer: WebRTCAnswer; fromUserId: SocketId }) => void;
  'webrtc-ice-candidate': (data: { candidate: IceCandidate; fromUserId: SocketId }) => void;
  'user-left': (userId: SocketId) => void;
}

export interface ClientToServerEvents {
  'join-room': (roomId: RoomId) => void;
  'message': (data: { text: string }) => void;
  'webrtc-ready': () => void;

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