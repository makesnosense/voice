import { NativeModules } from 'react-native';

const { LockScreenBypass } = NativeModules;

export const revokeLockScreenBypass = (): void => {
  LockScreenBypass?.revokeLockScreenBypass();
};
