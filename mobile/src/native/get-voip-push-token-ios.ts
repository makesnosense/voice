import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  type NativeModule,
} from 'react-native';

type VoipPushTokenNativeModule = NativeModule & {
  getToken(): Promise<string | null>;
};

const { VoipPushToken } = NativeModules as {
  VoipPushToken?: VoipPushTokenNativeModule;
};

const voipPushTokenJsEmitter =
  Platform.OS === 'ios' && VoipPushToken
    ? new NativeEventEmitter(VoipPushToken)
    : null;

export async function getVoipPushToken(): Promise<string | null> {
  if (Platform.OS !== 'ios') return null;
  if (!VoipPushToken) {
    console.error('❌ VoipPushToken native module missing on iOS');
    return null;
  }

  try {
    const token = await VoipPushToken.getToken();
    if (token) {
      console.log('✅ VoIP token obtained:', token.substring(0, 20) + '...');
      return token;
    }
    console.warn('⚠️ VoIP token not ready yet');
    return null;
  } catch (error) {
    console.error('❌ VoIP token failed:', error);
    return null;
  }
}

// if apple rotates the voip token while js is running
export function listenForVoipTokenRefreshIos(
  callback: (token: string | null) => void,
) {
  if (Platform.OS !== 'ios') return () => {};

  if (!voipPushTokenJsEmitter) {
    console.error('❌ VoipPushToken native module missing on iOS');
    return () => {};
  }

  const subscription = voipPushTokenJsEmitter.addListener(
    'voipTokenUpdated',
    payload => {
      if (typeof payload !== 'object' || payload === null) return;
      const { token } = payload as Record<string, unknown>;

      if (token === null) {
        console.log('🔄 VoIP token invalidated');
        callback(null);
        return;
      }

      if (typeof token !== 'string') return;

      console.log('🔄 VoIP token refreshed:', token.substring(0, 20) + '...');
      callback(token);
    },
  );

  return () => subscription.remove();
}
