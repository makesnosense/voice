import { create } from 'zustand';
import { WebRTCManager } from '../pages/room/webrtc/WebRTCManager';
import type { TypedSocket, SocketId, AudioFrequencyData } from '../../../shared/types';

interface WebRTCStore {
  manager: WebRTCManager | null;
  remoteStream: MediaStream | null;
  remoteUserId: SocketId | null;
  isMicActive: boolean;
  isMuted: boolean;
  audioFrequencyData: AudioFrequencyData;

  initializeWebRTC: (socket: TypedSocket, localStream: MediaStream) => Promise<void>;
  toggleMute: () => void;
  cleanup: () => void;
  updateAudioData: (data: AudioFrequencyData) => void;
  setRemoteStream: (userId: SocketId, stream: MediaStream) => void;
  clearRemoteStream: () => void;
}

export const useWebRTCStore = create<WebRTCStore>((set, get) => ({
  manager: null,
  remoteStream: null,
  remoteUserId: null,
  isMicActive: false,
  isMuted: false,
  audioFrequencyData: { bands: [0, 0, 0, 0, 0], overallLevel: 0 },

  initializeWebRTC: async (socket, localStream) => {
    const { manager } = get();
    if (manager) return; // already initialized

    const newManager = new WebRTCManager(
      socket,
      localStream,
      (userId, stream) => get().setRemoteStream(userId, stream),
      () => get().clearRemoteStream()
    );

    set({ manager: newManager, isMicActive: true });

    // start audio monitoring
    const checkAudio = () => {
      const currentManager = get().manager;
      if (currentManager) {
        const data = currentManager.getAudioFrequencyData();
        get().updateAudioData(data);
        requestAnimationFrame(checkAudio);
      }
    };
    checkAudio();

    socket.emit('webrtc-ready');
  },

  toggleMute: () => {
    const { manager, isMuted } = get();
    if (manager) {
      manager.toggleMute();
      set({ isMuted: !isMuted });
    }
  },

  updateAudioData: (data) => {
    set({ audioFrequencyData: data });
  },

  setRemoteStream: (userId, stream) => {
    set({ remoteStream: stream, remoteUserId: userId });
  },

  clearRemoteStream: () => {
    set({ remoteStream: null, remoteUserId: null });
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
      audioFrequencyData: { bands: [0, 0, 0, 0, 0], overallLevel: 0 }
    });
  }
}));