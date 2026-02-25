import { create } from 'zustand';
import {
  mediaDevices,
  MediaStream as RNMediaStream,
} from 'react-native-webrtc';
import { PermissionsAndroid, Platform } from 'react-native';

import {
  MIC_PERMISSION_STATUS,
  type MicPermissionStatus,
} from '../../../shared/constants/microphone';

interface MicrophoneStore {
  stream: RNMediaStream | null;
  status: MicPermissionStatus;
  requestMicrophone: () => Promise<void>;
  cleanup: () => void;
}

const requestAndroidPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'microphone permission',
      message: 'Voice needs your microphone for calls',
      buttonPositive: 'allow',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const useMicrophoneStore = create<MicrophoneStore>((set, get) => ({
  stream: null,
  status: MIC_PERMISSION_STATUS.IDLE,

  requestMicrophone: async () => {
    const { stream, status } = get();
    if (stream || status === MIC_PERMISSION_STATUS.REQUESTING) return;

    set({ status: MIC_PERMISSION_STATUS.REQUESTING });

    const permitted = await requestAndroidPermission();
    if (!permitted) {
      set({ status: MIC_PERMISSION_STATUS.DENIED });
      return;
    }

    try {
      console.log('🎤 Requesting microphone access...');
      const newStream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      console.log('✅ Microphone stream obtained');
      set({
        stream: newStream,
        status: MIC_PERMISSION_STATUS.GRANTED,
      });
    } catch (error) {
      console.error('❌ Microphone access denied:', error);
      set({ status: MIC_PERMISSION_STATUS.DENIED });
    }
  },

  cleanup: () => {
    const { stream } = get();
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
      set({ stream: null, status: MIC_PERMISSION_STATUS.IDLE });
    }
  },
}));
