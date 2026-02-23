import { create } from 'zustand';
import {
  WebRTCManager,
  DisconnectReason,
  type WebRTCConnectionState,
} from '../pages/room/WebRTCManager';
import type { TypedClientSocket, SocketId } from '../../../shared/types';

interface WebRTCStore {
  manager: WebRTCManager | null;
  remoteStream: MediaStream | null;
  remoteUserId: SocketId | null;
  isMicActive: boolean;
  isMutedLocal: boolean;
  webRTCConnectionState: WebRTCConnectionState | null;

  initializeWebRTC: (
    socket: TypedClientSocket,
    localStream: MediaStream,
    analyserCallbacks?: {
      onLocalStream: (stream: MediaStream) => void;
      onRemoteStream: (stream: MediaStream) => void;
    }
  ) => Promise<void>;
  toggleMute: () => void;
  cleanup: () => void;
  setRemoteStream: (userId: SocketId, stream: MediaStream) => void;
  clearRemoteStream: (reason: DisconnectReason) => void;
}

export const useWebRTCStore = create<WebRTCStore>((set, get) => ({
  manager: null,
  remoteStream: null,
  remoteUserId: null,
  isMicActive: false,
  isMutedLocal: false,
  webRTCConnectionState: null,

  initializeWebRTC: async (socket, localStream, analyserCallbacks) => {
    const { manager } = get();
    if (manager) {
      console.log('⚠️ [Store] WebRTC already initialized');
      return;
    }

    console.log('🎬 [Store] initializing WebRTC manager');

    const newManager = new WebRTCManager(
      socket,
      localStream,
      (userId, stream) => get().setRemoteStream(userId, stream),
      (reason) => get().clearRemoteStream(reason),
      (state) => set({ webRTCConnectionState: state }),
      analyserCallbacks
    );

    set({
      manager: newManager,
      isMicActive: true,
      isMutedLocal: newManager.isMuted, // sync initial state
    });

    console.log('✅ [Store] emitting webrtc-ready to server');

    socket.emit('webrtc-ready');
  },

  toggleMute: () => {
    const { manager } = get();
    if (manager) {
      manager.toggleMute();

      const actualMutedState = manager.isMuted;
      set({ isMutedLocal: actualMutedState });
    }
  },

  setRemoteStream: (userId, stream) => {
    console.log(`✅ [Store] remote stream set for user ${userId}`);
    set({ remoteStream: stream, remoteUserId: userId });
  },

  clearRemoteStream: (reason) => {
    console.log(`🔌 [Store] clearing remote stream (reason: ${reason})`);
    set({
      remoteStream: null,
      remoteUserId: null,
      // remoteAudioFrequencyData: { bands: [0, 0, 0, 0, 0], overallLevel: 0 }, // reset remote audio data
    });
  },

  cleanup: () => {
    const { manager } = get();
    if (manager) {
      manager.cleanup();
    }
    set({
      manager: null,
      remoteStream: null,
      remoteUserId: null,
      isMicActive: false,
    });
  },
}));
