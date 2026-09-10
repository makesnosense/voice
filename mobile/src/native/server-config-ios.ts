import { NativeModules, Platform } from 'react-native';

type ServerConfigIosNativeModule = {
  devHost: string;
  prodHost: string;
};

const { ServerConfigIos } = NativeModules as {
  ServerConfigIos?: ServerConfigIosNativeModule;
};

export function getServerConfigIos(): ServerConfigIosNativeModule {
  if (Platform.OS !== 'ios') {
    throw new Error('ServerConfigIos is iOS-only');
  }
  if (!ServerConfigIos) {
    throw new Error('ServerConfigIos native module missing on iOS');
  }
  return ServerConfigIos;
}
