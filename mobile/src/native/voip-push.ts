import { NativeModules, Platform } from 'react-native';

type VoipPushTokenNativeModule = {
  getToken(): Promise<string | null>;
};

const { VoipPushToken } = NativeModules as {
  VoipPushToken?: VoipPushTokenNativeModule;
};

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
