import { NativeModules, Platform } from 'react-native';

export function runAndroidNativePermissions(): void {
  if (Platform.OS !== 'android') return;
  NativeModules.RunNativePermissions.run();
}
