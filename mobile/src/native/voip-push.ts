import { NativeModules, Platform } from 'react-native';

type VoipPushNativeModule = {
  getToken(): Promise<string | null>;
};

const { VoipPush } = NativeModules as { VoipPush?: VoipPushNativeModule };

export async function getVoipPushToken(): Promise<string | null> {
  if (Platform.OS !== 'ios') return null;
  if (!VoipPush) {
    console.error('❌ VoipPush native module missing on iOS');
    return null;
  }

  try {
    const token = await VoipPush.getToken();
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
