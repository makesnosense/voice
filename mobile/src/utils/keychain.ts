import * as Keychain from 'react-native-keychain';

// SERVICE acts as a namespace for Keychain
// REFRESH_TOKEN_KEY is "login" for which we return password – key

const SERVICE = 'org.voicepopuli.voice';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const keychainStorage = {
  async getRefreshToken(): Promise<string | null> {
    const result = await Keychain.getGenericPassword({ service: SERVICE });
    return result ? result.password : null;
  },

  async setRefreshToken(token: string): Promise<void> {
    await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, token, {
      service: SERVICE,
    });
  },

  async clearRefreshToken(): Promise<void> {
    await Keychain.resetGenericPassword({ service: SERVICE });
  },
};
