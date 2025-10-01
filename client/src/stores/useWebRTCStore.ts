import { create } from 'zustand';
import { WebRTCManager, DisconnectReason } from '../pages/room/WebRTCManager';
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
  clearRemoteStream: (reason: DisconnectReason) => void;
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
    );

    set({
      manager: newManager,
      isMicActive: true,
      isMutedLocal: newManager.isMuted // sync initial state
    });

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

  updateAudioData: (data) => {
    set({ audioFrequencyData: data });
  },

  updateRemoteAudioData: (data) => { // new
    set({ remoteAudioFrequencyData: data });
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