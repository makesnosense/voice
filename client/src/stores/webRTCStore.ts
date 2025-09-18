import { create } from 'zustand';
import { WebRTCManager } from '../pages/room/webrtc/WebRTCManager';
import type { TypedSocket, SocketId, AudioFrequencyData } from '../../../shared/types';

interface WebRTCStore {
  manager: WebRTCManager | null;
  remoteStreams: Map<SocketId, MediaStream>;
  isMicActive: boolean;
  isMuted: boolean;
  audioFrequencyData: AudioFrequencyData;

  initializeWebRTC: (socket: TypedSocket, localStream: MediaStream) => Promise<void>;
  toggleMute: () => void;
  cleanup: () => void;
  updateAudioData: (data: AudioFrequencyData) => void;
  addRemoteStream: (userId: SocketId, stream: MediaStream) => void;
  removeRemoteStream: (userId: SocketId) => void;
}

export const useWebRTCStore = create<WebRTCStore>((set, get) => ({
  manager: null,
  remoteStreams: new Map(),
  isMicActive: false,
  isMuted: false,
  audioFrequencyData: { bands: [0, 0, 0, 0, 0], overallLevel: 0 },

  initializeWebRTC: async (socket, localStream) => {
    const { manager } = get();
    if (manager) return; // already initialized

    const newManager = new WebRTCManager(
      socket,
      localStream,
      (userId, stream) => get().addRemoteStream(userId, stream),
      (userId) => get().removeRemoteStream(userId)
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

  addRemoteStream: (userId, stream) => {
    set(state => ({
      remoteStreams: new Map(state.remoteStreams).set(userId, stream)
    }));
  },

  removeRemoteStream: (userId) => {
    set(state => {
      const newStreams = new Map(state.remoteStreams);
      newStreams.delete(userId);
      return { remoteStreams: newStreams };
    });
  },

  cleanup: () => {
    const { manager } = get();
    if (manager) {
      manager.cleanup();
    }
    set({
      manager: null,
      remoteStreams: new Map(),
      isMicActive: false,
      audioFrequencyData: { bands: [0, 0, 0, 0, 0], overallLevel: 0 }
    });
  }
}));