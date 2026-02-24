import { ObjectValues } from '../types';
export const WEBRTC_CONNECTION_STATE = {
  WAITING_FOR_OTHER_PEER: 'waiting-for-other-peer',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed',
} as const;

export type WebRTCConnectionState = ObjectValues<typeof WEBRTC_CONNECTION_STATE>;

export const DISCONNECT_REASON = {
  PEER_LEFT: 'peer-left',
  CONNECTION_FAILED: 'connection-failed',
  ICE_FAILED: 'ice-failed',
  NETWORK_ERROR: 'network-error',
  MANUAL_CLEANUP: 'manual-cleanup',
} as const;

export type DisconnectReason = (typeof DISCONNECT_REASON)[keyof typeof DISCONNECT_REASON];
