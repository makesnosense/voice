import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { ObjectValues } from '../../../shared/types';


export const MIC_PERMISSION_STATUS = {
  IDLE: 'idle',
  REQUESTING: 'requesting',
  GRANTED: 'granted',
  DENIED: 'denied',
  NOT_SUPPORTED: 'not-supported',
} as const;

export type MicPermissionStatus = ObjectValues<typeof MIC_PERMISSION_STATUS>;
export type MicErrorStatus = Exclude<MicPermissionStatus, ['granted', "idle", "requesting"]>;

interface MicrophoneStore {
  stream: MediaStream | null;
  status: MicPermissionStatus;

  requestMicrophone: () => Promise<void>;
  cleanup: () => void;
}

export const useMicrophoneStore = create<MicrophoneStore>()(
  subscribeWithSelector((set, get) => ({
    stream: null,
    status: MIC_PERMISSION_STATUS.IDLE,

    requestMicrophone: async () => {
      const currentState = get();

      // already have a stream or currently requesting
      if (currentState.stream || currentState.status === MIC_PERMISSION_STATUS.REQUESTING) {
        return;
      }

      set({ status: MIC_PERMISSION_STATUS.REQUESTING });

      if (!navigator.mediaDevices?.getUserMedia) {
        set({ status: MIC_PERMISSION_STATUS.NOT_SUPPORTED });
        return;
      }

      try {
        console.log('🎤 Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
        });

        console.log('✅ Microphone stream obtained');
        set({ stream, status: MIC_PERMISSION_STATUS.GRANTED });

      } catch (error) {
        console.error('❌ Microphone access denied:', error);
        set({ status: MIC_PERMISSION_STATUS.DENIED });
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
        set({ stream: null, status: MIC_PERMISSION_STATUS.IDLE });
      }
    }
  }))
);