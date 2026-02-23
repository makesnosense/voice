import { create } from 'zustand';
import AudioAnalyser from '../pages/room/AudioAnalyser';
import type { AudioFrequencyData } from '../../../shared/types';

const EMPTY_AUDIO_DATA: AudioFrequencyData = { bands: [0, 0, 0, 0, 0], overallLevel: 0 };

interface AudioAnalyserStore {
  audioContext: AudioContext | null;
  localAnalyser: AudioAnalyser | null;
  remoteAnalyser: AudioAnalyser | null;

  initializeLocalAnalyser: (stream: MediaStream) => void;
  initializeRemoteAnalyser: (stream: MediaStream) => void;
  getLocalAudioData: () => AudioFrequencyData;
  getRemoteAudioData: () => AudioFrequencyData;
  cleanup: () => void;
}

export const useAudioAnalyserStore = create<AudioAnalyserStore>((set, get) => ({
  audioContext: null,
  localAnalyser: null,
  remoteAnalyser: null,

  initializeLocalAnalyser: (stream) => {
    const { audioContext: existingCtx, localAnalyser } = get();
    localAnalyser?.cleanup();

    const audioContext = existingCtx ?? new AudioContext();
    set({ audioContext, localAnalyser: new AudioAnalyser(audioContext, stream) });
  },

  initializeRemoteAnalyser: (stream) => {
    const { audioContext, remoteAnalyser: existingRemoteAnalyser } = get();
    existingRemoteAnalyser?.cleanup();

    if (!audioContext) {
      console.error(
        '❌ [AudioAnalyser] no audio context — initializeLocalAnalyser must be called first'
      );
      return;
    }
    set({ remoteAnalyser: new AudioAnalyser(audioContext, stream) });
  },

  getLocalAudioData: () => get().localAnalyser?.getFrequencyData() ?? EMPTY_AUDIO_DATA,
  getRemoteAudioData: () => get().remoteAnalyser?.getFrequencyData() ?? EMPTY_AUDIO_DATA,

  cleanup: () => {
    const { localAnalyser, remoteAnalyser, audioContext } = get();
    localAnalyser?.cleanup();
    remoteAnalyser?.cleanup();
    audioContext?.close();
    set({ audioContext: null, localAnalyser: null, remoteAnalyser: null });
  },
}));
