import { NativeModules } from 'react-native';

const { CallForegroundService } = NativeModules;

export const startCallForegroundService = (): void =>
  CallForegroundService?.start();
export const stopCallForegroundService = (): void =>
  CallForegroundService?.stop();
