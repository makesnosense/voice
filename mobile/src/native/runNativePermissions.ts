import { NativeModules } from 'react-native';

export function runNativePermissions(): void {
  NativeModules.RunNativePermissions.run();
}
