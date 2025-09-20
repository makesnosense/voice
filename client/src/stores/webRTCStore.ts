import { create } from 'zustand';
import { WebRTCManager } from '../pages/room/WebRTCManager';
import type { TypedSocket, SocketId, AudioFrequencyData } from '../../../shared/types';

interface WebRTCStore {
  manager: WebRTCManager | null;
  remoteStream: MediaStream | null;
  remoteUserId: SocketId | null;
  isMicActive: boolean;
  isMutedLocal: boolean;
  audioFrequencyData: AudioFrequencyData;
  remoteAudioFrequencyData: AudioFrequencyData;

  initializeWebRTC: (socket: TypedSocket, localStream: MediaStream) => Promise<void>;
  toggleMute: () => void;
  cleanup: () => void;
  updateAudioData: (data: AudioFrequencyData) => void;
  updateRemoteAudioData: (data: AudioFrequencyData) => void;
  setRemoteStream: (userId: SocketId, stream: MediaStream) => void;
  clearRemoteStream: () => void;
}

export const useWebRTCStore = create<WebRTCStore>((set, get) => ({
  manager: null,
  remoteStream: null,
  remoteUserId: null,
  isMicActive: false,
  isMutedLocal: false,
  audioFrequencyData: { bands: [0, 0, 0, 0, 0], overallLevel: 0 },
  remoteAudioFrequencyData: { bands: [0, 0, 0, 0, 0], overallLevel: 0 },

  initializeWebRTC: async (socket, localStream) => {
    const { manager } = get();
    if (manager) return; // already initialized

    const newManager = new WebRTCManager(
      socket,
      localStream,
      (userId, stream) => get().setRemoteStream(userId, stream),
      () => get().clearRemoteStream(),
    );

    set({ manager: newManager, isMicActive: true });

    // start audio monitoring for both local and remote
    const checkAudio = () => {
      const currentManager = get().manager;
      if (currentManager) {
        // local audio
        const localData = currentManager.getAudioFrequencyData();
        get().updateAudioData(localData);

        // remote audio
        const remoteData = currentManager.getRemoteAudioFrequencyData();
        get().updateRemoteAudioData(remoteData);

        requestAnimationFrame(checkAudio); // the magic that sets continuous checkAudio calling
      }
    };
    checkAudio();

    socket.emit('webrtc-ready');
  },

  toggleMute: () => {
    const { manager, isMutedLocal } = get();
    if (manager) {
      manager.toggleMute();
      set({ isMutedLocal: !isMutedLocal });
    }
  },

  updateAudioData: (data) => {
    set({ audioFrequencyData: data });
  },

  updateRemoteAudioData: (data) => { // new
    set({ remoteAudioFrequencyData: data });
  },

  setRemoteStream: (userId, stream) => {
    set({ remoteStream: stream, remoteUserId: userId });
  },

  clearRemoteStream: () => {
    set({
      remoteStream: null,
      remoteUserId: null,
      remoteAudioFrequencyData: { bands: [0, 0, 0, 0, 0], overallLevel: 0 } // reset remote audio data
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
      audioFrequencyData: { bands: [0, 0, 0, 0, 0], overallLevel: 0 },
      remoteAudioFrequencyData: { bands: [0, 0, 0, 0, 0], overallLevel: 0 }
    });
  }
}));