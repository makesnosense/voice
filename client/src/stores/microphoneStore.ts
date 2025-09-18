import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';


type MicPermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'not-supported';

interface MicrophoneStore {
  stream: MediaStream | null;
  status: MicPermissionStatus;

  requestMicrophone: () => Promise<void>;
  cleanup: () => void;
}

export const useMicrophoneStore = create<MicrophoneStore>()(
  subscribeWithSelector((set, get) => ({
    stream: null,
    status: 'idle',

    requestMicrophone: async () => {
      const currentState = get();

      // already have a stream or currently requesting
      if (currentState.stream || currentState.status === 'requesting') {
        return;
      }

      set({ status: 'requesting' });

      if (!navigator.mediaDevices?.getUserMedia) {
        set({ status: 'not-supported' });
        return;
      }

      try {
        console.log('🎤 Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        console.log('✅ Microphone stream obtained');
        set({ stream, status: 'granted' });

      } catch (error) {
        console.error('❌ Microphone access denied:', error);
        set({ status: 'denied' });
      }
    },

    cleanup: () => {
      const { stream } = get();
      if (stream) {
        console.log('🧹 Cleaning up microphone stream');
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Stopped track:', track.kind);
        });
        set({ stream: null, status: 'idle' });
      }
    }
  }))
);